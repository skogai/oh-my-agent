import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  AGENTS_BACKUP_DIR,
  backupPathFromRoot,
  backupRoot,
  findProjectRoot,
  resolveSafeWriteBackup,
} from "./backup.js";

describe("backup paths", () => {
  it("AGENTS_BACKUP_DIR is the canonical gitignored root", () => {
    expect(AGENTS_BACKUP_DIR).toBe(".agents/backup");
  });

  it("backupRoot / backupPathFromRoot resolve under <cwd>/.agents/backup", () => {
    expect(backupRoot("/repo")).toBe(join("/repo", ".agents", "backup"));
    expect(
      backupPathFromRoot("/repo", "010-rename-preset", "oma-config.yaml"),
    ).toBe(
      join(
        "/repo",
        ".agents",
        "backup",
        "010-rename-preset",
        "oma-config.yaml",
      ),
    );
  });
});

describe("findProjectRoot / resolveSafeWriteBackup", () => {
  let repo: string;

  beforeEach(() => {
    repo = mkdtempSync(join(tmpdir(), "oma-backup-test-"));
    mkdirSync(join(repo, ".agents"), { recursive: true });
  });

  afterEach(() => {
    rmSync(repo, { recursive: true, force: true });
  });

  it("finds the project root from a nested target", () => {
    const target = join(repo, ".claude", "settings.json");
    expect(findProjectRoot(target)).toBe(repo);
  });

  it("centralizes backups under .agents/backup/safe-write for in-project targets", () => {
    const target = join(repo, ".claude", "settings.json");
    const { dir, prefix } = resolveSafeWriteBackup(target);
    expect(dir).toBe(join(repo, ".agents", "backup", "safe-write"));
    // relative path flattened with __ so distinct targets never collide
    expect(prefix).toBe(`.claude__settings.json.backup-`);
  });

  it("disambiguates same-basename targets by their relative path", () => {
    const a = resolveSafeWriteBackup(join(repo, ".claude", "settings.json"));
    const b = resolveSafeWriteBackup(join(repo, ".gemini", "settings.json"));
    expect(a.dir).toBe(b.dir);
    expect(a.prefix).not.toBe(b.prefix);
  });

  it("falls back to a sibling dotfile when no project root exists", () => {
    const lone = mkdtempSync(join(tmpdir(), "oma-noproject-"));
    try {
      const target = join(lone, "settings.json");
      writeFileSync(target, "{}");
      const { dir, prefix } = resolveSafeWriteBackup(target);
      expect(dir).toBe(lone);
      expect(prefix).toBe(".settings.json.backup-");
    } finally {
      rmSync(lone, { recursive: true, force: true });
    }
  });
});
