# Parked: marketing y SEO

Pendientes de tapy.mx que no son urgentes. Uno por punto, con fecha y lo necesario para retomarlo.

- **Perfil de Google Business** (2026-11-27) — 🅿️ lo va a hacer el usuario, no es prioridad. Solo califica como **negocio de área de servicio** (demos, instalación y capacitación en el local del cliente); un software solo en línea no es elegible y Google puede suspenderlo. En business.google.com: nombre `tapy.` (sin palabras clave), categoría "Empresa de software" o "Proveedor de sistemas de punto de venta", "¿los clientes visitan tu ubicación?" → No, áreas de servicio Guadalajara/Zapopan/Tlaquepaque/Tonalá, teléfono 33 1987 8090, sitio https://tapy.mx. Verificación por video o lo que pida Google. Después: descripción, fotos del POS, horario y **reseñas** de clientes actuales (Sushi Cool, Don Eddy, florerías). Al tenerlo, agregar la URL del perfil en `sameAs` del JSON-LD `Organization` (`src/views/Home.astro`).
- **Páginas por giro** (2026-11-27) — como `/cafeterias` y `/heladerias`: restaurantes, pastelerías y florerías (encajan con la agenda de pedidos), taquerías.
- **"Hecho con tapy." en las landings `/l/*`** (2026-11-27) — un link a https://tapy.mx al pie de cada landing de negocio: cada negocio que publica da un enlace de vuelta.
- **Conversión de WhatsApp en Google Ads** (2026-11-27) — el código ya está (`src/components/Gtag.astro`); falta poner el `send_to` de la acción de conversión en `WA_SEND_TO`. La del formulario va por URL (`/thank-you`) en Google Ads, sin código.
- **Precio en el JSON-LD** (2026-11-27) — `SoftwareApplication` en `src/views/Home.astro` va sin `offers`; agregarlo cuando haya precio público.
- **Las e2e publican landings en producción** (2026-11-27) — `e2e-*` aparecía en el sitemap; hoy se filtra en `src/pages/sitemap-landings.xml.ts`, pero la página sigue pública. Revisar que la suite no corra contra producción o que limpie lo que publica.
