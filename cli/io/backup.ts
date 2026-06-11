/**
 * Canonical backup convention for oh-my-agent.
 *
 * RULE: every backup oma writes to disk lands under a single, gitignored root
 * `<project>/.agents/backup/`, namespaced by source:
 *
 *   .agents/backup/
 *     002-shared-layout/...   ← migration file snapshots
 *     008-model-preset/...
 *     010-rename-preset/...
 *     011-unify-skills/...
 *     013-workflow-symlinks/...
 *     stack/...               ← `oma update` stack/ preservation
 *     safe-write/...          ← safeWriteJson atomic-write siblings (in-project)
 *
 * One gitignore line (`.agents/backup/`) covers all of it. `oma update` clears
 * the whole root after a successful run. This replaces the previous scatter of
 * `.migration-backup/`, `.agents/.migration-backup/`, `.agents/*.bak`,
 * `.agents/.backup-pre-008-*`, and tmpdir stack copies.
 *
 * Files written OUTSIDE a project tree (home/global vendor configs like
 * `~/.gemini/settings.json` when no `.agents/` ancestor exists) keep
 * sibling-dotfile backups — they don't pollute any repo.
 */

import { existsSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";

export { AGENTS_BACKUP_DIR } from "../constants/paths.js";

/** Absolute backup root under `cwd`. */
export function backupRoot(cwd: string): string {
  return join(cwd, ".agents", "backup");
}

/**
 * Absolute path under the backup root.
 * Example: `backupPathFromRoot(cwd, "010-rename-preset", "oma-config.yaml")`.
 */
export function backupPathFromRoot(cwd: string, ...segments: string[]): string {
  return join(backupRoot(cwd), ...segments);
}

/**
 * Walk up from a target file to the nearest directory that contains an
 * `.agents/` child (the project — or global — root). Returns null when none is
 * found within a sane depth, signalling "no project context".
 */
export function findProjectRoot(targetPath: string): string | null {
  let dir = dirname(targetPath);
  for (let i = 0; i < 64; i++) {
    if (existsSync(join(dir, ".agents"))) return dir;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

export interface SafeWriteBackupTarget {
  /** Directory the backup file is written into. */
  dir: string;
  /** Filename prefix; the timestamp suffix is appended by the caller. */
  prefix: string;
}

/**
 * Resolve where a `safeWriteJson` backup for `targetPath` should live.
 *
 * - In a project: `<root>/.agents/backup/safe-write/<rel-path>.backup-` where
 *   `<rel-path>` is the target's project-relative path with separators
 *   flattened to `__` — keeps per-target retention correct and avoids
 *   basename collisions (e.g. claude vs gemini `settings.json`).
 * - Outside any project: the legacy sibling dotfile `<dir>/.<basename>.backup-`.
 */
export function resolveSafeWriteBackup(
  targetPath: string,
): SafeWriteBackupTarget {
  const root = findProjectRoot(targetPath);
  if (root) {
    const rel = relative(root, targetPath).split(sep).join("__");
    return {
      dir: join(root, ".agents", "backup", "safe-write"),
      prefix: `${rel}.backup-`,
    };
  }
  const basename = targetPath.split(sep).pop() ?? targetPath;
  return { dir: dirname(targetPath), prefix: `.${basename}.backup-` };
}
