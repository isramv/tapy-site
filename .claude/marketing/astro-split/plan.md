# Separar tapy.mx (marketing, Astro) de app.tapy.mx (app, Nuxt)

## Context

Hoy `web/` (Nuxt SPA, `ssr: false`, Cloudflare Pages) sirve **el mismo build** en tapy.mx y app.tapy.mx. El marketing carga todo el bundle de la app (PrimeVue, Supabase, FormKit), y la única separación es un check de host en `pages/index.vue:42-50`. El objetivo es tener un repo nuevo, **`tapy-site`**, en Astro estático: rápido, solo marketing, en tapy.mx. La app se queda en app.tapy.mx.

Decisiones tomadas:
- Español e inglés, con `/en/` para inglés.
- Repo `~/Sites/tappy-taste/tapy-site`, hospedado en Cloudflare Pages.
- El formulario de contacto sigue usando `app.tapy.mx/api/contact`.
- `/cafeterias`, `/heladerias` y `/links` se quedan solo en español.
- Port 1:1, sin rediseño.

**Riesgo principal:** las instalaciones de desktop y Android que ya están en uso traen `NUXT_PUBLIC_WEB_API_URL=https://tapy.mx` fijo desde que se compilaron. Si tapy.mx pasa a ser estático, sus llamadas a `/api/*` dan 404 y esas cajas dejan de sincronizar. Por eso los 3 clientes se migran **antes** de mover el dominio (ver sección 2b).

## 1. Repo nuevo `tapy-site` (Astro)

- `npm create astro` con el template mínimo, más `@astrojs/tailwind` o Tailwind v4 vía Vite. Salida `output: 'static'`.
- **Tema:** copiar de `web/tailwind.config.js` los colores `negro`, `crema` y `amarillo`, las fuentes `sans`/`display` = Blinker y `body` = Beiruti, y el breakpoint `tablet: 960px`. Mantener `preflight` apagado para que el port sea idéntico (ver la memoria no-tailwind-preflight). Las clases propias (`btn-amarillo`, `contact-text-amarillo`, `ty-text-amarillo`) se sacan de `web/assets/base.css` y `web/assets/tailwind.css`.
- **Fuentes:** `@fontsource-variable/blinker` (o `@fontsource/blinker`) y `@fontsource/beiruti`, hospedadas en el propio sitio, sin pedir nada a Google.
- **i18n:** el i18n nativo de Astro con `defaultLocale: 'es'`, `locales: ['es','en']` y `prefixDefaultLocale: false`. Los textos van en `src/i18n/es.ts` y `src/i18n/en.ts`, con una función `t(locale, key)` de pocas líneas. Se copian las ~155 claves de marketing desde `web/i18n/i18n.config.ts`, conservando las mismas claves.
- **Páginas,** con las mismas rutas para no perder SEO ni las conversiones de Google Ads:
  - `src/pages/index.astro`, `contact-us.astro`, `thank-you.astro` y `privacidad.astro`, más sus versiones en `src/pages/en/…`. Cada página es una plantilla compartida que recibe el `locale`.
  - `cafeterias.astro`, `heladerias.astro` y `links.astro`, solo en español y con el mismo texto fijo.
- **Componentes:** `src/components/{Hero,Features,Features2,Features3,Steps,Contact,Footer}.astro`, portados de `web/components/Marketing/*`.
- **Reemplazos sin JavaScript de framework:**
  - El `Button` de PrimeVue pasa a ser un `<a>` con las mismas clases.
  - El `Drawer` del menú móvil pasa a `<details>` o un script inline de pocas líneas.
  - `LanguageSwitcher` (un `Select` de PrimeVue) se vuelve dos enlaces es/en.
  - Los íconos `pi pi-*` se resuelven con el paquete `primeicons` (solo el CSS y la fuente), o con SVG inline si son pocos.
