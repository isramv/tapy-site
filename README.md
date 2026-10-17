# tapy-site

Sitio de marketing de **tapy.mx**: Astro estático, sin framework en el cliente. La app vive aparte, en app.tapy.mx (repo `web`).

## Comandos

```sh
pnpm install
pnpm dev        # http://localhost:4321
pnpm build      # → dist/
pnpm preview    # sirve dist/ con el emulador de Cloudflare Pages (_redirects incluidos)
pnpm check      # tipos
```

## Estructura

- `src/pages/`: rutas. Las páginas en español no llevan prefijo; las de inglés van en `src/pages/en/`. `cafeterias`, `heladerias` y `links` existen solo en español.
- `src/views/`: plantillas compartidas por la versión en español y la de inglés de cada página.
- `src/i18n/{es,en}.json`: textos. La clave es la frase en inglés, igual que en la app.
- `public/_redirects`: rutas de la app (`/app`, `/store`, `/auth`…) que redirigen con 301 a app.tapy.mx.
- `public/sw.js`: desactiva el service worker de la PWA vieja de Nuxt. Se puede borrar unos meses después del corte.
- `public/.well-known/assetlinks.json`: lo usa la app Android `mx.tapy.app`. Debe coincidir con la copia del repo `web`.

## Variables de entorno (Cloudflare Pages)

| Variable | Valor en producción | Para qué |
|---|---|---|
| `PUBLIC_TURNSTILE_SITE_KEY` | la site key del widget de Turnstile | formulario de contacto (sin la variable se usa la key de prueba) |
| `PUBLIC_APP_URL` | `https://app.tapy.mx` (es el default) | endpoint `/api/contact` |

El formulario de contacto envía un POST a `app.tapy.mx/api/contact`. La app solo acepta ese endpoint desde tapy.mx, www.tapy.mx y `*.tapy-site.pages.dev` (`web/server/middleware/cors.ts`).

El plan de la separación está en `.claude/marketing/astro-split/plan.md`.
