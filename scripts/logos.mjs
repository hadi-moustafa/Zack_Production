// Turns the client logos into one uniform set for the "guest list" logo wall.
//
//   logos/                     the original files, as received (gitignored)
//   scripts/logos.config.json  the curated list: one entry per brand, in
//                              display order → { name, tier, file, ...fixes }
//   public/clients/*.webp      the output, committed
//   lib/clientLogos.json       what the page reads, committed
//
// Run `npm run logos` after editing the list (or `npm run logos -- "Name"`
// to redo just those entries). PDFs and Illustrator files are
// rendered from their vectors with poppler's pdftocairo; everything else goes
// through sharp.
//
// Every logo becomes the same kind of thing: its own colours on transparency,
// trimmed tight. A solid background is keyed out by colour distance, so a dark
// logo on white, a white logo on black and a colour logo on a coloured card
// all come out alike, keeping their inner detail (letters knocked out of a
// badge stay knocked out). Colours are kept but made to read on the dark site:
// black and dark greys turn light, and dark colours are lifted in lightness
// with their hue kept. Each logo's ink density is recorded so the page can
// give light script logos and heavy block logos the same visual weight.
//
// Per-logo fixes in the config, for files that need a hand:
//   crop:  [x, y, w, h]   part of the source to use (fractions), e.g. to drop a frame
//   keep:  [x, y, w, h]   part of the finished mark to keep, e.g. to drop a phone number
//   erase: [[x, y, w, h]] parts of the finished mark to remove, e.g. a social handle
//   mode:  "silhouette"   use a transparent file's shape as-is (light logos)
//   ink:   "solid"        every colour counts fully (a red box keeps its weight)
//   tolerance: 18         how far from the background a colour must be to count
//   busy:  0.35           share of the frame allowed to differ from the background
//
// Nothing repeats: names and files must be unique, and any two outputs that
// look alike (perceptual hash) stop the run.

import { readFile, writeFile, rm, mkdir, mkdtemp } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";

const run = promisify(execFile);
const ROOT = path.resolve(import.meta.dirname, "..");
const SOURCE = path.join(ROOT, "logos");
const CONFIG = path.join(ROOT, "scripts/logos.config.json");
const OUT_DIR = path.join(ROOT, "public/clients");
const MANIFEST = path.join(ROOT, "lib/clientLogos.json");
const WORK = 2000; // working resolution (longest side)
const HEIGHT = 240; // output height
const MAX_WIDTH = 1600;

const slugify = (s) =>
  s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

async function rasterize(file, tmp) {
  const ext = path.extname(file).toLowerCase();
  if (ext === ".pdf" || ext === ".ai") {
    const out = path.join(tmp, "page");
    await run("pdftocairo", ["-png", "-singlefile", "-transp", "-f", "1", "-l", "1", "-scale-to", String(WORK), file, out]);
    return sharp(`${out}.png`, { limitInputPixels: false });
  }
  if (ext === ".psd") {
    // sharp can't read Photoshop files; ImageMagick flattens them.
    const out = path.join(tmp, "flat.png");
    await run("magick", [`${file}[0]`, out]);
    return sharp(out, { limitInputPixels: false });
  }
  return sharp(file, { density: 300, limitInputPixels: false }).rotate();
}

