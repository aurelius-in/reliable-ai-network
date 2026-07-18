// PWA icon + header logo generator: composites the real RAIN raindrop
// artwork (glowing blue network mesh) onto a #0B0B0D tile.
// Sources live in the repo root:
//   rain-social.png   — 630px drop with "RAIN" wordmark inside, dark bg (icons)
//   rain-black-sm.png — small drop without wordmark, dark bg (header logo)
// Run from monetize/: node scripts/generate-icons.mjs
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, "..", "..");
const PUBLIC_DIR = path.resolve(HERE, "..", "public");
const ICONS_DIR = path.join(PUBLIC_DIR, "icons");

const TILE = { r: 11, g: 11, b: 13, alpha: 1 }; // #0B0B0D

/**
 * The source art sits on pure black, which shows as a faint darker
 * rectangle against the #0B0B0D tile. Fade near-black pixels to
 * transparent so the drop's glow blends seamlessly into the tile.
 */
async function keyOutBlack(buf) {
  const { data, info } = await sharp(buf)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    const brightest = Math.max(data[i], data[i + 1], data[i + 2]);
    const alpha = Math.min(255, brightest * 4);
    if (alpha < data[i + 3]) data[i + 3] = alpha;
  }
  return sharp(data, { raw: info }).png().toBuffer();
}

function roundedMask(size, rx) {
  return Buffer.from(
    `<svg width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${rx}" fill="#fff"/></svg>`
  );
}

/** Trimmed drop artwork resized to fit a scale×size box. */
async function fitDrop(sourceBuffer, size, scale) {
  const box = Math.round(size * scale);
  return sharp(sourceBuffer)
    .resize(box, box, { fit: "inside" })
    .png()
    .toBuffer();
}

async function makeIcon(sourceBuffer, outFile, size, { rounded, scale }) {
  const drop = await fitDrop(sourceBuffer, size, scale);
  let img = sharp({
    create: { width: size, height: size, channels: 4, background: TILE },
  }).composite([
    { input: drop, gravity: "center" },
    ...(rounded
      ? [{ input: roundedMask(size, Math.round(size * 0.2)), blend: "dest-in" }]
      : []),
  ]);
  await img.png().toFile(outFile);
  console.log("wrote", path.relative(PUBLIC_DIR, outFile));
}

await mkdir(ICONS_DIR, { recursive: true });

// Trim the icon source to the drop's bounds (background is near-black).
const iconSource = await keyOutBlack(
  await sharp(path.join(REPO_ROOT, "rain-social.png")).trim().png().toBuffer()
);

const TARGETS = [
  // Standard launcher icons: rounded dark tile, generous drop.
  { file: "icon-192.png", size: 192, rounded: true, scale: 0.78 },
  { file: "icon-512.png", size: 512, rounded: true, scale: 0.78 },
  // Maskable: full-bleed square, drop kept inside the ~80% safe zone.
  { file: "icon-maskable-192.png", size: 192, rounded: false, scale: 0.6 },
  { file: "icon-maskable-512.png", size: 512, rounded: false, scale: 0.6 },
  // iOS home screen icon: full-bleed square (iOS applies its own mask).
  { file: "apple-touch-icon.png", size: 180, rounded: false, scale: 0.76 },
];

for (const t of TARGETS) {
  await makeIcon(iconSource, path.join(ICONS_DIR, t.file), t.size, t);
}

// Header logo: drop only (crop off the small "RAIN" text at the bottom of
// rain-black-sm.png), on a rounded dark tile, 144px so it stays crisp at
// 36px display on retina.
const logoCropped = await sharp(path.join(REPO_ROOT, "rain-black-sm.png"))
  .extract({ left: 0, top: 0, width: 103, height: 88 })
  .png()
  .toBuffer();
const logoSource = await keyOutBlack(
  await sharp(logoCropped).trim().png().toBuffer()
);
await makeIcon(logoSource, path.join(PUBLIC_DIR, "rain-logo.png"), 144, {
  rounded: true,
  scale: 0.82,
});

console.log("done");