- **Utilidades:** `useWhatsApp` (`web/composables/useWhatsApp.ts`) se convierte en `src/lib/whatsapp.ts`, y `useGtag` (`web/composables/useGtag.ts`) en `src/components/Gtag.astro`, incluido en las mismas 5 páginas.
- **Formulario de contacto:** un `<form>` HTML con el widget de Turnstile (script de Cloudflare) y un script inline que hace `fetch('https://app.tapy.mx/api/contact')` con `{ name, phone, email, message, turnstileToken }`. Antes hay que leer en `web/server/api/contact.post.ts` el nombre exacto del campo. Si va bien, lleva a `/thank-you` (o `/en/thank-you`); si falla, muestra el mensaje inline.
- **SEO:** un `src/layouts/Base.astro` con title, description, og y twitter tomados de cada página (los `useSeoMeta` actuales), `hreflang` es/en y favicons de `web/public/branding/`. Se agrega `@astrojs/sitemap`, ahora con `/privacidad`, `/links` y `/en/*`. `public/robots.txt` queda estático y sin bloqueos.
- **Assets:**
  - Se copian `web/public/{logo,marketing,branding}/*` y `links-hero.jpg`.
  - Las imágenes de marketing van por `astro:assets`, con `<Image>` en webp/avif y tamaños responsivos.
  - Se copia `.well-known/assetlinks.json` tal cual.
- **Cloudflare Pages, en `public/_redirects`:** los 301 de las rutas de la app hacia app.tapy.mx.
  ```
  /app/*          https://app.tapy.mx/app/:splat          301
  /store/*        https://app.tapy.mx/store/:splat        301
  /auth/*         https://app.tapy.mx/auth/:splat         301
  /super-admin/*  https://app.tapy.mx/super-admin/:splat  301
  /l/*            https://app.tapy.mx/l/:splat            301
  /public/*       https://app.tapy.mx/public/:splat       301
  /paused         https://app.tapy.mx/paused              301
  /unauthorized   https://app.tapy.mx/unauthorized        301
  ```
  Antes de escribir la lista final, revisar `web/pages/` para no omitir ninguna ruta de primer nivel.
- **Sin proxy de la API.** Los 3 clientes con instalaciones que apuntan a tapy.mx se migran antes del corte (ver sección 2b). Un redirect no sirve, porque el WebView borra el header `Authorization` cuando el redirect cambia de dominio. Si después del corte aparece tráfico en `tapy.mx/api/*`, el plan B es una Pages Function `functions/api/[[path]].ts` de unas 10 líneas que reenvía la petición a `https://app.tapy.mx/api/<path>`.

## 2. Cambios en `web/` (la app) antes del corte

- **CORS en `server/middleware/cors.ts`:** permitir `https://tapy.mx`, `https://www.tapy.mx` y el dominio de preview `*.tapy-site.pages.dev`, solo para `/api/contact`.
- **Enlaces absolutos:**
  - En `pages/auth/login.vue:396`, el logo apunta a `https://tapy.mx`.
  - En `login.vue:474-481`, el botón de contacto apunta a `https://tapy.mx/contact-us`.
- **URL pública:** configurar `PUBLIC_URL=https://app.tapy.mx` en Cloudflare, o cambiar el default en `nuxt.config.ts:92`, para que los correos de recuperación de contraseña, magic link e invitación (`server/api/auth/forgot-password.post.ts`, `magic-link-login.post.ts`, `super-admin/users.post.ts`) apunten a app.tapy.mx. En Supabase Auth, el usuario agrega `https://app.tapy.mx/**` a las Redirect URLs.

## 2b. Migrar a los clientes antes del corte

Se mueven los 3 clientes que hoy llaman a `tapy.mx/api` a builds que usan `https://app.tapy.mx`.

- **Clientes Android (2):**
  1. En el APK viejo `com.tappytaste.desktop`, confirmar que no queden pedidos ni turnos sin sincronizar.
  2. Instalar el APK nuevo `mx.tapy.app` 26.8.2 o posterior con `pnpm bia:release`.
  3. Iniciar sesión, reconfigurar la impresora y desinstalar la app vieja.
  4. Con Play App Signing configurado con la llave propia, estas instalaciones después se actualizan desde Play.
- **Cliente Windows (1):**
  - Compilar el instalador NSIS en una máquina con `.env`, y confirmar que tenga `NUXT_PUBLIC_WEB_API_URL=https://app.tapy.mx`. El CI (`.github/workflows/build.yml`) solo compila macOS y Ubuntu, y no define esa variable.
  - El identifier de escritorio no cambió, así que se instala encima de la versión actual y los datos locales se conservan.
  - No hay updater, así que la instalación es manual.
- **Comprobación:** en las analíticas de Cloudflare de tapy.mx, filtrar por la ruta `/api/*`. Cuando no haya tráfico durante unos días, se puede cortar.

## 3. Corte (orden)

**Fase A, ahora:** construir y probar sin tocar tapy.mx.

