import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.resolve(HERE, "..", "public");
const ICONS = path.join(PUBLIC, "icons");

// Home-screen icons: glassy squircle mark (readable at small sizes).
// Source family matches make_it_rain_logo1 / button_cool brand.
const MARK = path.join(PUBLIC, "brand", "mark.jpg");
const LOGO = path.join(PUBLIC, "brand", "logo.png");

const NIGHT = { r: 7, g: 10, b: 18, alpha: 1 };

function roundedMask(size, rx) {
  return Buffer.from(
    `<svg width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${rx}" fill="#fff"/></svg>`
  );
}

async function makeIcon(size, outName, { maskable = false, rx = 0 } = {}) {
  const canvas = sharp({
    create: { width: size, height: size, channels: 4, background: NIGHT },
  });

  const pad = maskable ? Math.round(size * 0.14) : Math.round(size * 0.04);
  const inner = size - pad * 2;

  const art = await sharp(MARK)
    .resize(inner, inner, { fit: "cover" })
    .png()
    .toBuffer();

  let composed = await canvas
    .composite([{ input: art, left: pad, top: pad }])
    .png()
    .toBuffer();

  if (rx > 0) {
    composed = await sharp(composed)
      .composite([{ input: roundedMask(size, rx), blend: "dest-in" }])
      .png()
      .toBuffer();
  }

  await sharp(composed).toFile(path.join(ICONS, outName));
  console.log("wrote", outName, maskable ? "(maskable)" : "");
}

await makeIcon(192, "icon-192.png", { rx: 42 });
await makeIcon(512, "icon-512.png", { rx: 112 });
await makeIcon(180, "apple-touch-icon.png", { rx: 40 });
await makeIcon(192, "icon-maskable-192.png", { maskable: true });
await makeIcon(512, "icon-maskable-512.png", { maskable: true });

await sharp(MARK)
  .resize(192, 192, { fit: "cover" })
  .png()
  .toFile(path.join(PUBLIC, "rain-logo.png"));
console.log("wrote rain-logo.png");

// Keep a square wordmark tile available for marketing/export
await sharp(LOGO)
  .resize(512, 512, {
    fit: "contain",
    background: NIGHT,
  })
  .png()
  .toFile(path.join(PUBLIC, "brand", "logo-square.png"));
console.log("wrote brand/logo-square.png");
