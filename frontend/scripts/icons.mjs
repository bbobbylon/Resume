// Generates the app icons manifest.webmanifest points at, plus apple-touch-icon.png,
// from an inline SVG monogram — there is no separate logo asset (the brand mark is
// the "bobbylon" wordmark Nav renders as text; see docs/UI-DESIGN.md §1). Run this
// again only if the Nocturne bg/accent tokens in styles.css change.
//
//   node scripts/icons.mjs
//
// Writes:
//   public/icons/icon-192.png        192×192, any purpose, rounded square
//   public/icons/icon-512.png        512×512, any purpose, rounded square
//   public/icons/icon-maskable-512.png  512×512, maskable purpose — full-bleed
//                                     background, glyph kept inside the ~40%
//                                     safe-zone radius Android's mask crops to
//   public/apple-touch-icon.png      180×180 — iOS ignores manifest icons and
//                                     applies its own rounding, so this is a
//                                     flat square with no corner radius of its own
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';

// Nocturne's page ground and accent (frontend/src/styles.css `:root`) — kept as
// literals here since this script runs outside the Angular build and cannot read
// the CSS custom properties.
const BG = '#161826';
const ACCENT = '#9184d9';

/** One "b" monogram, `size`² with `radius` corners, glyph centered and `scale` tall. */
function monogramSvg(size, { radius = 0, scale = 0.6 } = {}) {
  const fontSize = Math.round(size * scale);
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
      <rect width="${size}" height="${size}" rx="${radius}" fill="${BG}"/>
      <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central"
        font-family="Arial, sans-serif" font-weight="700" font-size="${fontSize}"
        fill="${ACCENT}">b</text>
    </svg>`;
}

const OUT_ICONS = resolve('public/icons');
mkdirSync(OUT_ICONS, { recursive: true });

await sharp(Buffer.from(monogramSvg(192, { radius: 32 }))).png().toFile(resolve(OUT_ICONS, 'icon-192.png'));
await sharp(Buffer.from(monogramSvg(512, { radius: 86 }))).png().toFile(resolve(OUT_ICONS, 'icon-512.png'));
// Maskable: no rounding of our own (the OS applies its own mask shape) and a
// smaller glyph scale so "b" survives a circular crop.
await sharp(Buffer.from(monogramSvg(512, { radius: 0, scale: 0.42 })))
  .png().toFile(resolve(OUT_ICONS, 'icon-maskable-512.png'));
await sharp(Buffer.from(monogramSvg(180, { radius: 0 }))).flatten({ background: BG }).png()
  .toFile(resolve('public/apple-touch-icon.png'));

console.log('✓ public/icons/icon-192.png, icon-512.png, icon-maskable-512.png, ../apple-touch-icon.png');