// OKLab, to lift a colour's lightness without shifting its hue.
const toLin = (c) => ((c /= 255) <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toSrgb = (c) => 255 * (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
function oklab(r, g, b) {
  [r, g, b] = [toLin(r), toLin(g), toLin(b)];
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}
function linFromOklab(L, a, b) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

/** A logo colour made to read on the dark site, hue kept. */
function onDark(r, g, b) {
  const [L, a, bb] = oklab(r, g, b);
  const C = Math.hypot(a, bb);
  // Greys flip towards white; colours keep their lightness above a floor.
  const grey = Math.max(L, 1 - 0.6 * L);
  const colour = Math.max(L, 0.66);
  const w = Math.min(1, Math.max(0, (C - 0.02) / 0.06));
  const L2 = grey + (colour - grey) * w;
  if (L2 === L) return [r, g, b];
  // Shrink the chroma until the colour fits in sRGB.
  let k = 1;
  for (let i = 0; i < 12; i++) {
    const rgb = linFromOklab(L2, a * k, bb * k);
    if (rgb.every((c) => c >= -1e-4 && c <= 1 + 1e-4)) break;
    k *= 0.9;
  }
  return linFromOklab(L2, a * k, bb * k).map((c) => Math.round(Math.min(255, Math.max(0, toSrgb(Math.min(1, Math.max(0, c)))))));
}

const lum = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

/** Per-pixel ink (0–255): how much each pixel belongs to the logo. */
function inkOf(data, width, height, entry) {
  const n = width * height;
  // Sample a 2px frame to learn the background.
  const frame = [];
  for (let x = 0; x < width; x++) for (const y of [0, 1, height - 2, height - 1]) frame.push((y * width + x) * 4);
  for (let y = 0; y < height; y++) for (const x of [0, 1, width - 2, width - 1]) frame.push((y * width + x) * 4);

  const transparentFrame = frame.filter((i) => data[i + 3] < 32).length / frame.length > 0.6;
  let paper;
  if (transparentFrame) {
    // A white logo meant for dark backgrounds is used as-is (silhouette);
    // anything else is read against white so its white details knock out.
    let sum = 0, count = 0;
    for (let i = 0; i < n * 4; i += 4) {
      if (data[i + 3] > 128) {
        sum += lum(data[i], data[i + 1], data[i + 2]);
        count++;
      }
    }
    paper = entry.mode === "silhouette" || (count && sum / count > 215) ? null : [255, 255, 255];
  } else {
    const median = (c) => frame.map((i) => data[i + c]).sort((a, b) => a - b)[frame.length >> 1];
    paper = [median(0), median(1), median(2)];
    const off = frame.filter((i) => Math.hypot(data[i] - paper[0], data[i + 1] - paper[1], data[i + 2] - paper[2]) > 48).length;
    if (off / frame.length > (entry.busy ?? 0.35)) throw new Error("busy background: give it a crop, or use a cleaner file");
  }

  const ink = new Float32Array(n);
  if (!paper) {
    for (let p = 0; p < n; p++) ink[p] = data[p * 4 + 3];
    return { ink, paper };
  }
  const solid = entry.ink === "solid";
  const dist = new Float32Array(n);
  const sample = [];
  for (let p = 0, i = 0; p < n; p++, i += 4) {
    const dr = data[i] - paper[0], dg = data[i + 1] - paper[1], db = data[i + 2] - paper[2];
    const d = solid ? Math.max(Math.abs(dr), Math.abs(dg), Math.abs(db)) : Math.hypot(dr, dg, db);
    dist[p] = d;
    if (d > 30 && data[i + 3] > 128 && (p & 3) === 0) sample.push(d);
  }
  // Stretch so the logo's strongest colour becomes fully opaque.
  sample.sort((a, b) => a - b);
  const hi = Math.max(80, sample[Math.floor(sample.length * 0.9)] ?? 255);
  const lo = entry.tolerance ?? 18;
  const top = solid ? lo + 40 : hi;
  for (let p = 0; p < n; p++) {
    const t = Math.min(1, Math.max(0, (dist[p] - lo) / (top - lo)));
    ink[p] = t * data[p * 4 + 3];
  }
  // Only a keyed-out background bleeds into the edge pixels.
  return { ink, paper: transparentFrame ? null : paper };
}

/** 64-bit difference hash of the final mark, to catch the same logo twice. */
async function dhash(buffer) {
  const px = await sharp(buffer).extractChannel(3).resize(9, 8, { fit: "fill" }).raw().toBuffer();
  let bits = "";
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) bits += px[y * 9 + x] > px[y * 9 + x + 1] ? "1" : "0";
  return bits;
}

async function normalize(entry, tmp) {
  let img = await rasterize(path.join(SOURCE, entry.file), tmp);
  if (entry.crop) {
    const meta = await img.metadata();
    const [x, y, w, h] = entry.crop;
    img = sharp(await img.toBuffer()).extract({
      left: Math.round(x * meta.width),
      top: Math.round(y * meta.height),
      width: Math.round(w * meta.width),
      height: Math.round(h * meta.height),
    });
  }
  const { data, info } = await img
    .resize({ width: WORK, height: WORK, fit: "inside", withoutEnlargement: true })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const { ink, paper } = inkOf(data, width, height, entry);

  let top = height, left = width, bottom = -1, right = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (ink[y * width + x] > 40) {
        if (y < top) top = y;
        if (y > bottom) bottom = y;
        if (x < left) left = x;
        if (x > right) right = x;
      }
    }
  }
  if (bottom < 0) throw new Error("nothing visible after removing the background");

  // Hand fixes on the finished mark, then tighten the box again.
  if (entry.keep || entry.erase) {
    const bw = right - left + 1, bh = bottom - top + 1;
    const rect = ([x, y, w, h]) => [left + x * bw, top + y * bh, left + (x + w) * bw, top + (y + h) * bh];
    const keep = entry.keep ? rect(entry.keep) : [left, top, right + 1, bottom + 1];
    const erase = (entry.erase ?? []).map(rect);
    top = height; left = width; bottom = -1; right = -1;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const p = y * width + x;
        const inside = ([x0, y0, x1, y1]) => x >= x0 && x < x1 && y >= y0 && y < y1;
        if (!inside(keep) || erase.some(inside)) ink[p] = 0;
        else if (ink[p] > 40) {
          if (y < top) top = y;
          if (y > bottom) bottom = y;
          if (x < left) left = x;
          if (x > right) right = x;
        }
      }
    }
  }

  const w = right - left + 1;
  const h = bottom - top + 1;
  const mark = Buffer.alloc(w * h * 4);
  const cache = new Map();
  let total = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = (y + top) * width + (x + left);
      const a = Math.round(ink[p]);
      total += a;
      if (!a) continue;
      let [r, g, b] = data.subarray(p * 4, p * 4 + 3);
      if (paper) {
        // Edge pixels are part background; take the background back out.
        const t = Math.max(0.05, ink[p] / Math.max(1, data[p * 4 + 3]));
        [r, g, b] = [r, g, b].map((c, i) => Math.round(Math.min(255, Math.max(0, paper[i] + (c - paper[i]) / t))));
      }
      const key = (r << 16) | (g << 8) | b;
      if (!cache.has(key)) cache.set(key, onDark(r, g, b));
      const o = (y * w + x) * 4;
      [mark[o], mark[o + 1], mark[o + 2]] = cache.get(key);
      mark[o + 3] = a;
    }
  }

  const out = await sharp(mark, { raw: { width: w, height: h, channels: 4 } })
    .resize({ height: HEIGHT, width: MAX_WIDTH, fit: "inside" })
    .webp({ quality: 90, alphaQuality: 100, effort: 6 })
    .toBuffer({ resolveWithObject: true });
  return { out, density: total / (w * h * 255) };
}

