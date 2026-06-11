import * as fs from "node:fs";
import { dirname, join, parse, resolve, sep } from "node:path";

/**
 * Normalize a filesystem path to POSIX (forward-slash) form so reason strings,
 * cache keys, and report output stay platform-independent on Windows.
 */
export function toPosixPath(p: string): string {
  return sep === "/" ? p : p.split(sep).join("/");
}

/**
 * Remove path if it exists as a symlink or file (not a real directory).
 * Handles re-installation where symlinks from a previous install
 * conflict with directory copies.
 */
export function clearNonDirectory(path: string): void {
  try {
    if (!fs.lstatSync(path).isDirectory()) {
      fs.unlinkSync(path);
    }
  } catch {
    // Path doesn't exist
  }
}

/**
 * For each entry in sourceDir that is a directory, remove the corresponding
 * entry in destDir if it exists as a non-directory (symlink or file).
 * Prevents cpSync from failing when overwriting symlinks with directories.
 */
export function clearConflictingEntries(
  sourceDir: string,
  destDir: string,
): void {
  if (!fs.existsSync(destDir)) return;

  try {
    const entries = fs.readdirSync(sourceDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        clearNonDirectory(join(destDir, entry.name));
      }
    }
  } catch {
    // Best-effort cleanup
  }
}

/**
 * Walk up from `startDir` to the filesystem root looking for
 * `<dir>/<relativePath>`; return the first existing match or null. The root
 * directory itself is not checked (matches the historical behavior of the
 * per-module copies this consolidates).
 */
export function findFileUpwards(
  startDir: string,
  relativePath: string,
): string | null {
  let current = resolve(startDir);
  const root = parse(current).root;
  while (current !== root) {
    const candidate = join(current, relativePath);
    if (fs.existsSync(candidate)) return candidate;
    current = dirname(current);
  }
  return null;
}
