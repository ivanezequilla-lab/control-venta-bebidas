/* =============================================================
   SERVICE WORKER - Control de Venta de Bebidas
   -------------------------------------------------------------
   Es un script que el navegador ejecuta en segundo plano. Aqui
   hace dos cosas:
   1) Guarda en cache los archivos de la app para que abra aunque
      no haya internet.
   2) Intercepta cada peticion y decide si responde desde cache
      o desde la red.

   COMPATIBILIDAD CON GITHUB PAGES
   -------------------------------------------------------------
   GitHub Pages publica los proyectos en una SUBCARPETA:
       https://usuario.github.io/nombre-del-repo/
   Por eso NUNCA usamos rutas absolutas como "/index.html" (esas
   apuntarian a usuario.github.io/index.html y fallarian). Todas
   las rutas aqui son relativas ("./index.html"), asi funciona
   igual en una subcarpeta, en un dominio propio o en localhost.

   IMPORTANTE: las llamadas a Google Sheets / Apps Script / Google
   Fonts son de OTRO dominio. El Service Worker las deja pasar
   sin tocarlas, asi que el guardado y la lectura de ventas siguen
   funcionando exactamente igual que antes.
============================================================= */

// Version de la cache. CADA VEZ que publiques cambios en index.html,
// sube este numero (v2, v3...) para que los celulares descarguen la
// version nueva y borren la vieja.
const CACHE_NAME = 'venta-bebidas-v1';

// Archivos que se guardan al instalar (el "cascaron" de la app).
// Rutas relativas a la ubicacion de este service-worker.js.
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png'
];

/* -------------------------------------------------------------
   EVENTO "install": se ejecuta al instalar el Service Worker.
   Abrimos la cache y guardamos todo el APP_SHELL.
------------------------------------------------------------- */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Guardando el cascaron de la app en cache...');
      return cache.addAll(APP_SHELL);
    })
  );
  // Activa esta version de inmediato, sin esperar a que se cierre la app.
  self.skipWaiting();
});

/* -------------------------------------------------------------
   EVENTO "activate": se ejecuta cuando el SW toma el control.
   Borramos las caches de versiones anteriores para no acumular
   archivos viejos en el celular.
------------------------------------------------------------- */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((nombres) =>
      Promise.all(
        nombres
          .filter((nombre) => nombre !== CACHE_NAME)
          .map((nombre) => {
            console.log('[SW] Borrando cache antigua:', nombre);
            return caches.delete(nombre);
          })
      )
    )
  );
  // Toma control de las pestanas abiertas sin necesidad de recargar.
  self.clients.claim();
});

/* -------------------------------------------------------------
   EVENTO "fetch": se ejecuta en CADA peticion de la app.
------------------------------------------------------------- */
self.addEventListener('fetch', (event) => {
  const peticion = event.request;

  // Solo manejamos lecturas (GET). Los POST (como el guardado de
  // ventas en Apps Script) pasan directo a la red sin tocarlos.
  if (peticion.method !== 'GET') return;

  const url = new URL(peticion.url);

  // Si es de OTRO dominio (Google Sheets, Fonts, Apps Script...),
  // no intervenimos: el navegador la maneja normalmente.
  if (url.origin !== self.location.origin) return;

  // CASO 1: el usuario abre/recarga la app (navegacion a una pagina).
  // Estrategia "red primero": intenta traer la version mas nueva de
  // internet; si no hay conexion, usa la copia guardada. Asi, cuando
  // publiques una actualizacion, se ve en cuanto haya internet.
  if (peticion.mode === 'navigate') {
    event.respondWith(
      fetch(peticion)
        .then((respuestaRed) => {
          const copia = respuestaRed.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('./index.html', copia));
          return respuestaRed;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // CASO 2: archivos estaticos (iconos, manifest...).
  // Estrategia "cache primero": si ya esta guardado, responde al
  // instante; si no, lo pide a la red y lo guarda para la proxima.
  event.respondWith(
    caches.match(peticion).then((guardado) => {
      if (guardado) return guardado;
      return fetch(peticion).then((respuestaRed) => {
        // Una respuesta solo se puede leer una vez, por eso se clona:
        // una copia va a la cache y la otra al navegador.
        const copia = respuestaRed.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(peticion, copia));
        return respuestaRed;
      });
    })
  );
});
