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
