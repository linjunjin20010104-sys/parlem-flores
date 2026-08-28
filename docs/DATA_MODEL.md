# Estructura de datos

## Archivo principal

Toda la informacion editable se encuentra actualmente en `data.json`. El archivo contiene un objeto JSON con estas secciones:

| Seccion | Tipo | Uso |
| --- | --- | --- |
| `site` | objeto | Marca, portada, contacto, textos y servicios |
| `occasions` | lista | Ocasiones o accesos comerciales opcionales |
| `categories` | lista | Categorias y subcategorias del catalogo |
| `products` | lista | Productos y precios |
| `seasonal` | lista | Ramos de temporada |
| `testimonials` | lista | Opiniones mostradas en la web |
| `members` | lista | Fichas de clientes y miembros |
| `member_transactions` | lista | Consumos vinculados a miembros |

## `site`

Campos usados actualmente:

- Identidad: `name`, `tagline`, `hero_title`, `hero_subtitle`, `hero_badge`.
- Portada: `hero_image`, `hero_image_opacity`, `hero_tags`.
- Floristeria: `about_name`, `about_text`, `about_stats`, `wedding_text`.
- Contacto: `address`, `phone`, `whatsapp`, `email`, `instagram`, `hours`, `delivery_info`.
- Navegacion y servicios: `nav_links`, `services`, `top_bar_text`.

## `categories`

Cada elemento puede contener:

- `id`: identificador estable utilizado por los productos.
- `name`: nombre visible.
- `subcategories`: lista opcional de objetos con `id` y `name`.

No se debe cambiar un `id` utilizado sin actualizar tambien los productos asociados.

## `products`

| Campo | Descripcion |
| --- | --- |
| `id` | Identificador numerico unico |
| `category` | ID de categoria |
| `subcategory` | ID de subcategoria opcional |
| `name` | Nombre comercial |
| `description` | Descripcion visible |
| `price_s` | Precio del tamano S |
| `price_m` | Precio del tamano M |
| `price_l` | Precio del tamano L |
| `price` | Precio anterior desde; compatibilidad |
| `price_max` | Precio anterior hasta; compatibilidad |
| `price_label` | Texto complementario del precio |
| `image` | Ruta de imagen, normalmente `/img/...` |
| `badge` | Etiqueta comercial opcional |
| `available` | Visibilidad en la web |

Un producto cambia al formato S/M/L solamente cuando los tres campos contienen importes mayores que cero. Las categorias `cestas-ramos-secos` y `flores-preservadas` son la excepcion: usan un unico `price`, dejan `price_s`, `price_m` y `price_l` en cero y se muestran como `Talla unico`.

## `seasonal`

Cada ramo de temporada contiene `name`, `image`, `price`, `price_max`, `price_label` y `available`. Esta seccion mantiene el formato de rango de precios y no utiliza los campos S/M/L de producto.

## `members`

Campos de identificacion y contacto:

- `id`, `name`, `phone`, `email`, `birthday`.
- `customer_type`, `language`, `city`, `postal_code`.

Campos comerciales y preferencias:

- `source`: como conocio la floristeria.
- `preferred_contact`: canal de contacto preferido.
- `preferred_flowers`, `preferred_colors`, `budget`.
- `anniversary`: aniversario u otra fecha importante.

Campos de gestion:

- `level`: nivel manual; vacio significa calculo automatico.
- `status`: `active` o `inactive`.
- `marketing_consent`: autorizacion para comunicaciones comerciales.
- `notes`, `created_at`, `updated_at`.

No se guardan puntos ni gasto acumulado directamente en la ficha. Se calculan siempre desde los consumos para evitar saldos duplicados o incoherentes.

## `member_transactions`

| Campo | Descripcion |
| --- | --- |
| `id` | Identificador numerico unico |
| `member_id` | Relacion con `members.id` |
| `date` | Fecha en formato `YYYY-MM-DD` |
| `total_amount` | Importe antes de aplicar puntos |
| `amount` | Importe realmente cobrado |
| `points_used` | Puntos descontados en esta compra |
| `discount` | Valor monetario de los puntos usados |
| `payment` | Forma de pago |
| `order` | Referencia o descripcion del pedido |
| `occasion` | Motivo de compra |
| `product_type` | Tipo de producto vendido |
| `channel` | Canal de venta |
| `notes` | Observaciones internas |
| `updated_at` | Fecha de ultima edicion |

## Calculos derivados

- Puntos obtenidos por consumo: `floor(amount)`.
- Saldo de puntos: suma de puntos obtenidos menos suma de `points_used`.
- Valor para descuento: saldo de puntos multiplicado por `0.05`.
- Gasto acumulado del miembro: suma de `amount`.
- Ticket medio: gasto acumulado dividido por numero de consumos.
- Nivel automatico: se obtiene a partir del gasto acumulado cobrado.

Ejemplo: un pedido de 100 EUR que usa 100 puntos aplica 5 EUR, guarda `total_amount: 100`, `amount: 95`, `points_used: 100`, `discount: 5` y genera 95 puntos nuevos.

## Integridad y copias

- Cada producto, miembro y consumo debe tener un `id` unico dentro de su lista.
- Cada `member_transactions.member_id` debe corresponder a un miembro existente.
- Las cantidades monetarias son numeros, no texto con simbolo de moneda.
- Las fechas se guardan como `YYYY-MM-DD`.
- Las imagenes deben existir en `img/` antes de publicar una ruta nueva.
- Git conserva el historial, pero antes de una importacion masiva conviene guardar una copia local del `data.json` vigente.

## Privacidad

`data.json` se publica actualmente como parte del sitio. No se deben incorporar documentos, numeros de tarjeta, contrasenas, datos de salud ni identificadores oficiales. Los datos de clientes requieren una futura migracion a almacenamiento privado para aplicar control de acceso real y cumplir mejor con las obligaciones de privacidad.
