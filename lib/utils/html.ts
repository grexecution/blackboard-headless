/**
 * Decode HTML entities in a string
 */
export function decodeHtmlEntities(text: string): string {
  const textArea = typeof document !== 'undefined' ? document.createElement('textarea') : null

  if (textArea) {
    textArea.innerHTML = text
    return textArea.value
  }

  // Server-side fallback for common entities
  return text
    .replace(/&#8211;/g, '–') // en dash
    .replace(/&#8212;/g, '—') // em dash
    .replace(/&#8217;/g, "'") // right single quote
    .replace(/&#8216;/g, "'") // left single quote
    .replace(/&#8221;/g, '"') // right double quote
    .replace(/&#8220;/g, '"') // left double quote
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&auml;/g, 'ä')
    .replace(/&ouml;/g, 'ö')
    .replace(/&uuml;/g, 'ü')
    .replace(/&Auml;/g, 'Ä')
    .replace(/&Ouml;/g, 'Ö')
    .replace(/&Uuml;/g, 'Ü')
    .replace(/&szlig;/g, 'ß')
}

/**
 * Strip HTML tags from a string
 */
export function stripHtmlTags(text: string): string {
  return text.replace(/<[^>]*>/g, '')
}

/**
 * Decode HTML entities and strip tags
 */
export function cleanHtmlText(text: string): string {
  return decodeHtmlEntities(stripHtmlTags(text))
}