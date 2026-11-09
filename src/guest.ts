// Shared wedding config + guest personalisation logic (used by the invitation and /admin)

export const WEDDING = {
  groomName: 'Viranga',
  brideName: 'Umesha',
};

export type PrefixKey = 'mr' | 'mrs' | 'miss' | 'mrmrs' | 'family' | 'dear';

export const PREFIXES: { key: PrefixKey; label: string }[] = [
  { key: 'mr', label: 'Mr.' },
  { key: 'mrs', label: 'Mrs.' },
  { key: 'miss', label: 'Miss' },
  { key: 'mrmrs', label: 'Mr. & Mrs.' },
  { key: 'family', label: 'Family' },
  { key: 'dear', label: 'Dear' },
];

/** Name shown on the invitation. "Dear" never appears here — it belongs to the greeting only. */
export function displayName(prefix: PrefixKey, name: string): string {
  const n = name.trim().replace(/\s+/g, ' ');
  if (!n) return '';
  switch (prefix) {
    case 'mr': return `Mr. ${n}`;
    case 'mrs': return `Mrs. ${n}`;
    case 'miss': return `Miss ${n}`;
    case 'mrmrs': return `Mr. & Mrs. ${n}`;
    case 'family': return `${n} and Family`;
    case 'dear':
    default: return n;
  }
}

/** {baseURL}/{guestName}, plus ?p= for the prefix (omitted for "Dear"). */
export function buildLink(baseUrl: string, prefix: PrefixKey, name: string): string {
  const n = name.trim().replace(/\s+/g, ' ');
  const url = `${baseUrl.replace(/\/+$/, '')}/${encodeURIComponent(n)}`;
  return prefix === 'dear' ? url : `${url}?p=${prefix}`;
}

export function buildMessage(display: string, link: string): string {
  return `Dear ${display} ❤️

With joyful hearts, we warmly invite you to celebrate one of the most special days of our lives as we begin our journey together.

Please view our wedding invitation and all the event details through the link below 🌐:

${link}

Your presence would truly mean the world to us, and we would be honored to celebrate this beautiful moment together.

With love,
❤️ ${WEDDING.groomName} & ${WEDDING.brideName}`;
}

/** Reads the guest from the current URL, e.g. /Sanjaya?p=mr → "Mr. Sanjaya". */
export function guestFromLocation(): string {
  const seg = window.location.pathname.replace(/^\/+|\/+$/g, '');
  if (!seg || seg.includes('/') || seg.toLowerCase() === 'admin') return '';
  let name: string;
  try {
    name = decodeURIComponent(seg);
  } catch {
    return '';
  }
  const p = new URLSearchParams(window.location.search).get('p') as PrefixKey | null;
  const valid = PREFIXES.some((x) => x.key === p);
  return displayName(valid ? (p as PrefixKey) : 'dear', name);
}
