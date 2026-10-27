import catalog from './travel-artwork.json';

const entries: Record<string, { filename: string; alt: string }> = catalog;

/** Theme-paired editorial illustrations; original photographs remain in public/light and public/dark. */
export function travelArtworkSrc(asset: string, theme: 'light' | 'dark' = 'light') {
  const entry = entries[asset];
  if (!entry) throw new Error(`Unknown travel artwork: ${asset}`);
  return `/illustrations/${theme}/${entry.filename}-${theme}.webp`;
}

export function travelArtworkAlt(asset: string) {
  const entry = entries[asset];
  if (!entry) throw new Error(`Unknown travel artwork: ${asset}`);
  return entry.alt;
}
