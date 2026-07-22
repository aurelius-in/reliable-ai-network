import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.resolve(HERE, "..", "public");
const SRC = path.join(PUBLIC, "brand", "mark.jpg");
const ICONS = path.join(PUBLIC, "icons");

async function roundedIcon(size, outName, rx) {
  const mask = Buffer.from(
    `<svg width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${rx}" fill="#fff"/></svg>`
  );
  await sharp(SRC)
    .resize(size, size, { fit: "cover" })
    .composite([{ input: mask, blend: "dest-in" }])
    .png()
    .toFile(path.join(ICONS, outName));
  console.log("wrote", outName);
}

await roundedIcon(192, "icon-192.png", 42);
await roundedIcon(512, "icon-512.png", 112);
await roundedIcon(180, "apple-touch-icon.png", 40);
await sharp(SRC)
  .resize(144, 144, { fit: "cover" })
  .png()
  .toFile(path.join(PUBLIC, "rain-logo.png"));
console.log("wrote rain-logo.png");
