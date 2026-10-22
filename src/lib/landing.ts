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
    theme?: string
  }
  business: { name: string, business_photo?: { variants?: string[] } | null } | null
}

// Copied from web/utils/landingThemes.ts (names live in the app's i18n) —
// keep them in sync. `accent` paints the link buttons under white text, `bg`
// the page.
const THEMES: Record<string, { accent: string, bg: string }> = {
  esmeralda: { accent: '#0B7A55', bg: '#FFFFFF' },
  oceano: { accent: '#1D5FA8', bg: '#F1F5FB' },
  atardecer: { accent: '#C8501F', bg: '#FFF5EF' },
  uva: { accent: '#6A3FA0', bg: '#F6F2FB' },
  grafito: { accent: '#1F2933', bg: '#F3F4F5' },
  frambuesa: { accent: '#B8325F', bg: '#FDF1F5' },
  menta: { accent: '#0E7C7B', bg: '#EEF8F7' },
  cielo: { accent: '#0B6FA4', bg: '#EDF7FC' },
  indigo: { accent: '#3F47B5', bg: '#F1F2FC' },
  lavanda: { accent: '#7A4FC4', bg: '#F7F3FE' },
  coral: { accent: '#C2413B', bg: '#FEF2F1' },
  mandarina: { accent: '#B35A00', bg: '#FFF6EA' },
  mostaza: { accent: '#8A6A00', bg: '#FDF8E6' },
  oliva: { accent: '#56702A', bg: '#F5F8EE' },
  bosque: { accent: '#1E5B3A', bg: '#EFF5F1' },
  cafe: { accent: '#7A4A2B', bg: '#F9F3EE' },
  vino: { accent: '#7C1F3A', bg: '#FAF0F3' },
  noche: { accent: '#1B2A4A', bg: '#EEF1F6' },
}

/** No theme saved (every landing before themes existed) looks as it always did. */
export function landingTheme(id?: string) {
  return THEMES[id ?? ''] ?? THEMES.esmeralda
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