const entries = JSON.parse(await readFile(CONFIG, "utf8"));
const only = new Set(process.argv.slice(2).map((n) => n.toLowerCase()));
const seen = new Map();
for (const e of entries) {
  for (const key of [`name:${e.name.toLowerCase()}`, `file:${e.file}`, `slug:${slugify(e.name)}`]) {
    if (seen.has(key)) throw new Error(`logos: "${e.name}" repeats ${key} of "${seen.get(key)}"`);
    seen.set(key, e.name);
  }
}

// A partial run keeps every other logo from the last full run.
const previous = only.size ? JSON.parse(await readFile(MANIFEST, "utf8").catch(() => "[]")) : [];
if (!only.size) await rm(OUT_DIR, { recursive: true, force: true });
await mkdir(OUT_DIR, { recursive: true });
const tmp = await mkdtemp(path.join(os.tmpdir(), "logos-"));

const logos = [];
const hashes = [];
const failures = [];
for (const entry of entries) {
  if (only.size && !only.has(entry.name.toLowerCase())) {
    const kept = previous.find((l) => l.name === entry.name);
    if (kept) {
      logos.push({ ...kept, tier: entry.tier });
      hashes.push({ name: kept.name, hash: await dhash(await readFile(path.join(ROOT, "public", kept.src))) });
    }
    continue;
  }
  try {
    const { out, density } = await normalize(entry, tmp);
    const hash = await dhash(out.data);
    const twin = hashes.find((h) => [...h.hash].filter((b, i) => b !== hash[i]).length <= 4);
    if (twin) throw new Error(`looks the same as "${twin.name}"`);
    hashes.push({ name: entry.name, hash });

    const file = `${slugify(entry.name)}.webp`;
    await writeFile(path.join(OUT_DIR, file), out.data);
    logos.push({
      name: entry.name,
      tier: entry.tier,
      src: `/clients/${file}`,
      width: out.info.width,
      height: out.info.height,
      density: Number(density.toFixed(3)),
    });
  } catch (err) {
    failures.push(`${entry.name} (${entry.file}): ${err.message}`);
  }
}
await rm(tmp, { recursive: true, force: true });

await writeFile(MANIFEST, `${JSON.stringify(logos, null, 2)}\n`);
const elite = logos.filter((l) => l.tier === "elite").length;
console.log(`logos: ${elite} elite, ${logos.length - elite} others`);
if (failures.length) {
  console.error(`logos: ${failures.length} not processed:\n  ${failures.join("\n  ")}`);
  process.exitCode = 1;
}
