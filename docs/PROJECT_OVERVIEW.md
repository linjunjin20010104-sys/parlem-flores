# Parlem Flores: resumen del proyecto

## Objetivo

El proyecto combina una web publica de floristeria con un panel de administracion para gestionar catalogo, contenido, clientes, consumos, puntos y analisis comercial. Se conserva la implementacion existente y cada ampliacion se integra sobre la misma estructura.

## Componentes

| Componente | Archivo | Responsabilidad |
| --- | --- | --- |
| Web publica | `index.html` | Estructura principal del sitio |
| Variante historica | `index-2.html` | Pagina alternativa conservada por compatibilidad |
| Logica publica | `main.js` | Carga de datos, catalogo, filtros, precios y WhatsApp |
| Estilos | `style.css` | Diseno de escritorio y movil |
| Datos | `data.json` | Contenido, productos, clientes y consumos |
| Panel principal | `admin/index.html` | Administracion mediante Netlify Identity/Git Gateway |
| Panel alternativo | `admin/token.html` | Administracion directa de GitHub como respaldo |
| CMS avanzado | `admin/cms.html` | Entrada a Decap CMS |
| Esquema CMS | `admin/config.yml` | Campos editables por Decap CMS |
| Imagenes | `img/` | Fotografias publicadas en catalogo y portada |
| Netlify | `netlify.toml` | Publicacion y cabeceras HTTP |
| Dominio | `CNAME` | Dominio personalizado de GitHub Pages |

## Flujo de datos

1. La web descarga `data.json` al abrirse.
2. `main.js` crea en el navegador los bloques de contenido, categorias y productos.
3. El panel descarga el mismo `data.json` desde GitHub.
4. El administrador modifica una copia en memoria.
5. Al publicar, el panel guarda `data.json` y las imagenes nuevas en la rama `main`.
6. GitHub Pages y Netlify despliegan el nuevo commit.

No hay actualmente un servidor de aplicacion ni una base de datos SQL. GitHub y `data.json` funcionan como almacenamiento y registro de versiones.

## Catalogo y precios

Cada producto pertenece a una categoria y puede incluir subcategoria, descripcion, foto, insignia y disponibilidad.

- Si `price_s`, `price_m` y `price_l` contienen valores validos, la web muestra los tres tamanos.
- Los tres precios se rellenan juntos y deben cumplir `S < M < L`.
- Los productos de `cestas-ramos-secos` y `flores-preservadas` usan un solo `price` y se muestran como `Talla unico`.
- Mientras no esten completos, la web conserva `price` y `price_max` como formato anterior.
- El panel no inventa ni migra automaticamente los precios comerciales.

## Clientes y fidelidad

El panel incluye:

- Alta, edicion, baja y busqueda de clientes.
- Informacion de contacto, ubicacion, idioma, origen y preferencias.
- Consentimiento de promociones.
- Ficha individual con historial de consumos.
- Etiquetas automaticas: nuevo, recurrente, fiel, alto valor, en riesgo, inactivo, sin compras y cumpleanos proximo.
- Analisis de edad, ciudad, origen, ocasiones, productos y canales de venta.

Reglas actuales del programa:

- Cada euro realmente cobrado genera 1 punto entero.
- 20 puntos equivalen a 1 EUR; cada punto equivale a 0,05 EUR.
- Los puntos canjeados reducen el importe cobrado.
- Los puntos nuevos se calculan sobre el importe cobrado despues del descuento.
- Bronce: desde 0 EUR acumulados.
- Plata: desde 250 EUR acumulados.
- Oro: desde 500 EUR acumulados.
- VIP: desde 1.000 EUR acumulados.

Los niveles se calculan sobre la suma de importes realmente cobrados, salvo que el administrador establezca un nivel manual.

## Analisis de clientes

El panel calcula sus indicadores directamente en el navegador a partir de `members` y `member_transactions`. No utiliza un servicio externo de analitica ni envia estos datos a otro proveedor.

Los principales indicadores son:

- Clientes registrados, nuevos y activos.
- Tasa de repeticion y ticket medio.
- Calidad o completitud de las fichas.
- Clientes que aceptan promociones.
- Distribucion por nivel, edad, ciudad y origen.
- Motivos de compra, tipos de producto y canales.
- Proximas acciones por cumpleanos, inactividad o cercania al siguiente nivel.

## Despliegue

La rama oficial es `main`. Cada cambio confirmado se envia a GitHub y activa el despliegue automatico. Las dos plataformas deben apuntar al mismo commit para evitar diferencias entre el dominio publico y el panel de Netlify.

## Limites actuales

- `data.json` es un archivo estatico y puede ser solicitado desde internet.
- Las escrituras dependen de GitHub, la autenticacion y la configuracion de Netlify.
- Dos administradores publicando simultaneamente pueden crear conflictos de version.
- No hay auditoria de permisos por roles ni separacion por sucursal.
- Los calculos de cliente se realizan en el navegador y no en un backend protegido.

La evolucion recomendada es mover `members` y `member_transactions` a una base de datos privada con API autenticada, conservando el catalogo publico en el formato actual si sigue resultando practico.
