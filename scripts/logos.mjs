// Makes the client logos uniform, ready for the "guest list" logo wall.
//
//   public/clients/elite/   → the headliners, shown big in the front row
//   public/clients/others/  → everyone else, shown smaller behind them
//
// Drop logos (PNG, JPEG, WebP, SVG) in either folder and run `npm run logos`
// (it also runs before every build). The file name becomes the name shown to
// screen readers and in the alt text ("louis-vuitton.png" → "Louis Vuitton");
// a numeric prefix sets the order ("01-dior.png") and is dropped.
//
// Every logo is turned into the same thing: a white silhouette on a
// transparent background (a solid background is keyed out), trimmed tight,
// at one height. The page then sizes each one by its aspect ratio so wide
// wordmarks and square marks carry the same visual weight.

import { readdir, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const SOURCE = path.join(ROOT, "public/clients");
const OUT_DIR = path.join(SOURCE, "uniform");
const MANIFEST = path.join(ROOT, "lib/clientLogos.json");
const TIERS = ["elite", "others"];
const EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".svg", ".avif", ".gif"]);
const HEIGHT = 200;
const MAX_WIDTH = 1400;

function nameFrom(file) {
  return path
    .parse(file)
    .name.replace(/^\d+[-_. ]*/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/(^|\s)\p{Ll}/gu, (c) => c.toUpperCase());
}

function slugFrom(name) {
  return name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Alpha mask of the logo: its own transparency, or a keyed-out solid background. */
function maskOf(data, width, height) {
  const at = (x, y) => (y * width + x) * 4;
  const corners = [at(0, 0), at(width - 1, 0), at(0, height - 1), at(width - 1, height - 1)];
  const opaqueBackground = corners.every((i) => data[i + 3] > 240);
  const bg = [0, 1, 2].map((c) => corners.reduce((s, i) => s + data[i + c], 0) / corners.length);
  const sameBackground = corners.every((i) => [0, 1, 2].every((c) => Math.abs(data[i + c] - bg[c]) < 40));

  const mask = new Uint8Array(width * height);
  for (let p = 0, i = 0; p < mask.length; p++, i += 4) {
    let alpha = data[i + 3];
    if (opaqueBackground && sameBackground) {
      // Distance from the background colour; anti-aliased edges fade smoothly.
      const d = Math.hypot(data[i] - bg[0], data[i + 1] - bg[1], data[i + 2] - bg[2]);
      alpha = Math.min(alpha, Math.max(0, Math.min(255, ((d - 24) / 70) * 255)));
    }
    mask[p] = alpha;
  }
  return mask;
}

async function normalize(file, tier, order) {
  const input = path.join(SOURCE, tier, file);
  const { data, info } = await sharp(input, { density: 400 })
    .rotate()
    .resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const mask = maskOf(data, width, height);

  // Tight box around everything that's visible.
  let top = height, left = width, bottom = -1, right = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (mask[y * width + x] > 16) {
        if (y < top) top = y;
        if (y > bottom) bottom = y;
        if (x < left) left = x;
        if (x > right) right = x;
      }
    }
  }
  if (bottom < 0) throw new Error("the image looks empty");

  const w = right - left + 1;
  const h = bottom - top + 1;
  const white = Buffer.alloc(w * h * 4, 255);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) white[(y * w + x) * 4 + 3] = mask[(y + top) * width + (x + left)];
  }

  const name = nameFrom(file);
  const slug = `${tier}-${slugFrom(name) || order}`;
  const out = await sharp(white, { raw: { width: w, height: h, channels: 4 } })
    .resize({ height: HEIGHT, width: MAX_WIDTH, fit: "inside" })
    .webp({ quality: 90, alphaQuality: 100, effort: 6 })
    .toBuffer({ resolveWithObject: true });
  await writeFile(path.join(OUT_DIR, `${slug}.webp`), out.data);

  return { name, tier, src: `/clients/uniform/${slug}.webp`, width: out.info.width, height: out.info.height };
}

async function filesIn(tier) {
  const dir = path.join(SOURCE, tier);
  const entries = await readdir(dir).catch(() => []);
  return entries
    .filter((f) => EXTENSIONS.has(path.extname(f).toLowerCase()) && !f.startsWith("."))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

await rm(OUT_DIR, { recursive: true, force: true });
await mkdir(OUT_DIR, { recursive: true });

const logos = [];
let failed = 0;
for (const tier of TIERS) {
  const files = await filesIn(tier);
  for (const [i, file] of files.entries()) {
    try {
      logos.push(await normalize(file, tier, i + 1));
    } catch (err) {
      failed++;
      console.error(`logos: skipped ${tier}/${file} (${err.message})`);
    }
  }
}

await writeFile(MANIFEST, `${JSON.stringify(logos, null, 2)}\n`);
const elite = logos.filter((l) => l.tier === "elite").length;
console.log(`logos: ${elite} elite, ${logos.length - elite} others${failed ? `, ${failed} skipped` : ""}`);
