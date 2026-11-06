/**
 * Lit une playlist M3U de chaînes (une URL par entrée #EXTINF).
 * Un fichier #EXT-X-… est un flux HLS, pas une grille : on le refuse
 * pour éviter d'importer chaque segment vidéo comme une chaîne.
 */
export function parseM3u(text) {
  const source = String(text || '');
  if (/#EXT-X-/i.test(source)) {
    return {
      channels: [],
      error:
        'Ce fichier est un flux vidéo HLS, pas une liste de chaînes. Place son adresse dans le champ url de channels.json.',
    };
  }

  const lines = source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const channels = [];
  let pending = null;

  for (const line of lines) {
    if (line.startsWith('#EXTINF')) {
      pending = parseExtinf(line);
      continue;
    }
    if (line.startsWith('#')) continue;

    const meta = pending || {};
    const index = channels.length;
    channels.push({
      id: meta.id || undefined,
      number: meta.number || index + 1,
      name: meta.name || `Chaîne ${index + 1}`,
      category: meta.category || 'Importé',
      logo: meta.logo || '',
      url: line,
      type: 'auto',
    });
    pending = null;
  }

  if (!channels.length) {
    return {
      channels: [],
      error: 'Ce fichier M3U ne contient aucune chaîne.',
    };
  }

  return { channels, error: '' };
}

function parseExtinf(line) {
  const { meta, name } = splitExtinf(line);
  const number = Number(attr(meta, 'tvg-chno'));
  return {
    id: attr(meta, 'tvg-id'),
    number: Number.isFinite(number) && number > 0 ? number : undefined,
    name: name || attr(meta, 'tvg-name'),
    category: attr(meta, 'group-title'),
    logo: attr(meta, 'tvg-logo'),
  };
}

/** Coupe au premier virgule hors guillemets : c'est le nom de la chaîne. */
function splitExtinf(line) {
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') inQuotes = !inQuotes;
    else if (char === ',' && !inQuotes) {
      return { meta: line.slice(0, i), name: line.slice(i + 1).trim() };
    }
  }
  return { meta: line, name: '' };
}

function attr(line, key) {
  const match = line.match(new RegExp(`${key}="([^"]*)"`, 'i'));
  return match ? match[1] : '';
}
