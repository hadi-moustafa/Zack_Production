import fs from "node:fs";
import path from "node:path";

// Checks whether a file exists under /public, so server components can
// conditionally render an asset (e.g. hero video) only once it's supplied.
export function publicFileExists(relPath: string): boolean {
  try {
    return fs.existsSync(path.join(process.cwd(), "public", relPath));
  } catch {
    return false;
  }
}

// The brand logo, dropped into /public as logo.svg, logo.png or logo.webp.
export function brandLogoSrc(): string | null {
  const file = ["logo.svg", "logo.png", "logo.webp"].find(publicFileExists);
  return file ? `/${file}` : null;
}