1. Crear el repo `tapy-site`, conectarlo a un proyecto nuevo de Cloudflare Pages con deploy automático desde `main` y previews por rama, y portar todo.
2. Desplegar los cambios de web del paso 2: CORS y enlaces absolutos.
3. Probar el preview completo en `tapy-site.pages.dev` (ver Verificación).

**Fase B, el usuario:** migrar a los 3 clientes (sección 2b) y comprobar que no queda tráfico en `tapy.mx/api/*`.

**Fase C, el corte:**

4. En Cloudflare, mover los dominios `tapy.mx` y `www.tapy.mx` del proyecto web al de tapy-site. `app.tapy.mx` se queda en web. Si `tappytaste.com` sigue activo, apuntarlo a tapy-site con un 301 a tapy.mx.
5. Verificar en producción: las rutas de la app redirigen a app.tapy.mx, `tapy.mx/.well-known/assetlinks.json` responde, y las 3 instalaciones migradas siguen sincronizando.

## 4. Limpieza en `web/` después del corte (PR aparte)

- Borrar `pages/{index (marketing), cafeterias, heladerias, contact-us, thank-you, links, privacidad}.vue`, `components/Marketing/*`, `composables/useGtag.ts`, `server/routes/sitemap.xml.ts` y las claves i18n de marketing. Antes de borrar `useWhatsApp`, `LanguageSwitcher` y cualquier clave, revisar con grep que la app no las use.
- `pages/index.vue` pasa a ser solo un redirect a `/auth/login`, o a la home según el rol, usando el `auth` middleware existente. Se eliminan `PROD_HOSTS` y el check de host.
- `server/routes/robots.txt.ts` pasa a `Disallow: /`, porque la app no se indexa. Se quitan las reglas de `prerender` de marketing en `nuxt.config.ts`.

## Fuera de alcance (después)


- Traducir cafeterias, heladerias y links.
- Rediseño.
- Las PWA instaladas desde el origen tapy.mx quedarán apuntando a marketing; hay que reinstalarlas desde app.tapy.mx.

## Verificación

- **Local:** `npm run build && npx wrangler pages dev dist` en tapy-site.
  - Recorrer `/`, `/en/`, `/contact-us`, `/en/contact-us`, `/thank-you`, `/privacidad`, `/en/privacidad`, `/cafeterias`, `/heladerias` y `/links` con Puppeteer, con capturas de escritorio y móvil para compararlas con las actuales de tapy.mx.
  - Confirmar que no quedan claves sin traducir y que no hay scroll horizontal.

- **Redirects:** `curl -sI <preview>/auth/login`, `/store/pos` y `/l/algo`, que deben dar 301 a app.tapy.mx.
- **Formulario:** enviar uno real desde el preview y confirmar la fila en `contact_submissions`, el correo en `contacto@tapy.mx` y el redirect a `/thank-you`.
- **Rendimiento:** Lighthouse o el skill `web-perf` en `/` y `/cafeterias`, con la meta de LCP < 2.5 s, CLS ≈ 0 y JS casi nulo.
- **Después del corte:** probar el login en app.tapy.mx y la recuperación de contraseña, cuyo correo debe traer un link a app.tapy.mx.

## Addendum: landings `/l/[slug]` (hecho antes del corte)

- tapy-site: `src/pages/l/[slug].astro` se genera en el servidor (`prerender = false`, adaptador `@astrojs/cloudflare`) y se cachea en el edge con `Astro.cache` (60 s + SWR 300, tag `landing:<slug>`). `?v=` no se cachea. Lleva meta og, canonical y JSON-LD `LocalBusiness`.
- tapy-site: `/sitemap-landings.xml` se arma con `app.tapy.mx/api/landings/sitemap`, endpoint nuevo en web, y está en `robots.txt`.
- web: el editor (`pages/app/links/index.vue`) arma la URL pública, el QR y "Ver mi página" con `https://tapy.mx`, no con `window.location.origin`.
- **Después del corte (limpieza web):** `app.tapy.mx/l/*` → 301 a `https://tapy.mx/l/*`, porque hay QR impresos que apuntan a app.tapy.mx. No se puede hacer antes del corte: hoy los dos dominios sirven el mismo build y el redirect se volvería un ciclo.
- Pendiente opcional: que la app purgue la caché del tag `landing:<slug>` al guardar, para que el cambio se vea al instante sin `?v=`.
