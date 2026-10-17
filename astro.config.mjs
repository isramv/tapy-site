import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import cloudflare from '@astrojs/cloudflare'
import { cacheCloudflare } from '@astrojs/cloudflare/cache'

export default defineConfig({
  site: 'https://tapy.mx',
  // Keep the URLs the Nuxt site used (/contact-us, not /contact-us/): ads and
  // search results already point at them.
  trailingSlash: 'never',
  // Everything is prerendered except /l/[slug] (business landings), which is
  // rendered on request and cached at Cloudflare's edge.
  adapter: cloudflare({ imageService: 'compile' }),
  cache: { provider: cacheCloudflare() },
  build: { format: 'file' },
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    sitemap({
      i18n: { defaultLocale: 'es', locales: { es: 'es-MX', en: 'en-US' } },
      // /links is the business-card QR target; it is noindex.
      filter: page => !page.endsWith('/links'),
    }),
  ],
})
