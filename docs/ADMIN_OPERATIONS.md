# Manual del panel de administracion

## Acceso

Panel principal:

<https://precious-concha-6f7bce.netlify.app/admin/>

El panel carga siempre la version actual de `data.json`. Si se abre en varias pestanas, se recomienda terminar y publicar los cambios en una antes de editar desde otra.

En el Mac principal tambien se puede abrir el proyecto en Finder y hacer doble clic en `打开后台.command`. Este acceso local entra directamente sin contrasena, escucha solamente en `127.0.0.1` y usa las credenciales Git ya guardadas en el Mac para publicar. La ventana de Terminal debe permanecer abierta mientras se utiliza el panel.

## Productos

1. Abrir `Productos`.
2. Seleccionar `Editar` o `+ Nuevo producto`.
3. Completar nombre, categoria, descripcion, precios e imagen.
4. Para precios por tamano, rellenar S, M y L juntos.
5. Comprobar que `S < M < L`.
6. Guardar el producto.
7. Entrar en `Publicar` y guardar en la nube si el cambio no se ha publicado automaticamente.

Los numeros grises que aparecen en campos vacios son ejemplos, no precios guardados. Un producto incompleto conserva el rango de precio anterior y muestra `Falta S/M/L` solamente en el panel.

Los productos de `Cestas y Ramos Secos` y `Flores Preservadas` muestran un solo campo `Precio`. En la web aparecen con la indicacion `Talla unico` y no requieren S, M y L.

## Miembros

1. Abrir `Miembros` y pulsar `+ Nuevo miembro`.
2. Registrar como minimo el nombre.
3. Completar telefono, email, cumpleanos, ciudad, origen y preferencias cuando el cliente los facilite.
4. Activar el consentimiento de promociones solamente si existe autorizacion.
5. Dejar `Nivel manual` en automatico salvo que haya una razon comercial para fijarlo.

La ficha individual muestra contacto, preferencias, consumo, puntos, nivel, etiquetas, historial y una lectura automatica del siguiente paso comercial.

## Consumos y puntos

1. Abrir `Consumos` o pulsar `+ Consumo` desde un miembro.
2. Seleccionar cliente y fecha.
3. Introducir el importe antes de descuento.
4. Marcar `Usar puntos disponibles` cuando corresponda.
5. Revisar la vista previa de puntos usados, descuento, importe a cobrar y puntos nuevos.
6. Completar pago, pedido, motivo, producto y canal.
7. Guardar el consumo.

Reglas:

- 1 EUR cobrado genera 1 punto entero.
- 20 puntos descuentan 1 EUR.
- 100 puntos descuentan 5 EUR.
- Una compra de 100 EUR con 5 EUR de puntos cobra 95 EUR y genera 95 puntos.
- Al editar un consumo, el calculo excluye temporalmente ese consumo para no contar dos veces sus puntos.

## Analisis

`Analisis` se actualiza a partir de las fichas y consumos guardados. Para obtener resultados utiles conviene registrar:

- Fecha de nacimiento y ciudad.
- Como conocio la tienda.
- Motivo de cada compra.
- Tipo de producto.
- Canal de venta.
- Consentimiento comercial.

El panel identifica automaticamente clientes nuevos, recurrentes, fieles, de alto valor, en riesgo, inactivos, sin compras y con cumpleanos proximo.

## Publicacion

1. Revisar que no queden formularios abiertos.
2. Abrir `Publicar`.
3. Guardar los cambios en GitHub.
4. Esperar a que termine el despliegue automatico.
5. Comprobar el panel de Netlify y la web publica.

La confirmacion correcta requiere que el commit aparezca en `main` y que GitHub Pages y Netlify hayan desplegado ese commit.

## CMS avanzado

`admin/cms.html` permite editar la estructura completa de `data.json`. Debe reservarse para cambios avanzados porque una edicion de listas o identificadores afecta a varias partes del sitio.

## Recuperacion

GitHub conserva cada publicacion como commit. Ante un error:

1. No seguir publicando sobre datos incorrectos.
2. Identificar el ultimo commit correcto.
3. Comparar especialmente `data.json` y las imagenes nuevas.
4. Restaurar solo los archivos afectados mediante un commit nuevo.
5. Verificar de nuevo ambos despliegues.

No se debe sustituir el proyecto por el antiguo ZIP de la funcion de miembros. Ese paquete es anterior al analisis de clientes, al sistema de puntos actualizado, a las mejoras moviles y a los precios S/M/L.

## Lista de comprobacion periodica

- Confirmar que la web carga `data.json` sin errores.
- Revisar productos sin foto o sin precios S/M/L.
- Comprobar clientes sin datos de contacto o sin consentimiento registrado.
- Revisar consumos sin motivo, producto o canal.
- Confirmar que los puntos y descuentos coinciden con el importe cobrado.
- Verificar que GitHub Pages y Netlify muestran el mismo contenido.
- Mantener fuera del repositorio contrasenas, tokens y documentos sensibles.
