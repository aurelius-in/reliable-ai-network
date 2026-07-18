// One-off PWA icon generator: renders the RAIN cloud-rain-wind mark
// (same glyph as components/Logo.tsx) in brand magenta on a #0B0B0D tile.
// Run from monetize/: node scripts/generate-icons.mjs
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = path.join(process.cwd(), "public", "icons");

// lucide cloud-rain-wind, 24x24 viewBox
const GLYPH_PATHS = [
  "M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242",
  "m9.2 22 3-7",
  "m9 13-3 7",
  "m17 13-3 7",
];

/**
 * @param {number} size    output pixel size
 * @param {object} opts
 * @param {boolean} opts.rounded   rounded-corner tile with transparent corners
 * @param {number}  opts.scale     fraction of the tile the glyph spans
 */
function makeSvg(size, { rounded, scale }) {
  const rx = rounded ? Math.round(size * 0.2) : 0;
  // Glyph bounding box in its 24-unit space is roughly x:2..20.2, y:1..22.
  const glyphCx = 11.5;
  const glyphCy = 11.5;
  const k = (size * scale) / 21; // 21 ≈ glyph extent in viewBox units
  const tx = size / 2 - glyphCx * k;
  const ty = size / 2 - glyphCy * k;
  const paths = GLYPH_PATHS.map((d) => `<path d="${d}"/>`).join("\n      ");

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="mark" gradientUnits="userSpaceOnUse" x1="2" y1="2" x2="21" y2="22">
      <stop offset="0" stop-color="#FF4D9E"/>
      <stop offset="1" stop-color="#E20074"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.42" r="0.62">
      <stop offset="0" stop-color="#E20074" stop-opacity="0.30"/>
      <stop offset="1" stop-color="#E20074" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${rx}" fill="#0B0B0D"/>
  <rect width="${size}" height="${size}" rx="${rx}" fill="url(#glow)"/>
  <g transform="translate(${tx} ${ty}) scale(${k})"
     fill="none" stroke="url(#mark)" stroke-width="2"
     stroke-linecap="round" stroke-linejoin="round">
      ${paths}
  </g>
</svg>`;
}

const TARGETS = [
  // Standard launcher icons: rounded dark tile, generous glyph.
  { file: "icon-192.png", size: 192, rounded: true, scale: 0.56 },
  { file: "icon-512.png", size: 512, rounded: true, scale: 0.56 },
  // Maskable: full-bleed square, glyph kept inside the ~80% safe zone.
  { file: "icon-maskable-192.png", size: 192, rounded: false, scale: 0.46 },
  { file: "icon-maskable-512.png", size: 512, rounded: false, scale: 0.46 },
  // iOS home screen icon: full-bleed square (iOS applies its own mask).
  { file: "apple-touch-icon.png", size: 180, rounded: false, scale: 0.56 },
];

await mkdir(OUT_DIR, { recursive: true });
for (const t of TARGETS) {
  const svg = makeSvg(t.size, { rounded: t.rounded, scale: t.scale });
  await sharp(Buffer.from(svg)).png().toFile(path.join(OUT_DIR, t.file));
  console.log("wrote", t.file);
}
console.log("done ->", OUT_DIR);
