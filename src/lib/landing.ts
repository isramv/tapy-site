// Business landings (/l/[slug]). The data is owned by the app: the business
// edits it at app.tapy.mx and this site only renders it. Rules copied from
// web/utils/landingLinks.ts and web/utils/landingSlug.ts — keep them in sync.

export interface LandingLink {
  id: string
  kind: string
  label: string
  url: string
  active: boolean
}

export interface Landing {
  slug: string
  content: {
    public_name?: string
    short_description?: string
    address?: string
    phone?: string
    links: LandingLink[]
  }
  business: { name: string, business_photo?: { variants?: string[] } | null } | null
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function isValidSlug(slug: string): boolean {
  return slug.length >= 3 && slug.length <= 40 && SLUG_PATTERN.test(slug)
}

const SAFE_PROTOCOLS = ['http:', 'https:', 'tel:', 'mailto:']

/**
 * Allowlist, not blocklist: a `javascript:` href would run in the browser of
 * whoever scanned the QR. The app already rejects these on save; this is the
 * second line.
 */
export function isSafeUrl(url: string): boolean {
  let parsed: URL
  try {
    parsed = new URL(url)
  }
  catch {
    return false
  }
  if (parsed.username || parsed.password) return false
  return SAFE_PROTOCOLS.includes(parsed.protocol)
}

const LABELS: Record<string, string> = {
  whatsapp: 'WhatsApp', phone: 'Teléfono', email: 'Correo', instagram: 'Instagram', tiktok: 'TikTok',
  facebook: 'Facebook', youtube: 'YouTube', ubereats: 'Uber Eats', rappi: 'Rappi', didi: 'DiDi Food',
  googlemaps: 'Google Maps', waze: 'Waze', menu: 'Menú', website: 'Sitio web',
}

const ICONS: Record<string, string> = {
  whatsapp: 'pi-whatsapp', phone: 'pi-phone', email: 'pi-envelope', instagram: 'pi-instagram', tiktok: 'pi-tiktok',
  facebook: 'pi-facebook', youtube: 'pi-youtube', ubereats: 'pi-shopping-bag', rappi: 'pi-shopping-bag',
  didi: 'pi-shopping-bag', googlemaps: 'pi-map-marker', waze: 'pi-map-marker', menu: 'pi-book', website: 'pi-globe',
}

export const linkLabel = (l: LandingLink): string => l.label?.trim() || LABELS[l.kind] || l.url
export const linkIcon = (l: LandingLink): string => `pi ${ICONS[l.kind] ?? 'pi-link'}`

/** Social profiles go into the structured data as `sameAs`. */
export const SOCIAL_KINDS = ['instagram', 'tiktok', 'facebook', 'youtube']

export function photoVariant(landing: Landing, size: 'ratioSmall' | 'large'): string | null {
  return landing.business?.business_photo?.variants?.find(v => v.includes(`/${size}`)) ?? null
}

export type FetchResult = { ok: true, landing: Landing } | { ok: false, status: 404 | 503 }

/**
 * `version` is the `?v=` the editor appends to "see my page": it is forwarded
 * so the app's own cache is skipped too and the owner sees their edit at once.
 */
export async function fetchLanding(appUrl: string, slug: string, version: string | null): Promise<FetchResult> {
  const url = new URL(`/api/landing/${slug}`, appUrl)
  if (version) url.searchParams.set('v', version)
  try {
    const res = await fetch(url, { headers: { accept: 'application/json' } })
    if (res.status === 404) return { ok: false, status: 404 }
    if (!res.ok) return { ok: false, status: 503 }
    return { ok: true, landing: await res.json() as Landing }
  }
  catch {
    return { ok: false, status: 503 }
  }
}
