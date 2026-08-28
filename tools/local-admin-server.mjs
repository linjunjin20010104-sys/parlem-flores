#!/usr/bin/env node

import { createServer } from "node:http";
import { readFile, writeFile, rename, stat } from "node:fs/promises";
import { spawn, spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const host = "127.0.0.1";
const startPort = Number(process.env.PARLEM_ADMIN_PORT) || 8765;
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const noOpen = process.argv.includes("--no-open");
const apiPrefix = "/.netlify/git/github/contents/";
const writableImage = /^img\/[a-zA-Z0-9._-]+\.(?:jpe?g|png|webp)$/i;

const mimeTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".png", "image/png"],
  [".webp", "image/webp"],
  [".svg", "image/svg+xml"],
  [".ico", "image/x-icon"]
]);

function git(args, { allowFailure = false } = {}) {
  const result = spawnSync("git", args, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
  if (result.status !== 0 && !allowFailure) {
    throw new Error((result.stderr || result.stdout || `git ${args[0]} failed`).trim());
  }
  return (result.stdout || "").trim();
}

function sendJson(res, statusCode, value) {
  const body = JSON.stringify(value);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Cache-Control": "no-store"
  });
  res.end(body);
}

function sendError(res, statusCode, error) {
  sendJson(res, statusCode, { message: error instanceof Error ? error.message : String(error) });
}

async function readRequestBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 30 * 1024 * 1024) throw new Error("El archivo supera el limite local de 30 MB.");
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

function cleanRelativePath(value) {
  const decoded = decodeURIComponent(String(value || "")).replace(/^\/+/, "");
  const normalized = path.posix.normalize(decoded);
  if (!normalized || normalized.startsWith("../") || normalized.includes("/../") || path.isAbsolute(normalized)) {
    throw new Error("Ruta no permitida.");
  }
  return normalized;
}

function absoluteProjectPath(relativePath) {
  const absolute = path.resolve(root, relativePath);
  if (absolute !== root && !absolute.startsWith(`${root}${path.sep}`)) throw new Error("Ruta fuera del proyecto.");
  return absolute;
}

function repositoryIsClean() {
  return git(["status", "--porcelain"]) === "";
}

function syncFromRemote() {
  if (!repositoryIsClean()) return;
  git(["fetch", "origin", "main"]);
  const localHead = git(["rev-parse", "HEAD"]);
  const remoteHead = git(["rev-parse", "origin/main"]);
  if (localHead === remoteHead) return;
  const localIsAncestor = spawnSync("git", ["merge-base", "--is-ancestor", localHead, remoteHead], { cwd: root }).status === 0;
  if (localIsAncestor) {
    git(["merge", "--ff-only", "origin/main"]);
    return;
  }
  const remoteIsAncestor = spawnSync("git", ["merge-base", "--is-ancestor", remoteHead, localHead], { cwd: root }).status === 0;
  if (!remoteIsAncestor) throw new Error("La copia local y GitHub tienen cambios diferentes. Revisa Git antes de continuar.");
}

function currentFileSha(relativePath) {
  return git(["hash-object", "--", relativePath]);
}

