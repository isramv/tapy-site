export const WA_NUMBER = '523319878090'

export function waUrl(message?: string): string {
  return `https://wa.me/${WA_NUMBER}${message ? `?text=${encodeURIComponent(message)}` : ''}`
}
