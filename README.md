# Control de Venta de Bebidas (PWA)

## Archivos del proyecto

```
index.html           <- la app
manifest.json        <- nombre, colores e iconos de la app instalada
service-worker.js    <- cache y funcionamiento offline
.nojekyll            <- evita que GitHub Pages procese los archivos con Jekyll
icons/
  icon-192.png
  icon-512.png
  apple-touch-icon.png
generate_icons.py    <- (opcional) regenera los iconos, no hace falta subirlo
```

## Publicar en GitHub Pages

1. Crea un repositorio nuevo en GitHub (ej: `venta-bebidas`).
2. Sube TODOS los archivos de esta carpeta a la raiz del repositorio
   (incluida la carpeta `icons` y el archivo `.nojekyll`).
3. En el repositorio: **Settings > Pages**.
4. En "Build and deployment" elige **Source: Deploy from a branch**,
   rama **main**, carpeta **/ (root)** y guarda.
5. Espera 1-2 minutos. Tu app quedara en:
   `https://TU-USUARIO.github.io/venta-bebidas/`
6. Abre esa URL en el celular:
   - **Android (Chrome):** aparece el boton "Instalar app" (o menu > Instalar aplicacion).
   - **iPhone (Safari):** Compartir > "Agregar a pantalla de inicio".

## Actualizar la app despues de un cambio

Cuando modifiques `index.html`, sube el numero de version en
`service-worker.js` (`venta-bebidas-v1` -> `venta-bebidas-v2`) para que los
celulares descarguen la version nueva.

## Seguridad (importante)

GitHub Pages gratis requiere repositorio publico, asi que la API key,
el ID de la hoja y la URL de Apps Script del `index.html` seran visibles.
En Google Cloud Console restringe la API key por **referrer HTTP** a
`https://TU-USUARIO.github.io/*` y solo a la API de Google Sheets.
