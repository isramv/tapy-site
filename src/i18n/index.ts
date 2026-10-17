import en from './en.json'
import es from './es.json'

export type Locale = 'es' | 'en'

const messages: Record<Locale, Record<string, string>> = { es, en }

/**
 * Same contract as vue-i18n's t() on the Nuxt site: the key is the English
 * sentence, `{name}` placeholders are filled from params, and a missing key
 * falls back to the key itself.
 */
export function useT(locale: Locale) {
  return (key: string, params: Record<string, string | number> = {}): string =>
    (messages[locale][key] ?? key).replace(/\{(\w+)\}/g, (match, name: string) =>
      name in params ? String(params[name]) : match)
}

/** `/contact-us` → `/en/contact-us`; Spanish stays unprefixed. */
export function localePath(locale: Locale, path: string): string {
  if (locale === 'es') return path
  return path === '/' ? '/en' : `/en${path}`
}
