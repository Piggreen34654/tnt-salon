/**
 * Déduit comment lire une chaîne.
 * "mp4" : balise video native. "hls" : hls.js (ou Safari natif).
 * "auto" se base sur l'extension de l'URL, sans le query string.
 */
export function resolveStreamKind(channel) {
  const declared = String(channel?.type || 'auto').toLowerCase();
  if (declared === 'mp4' || declared === 'hls') return declared;
  return inferKindFromUrl(channel?.url || '');
}

export function inferKindFromUrl(url) {
  const path = String(url).split('?')[0].split('#')[0].toLowerCase();
  if (path.endsWith('.m3u8') || path.endsWith('.m3u')) return 'hls';
  return 'mp4';
}
