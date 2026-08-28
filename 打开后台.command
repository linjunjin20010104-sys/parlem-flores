#!/bin/zsh

cd "$(dirname "$0")" || exit 1

if ! command -v node >/dev/null 2>&1; then
  osascript -e 'display alert "Parlem Flores" message "No se encontro Node.js en este Mac." as critical'
  exit 1
fi

exec node tools/local-admin-server.mjs "$@"