async function handleContentsApi(req, res, url) {
  const relativePath = cleanRelativePath(url.pathname.slice(apiPrefix.length));
  const absolutePath = absoluteProjectPath(relativePath);

  if (req.method === "GET") {
    syncFromRemote();
    const content = await readFile(absolutePath);
    return sendJson(res, 200, {
      name: path.basename(relativePath),
      path: relativePath,
      sha: currentFileSha(relativePath),
      content: content.toString("base64"),
      encoding: "base64"
    });
  }

  if (req.method !== "PUT") return sendError(res, 405, "Metodo no permitido.");
  if (relativePath !== "data.json" && !writableImage.test(relativePath)) {
    return sendError(res, 403, "El administrador local solo puede guardar data.json e imagenes del catalogo.");
  }

  syncFromRemote();
  const payload = await readRequestBody(req);
  if (!payload.content || typeof payload.content !== "string") return sendError(res, 400, "Falta el contenido del archivo.");

  if (payload.sha) {
    try {
      if (payload.sha !== currentFileSha(relativePath)) {
        return sendError(res, 409, "El archivo cambio en GitHub. Recarga el panel antes de volver a guardar.");
      }
    } catch {
      return sendError(res, 409, "El archivo que intentas actualizar ya no existe.");
    }
  }

  const content = Buffer.from(payload.content.replace(/\s/g, ""), "base64");
  if (!content.length) return sendError(res, 400, "El archivo esta vacio.");
  if (relativePath === "data.json") JSON.parse(content.toString("utf8"));

  const temporaryPath = `${absolutePath}.parlem-tmp`;
  await writeFile(temporaryPath, content);
  await rename(temporaryPath, absolutePath);

  git(["add", "--", relativePath]);
  const message = String(payload.message || "Update Parlem Flores data").slice(0, 120);
  const commitResult = spawnSync("git", ["commit", "-m", message, "--", relativePath], {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
  if (commitResult.status !== 0) {
    const combined = `${commitResult.stdout || ""}\n${commitResult.stderr || ""}`;
    if (!combined.includes("nothing to commit") && !combined.includes("no changes added to commit")) {
      throw new Error(combined.trim());
    }
  }

  git(["push", "origin", "HEAD:main"]);
  return sendJson(res, 200, {
    content: { path: relativePath, sha: currentFileSha(relativePath) },
    commit: { sha: git(["rev-parse", "HEAD"]) }
  });
}

async function serveStatic(req, res, url) {
  let relativePath = cleanRelativePath(url.pathname === "/" ? "admin/index.html" : url.pathname);
  if (relativePath === "admin") relativePath = "admin/index.html";
  if (relativePath.endsWith("/")) relativePath += "index.html";
  if (relativePath.startsWith(".git/") || relativePath === ".git") return sendError(res, 404, "No encontrado.");

  const absolutePath = absoluteProjectPath(relativePath);
  const details = await stat(absolutePath);
  if (!details.isFile()) return sendError(res, 404, "No encontrado.");
  const content = await readFile(absolutePath);
  res.writeHead(200, {
    "Content-Type": mimeTypes.get(path.extname(relativePath).toLowerCase()) || "application/octet-stream",
    "Content-Length": content.length,
    "Cache-Control": relativePath === "data.json" ? "no-store" : "no-cache",
    "X-Content-Type-Options": "nosniff"
  });
  res.end(content);
}

async function requestHandler(req, res) {
  try {
    const url = new URL(req.url || "/", `http://${host}`);
    if (url.pathname === "/__local/status") {
      return sendJson(res, 200, {
        ok: true,
        project: "Parlem Flores",
        branch: git(["branch", "--show-current"]),
        commit: git(["rev-parse", "HEAD"]),
        clean: repositoryIsClean()
      });
    }
    if (url.pathname.startsWith(apiPrefix)) return await handleContentsApi(req, res, url);
    if (req.method !== "GET" && req.method !== "HEAD") return sendError(res, 405, "Metodo no permitido.");
    return await serveStatic(req, res, url);
  } catch (error) {
    const statusCode = error?.code === "ENOENT" ? 404 : 500;
    sendError(res, statusCode, error);
  }
}

function startServer(port) {
  const server = createServer(requestHandler);
  server.on("error", error => {
    if (error.code === "EADDRINUSE" && port < startPort + 10) return startServer(port + 1);
    console.error(`No se pudo abrir el administrador local: ${error.message}`);
    process.exitCode = 1;
  });
  server.listen(port, host, () => {
    const url = `http://${host}:${port}/admin/`;
    console.log("Parlem Flores - administrador local");
    console.log(`Abierto en: ${url}`);
    console.log("Mantén esta ventana abierta mientras uses el panel. Pulsa Control+C para cerrar.");
    if (!noOpen) spawn("open", [url], { detached: true, stdio: "ignore" }).unref();
  });
}

try {
  syncFromRemote();
  startServer(startPort);
} catch (error) {
  console.error(`No se pudo preparar el proyecto: ${error.message}`);
  process.exitCode = 1;
}
