/**
 * Charge et normalise la grille.
 * Le fichier à éditer est public/channels.json : un tableau,
 * ou un objet { "channels": [ ... ] }.
 */

const PALETTE = [
  '#e85d4c',
  '#3d7ea6',
  '#3d8b6e',
  '#9b59b6',
  '#f0a202',
  '#2a9d8f',
  '#e76f51',
  '#8b97a8',
];

export async function loadChannels(url = '/channels.json') {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Lecture impossible (${response.status})`);
  }
  const data = await response.json();
  const list = Array.isArray(data) ? data : data?.channels;
  if (!Array.isArray(list)) {
    throw new Error('channels.json doit être un tableau, ou un objet { "channels": [] }.');
  }
  return normalizeList(list);
}

export function normalizeList(list) {
  const seen = new Set();
  return list.map((raw, index) => {
    const channel = normalizeChannel(raw, index);
    if (seen.has(channel.id)) channel.id = `${channel.id}-${index}`;
    seen.add(channel.id);
    return channel;
  });
}

export function normalizeChannel(raw, index) {
  const source = raw && typeof raw === 'object' ? raw : {};
  const name = String(source.name || `Chaîne ${index + 1}`).trim() || `Chaîne ${index + 1}`;
  const number = positiveNumber(source.number) ?? index + 1;
  const declaredType = String(source.type || 'auto').toLowerCase();

  return {
    id: String(source.id || `${slug(name)}-${number}`),
    number,
    name,
    category: String(source.category || 'Général').trim() || 'Général',
    logo: String(source.logo || '').trim(),
    logoText: monogram(source.logoText, name),
    color: isColor(source.color) ? source.color : PALETTE[index % PALETTE.length],
    description: String(source.description || '').trim(),
    url: String(source.url || '').trim(),
    type: declaredType === 'mp4' || declaredType === 'hls' ? declaredType : 'auto',
  };
}

function positiveNumber(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return null;
  return number;
}

function monogram(logoText, name) {
  const custom = String(logoText || '').trim();
  if (custom) return custom.slice(0, 3).toUpperCase();
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase() || 'TV';
}

function slug(value) {
  const plain = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return plain || 'chaine';
}

function isColor(value) {
  return typeof value === 'string' && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value);
}
