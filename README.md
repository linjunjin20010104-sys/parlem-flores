# Parlem Flores

Sitio web y panel de administracion de Parlem Flores. Este repositorio es la fuente oficial del proyecto: contiene la web publica, el catalogo, las imagenes, el panel interno, los clientes, los consumos, el programa de puntos y la configuracion de despliegue.

## Enlaces

- Web publica: <https://parlemflores.com>
- Panel principal: <https://precious-concha-6f7bce.netlify.app/admin/>
- CMS avanzado: <https://precious-concha-6f7bce.netlify.app/admin/cms.html>
- Repositorio: <https://github.com/linjunjin20010104-sys/parlem-flores>

## Arquitectura

- Frontend estatico: HTML, CSS y JavaScript sin framework.
- Datos actuales: `data.json`.
- Imagenes: `img/`.
- Administracion personalizada: `admin/index.html`.
- Administracion alternativa con token: `admin/token.html`.
- CMS avanzado: Decap CMS mediante `admin/cms.html` y `admin/config.yml`.
- Versionado y publicacion: GitHub `main`, GitHub Pages y Netlify.

## Funciones incluidas

- Catalogo por categorias y subcategorias.
- Precios por tamanos S, M y L, con precio unico para preservados y secos y compatibilidad con precios anteriores.
- Productos, ramos de temporada, imagenes y configuracion del sitio.
- Fichas completas de clientes y preferencias.
- Historial de consumos y forma de pago.
- Programa de fidelidad: acumulacion y canje de puntos.
- Niveles Bronce, Plata, Oro y VIP.
- Segmentacion y analisis de clientes.
- Contacto y pedidos mediante WhatsApp.
- Diseno adaptable para ordenador y movil.

## Documentacion

- [Resumen completo del proyecto](docs/PROJECT_OVERVIEW.md)
- [Estructura de datos](docs/DATA_MODEL.md)
- [Manual del panel y publicacion](docs/ADMIN_OPERATIONS.md)

## Fuente de datos

`data.json` es la fuente de datos usada por la web y por el panel. No se deben mantener copias editables separadas ni sustituirlo por paquetes antiguos. Las modificaciones realizadas en el panel deben publicarse para que queden guardadas en GitHub y lleguen a la web.

## Privacidad

La arquitectura actual sirve `data.json` como archivo estatico, por lo que las fichas de clientes y sus consumos no tienen el aislamiento de una base de datos privada. No se deben guardar documentos de identidad, tarjetas, datos medicos ni otra informacion especialmente sensible. La migracion de clientes y consumos a un almacenamiento privado es la mejora de seguridad prioritaria.

## Archivos historicos

El paquete `parlem-flores-member-feature.zip` y `member-feature.patch` se revisaron el 28 de agosto de 2026. Todos sus archivos ya estan representados por versiones mas recientes en este repositorio. No forman parte de la fuente oficial porque duplicarlos aumentaria el tamano y podria restaurar codigo antiguo por error.
