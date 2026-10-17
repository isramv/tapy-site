import type { APIRoute } from 'astro'

// Business landings change without a deploy, so their sitemap is built on
// request from the app's list of published slugs (cached for an hour).
export const prerender = false

export const GET: APIRoute = async ({ cache }) => {
  const appUrl = import.meta.env.PUBLIC_APP_URL ?? 'https://app.tapy.mx'
  let landings: { slug: string, updated_at: string }[]
  try {
    const res = await fetch(new URL('/api/landings/sitemap', appUrl))
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    landings = await res.json()
  }
  catch {
    // Not cached: Google retries a 503 later instead of dropping the URLs.
    return new Response('Unavailable', { status: 503 })
  }
  const urls = landings
    .map(l => `<url><loc>https://tapy.mx/l/${encodeURIComponent(l.slug)}</loc><lastmod>${new Date(l.updated_at).toISOString()}</lastmod></url>`)
    .join('')

  cache.set({ maxAge: 3600, swr: 86400, tags: ['landings-sitemap'] })
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  )
}
