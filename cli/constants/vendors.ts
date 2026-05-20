import type { CliTool, CliVendor } from "../types/index.js";

export const REPO = "first-fluke/oh-my-agent";
export const INSTALLED_SKILLS_DIR = ".agents/skills";

/**
 * Canonical vendor set: host LLM CLIs that have both a type identity and a
 * hook-detection identity in this codebase. Single source of truth consumed
 * by validators, registries, doc-merging loops in cli/, and the derived
 * `VendorType` in `cli/types/vendors.ts`. NOTE: cursor is included here
 * because it has hook detection, rules generation, and CLI binary identity,
 * even though it lacks a full runtime adapter under `cli/vendors/cursor/`.
 * Sites that require a fully implemented runtime (doctor probe, agent
 * review, native dispatch) keep their own narrower lists.
 */
export const VENDORS = [
  "antigravity",
  "claude",
  "codex",
  "cursor",
  "gemini",
  "qwen",
] as const;

/**
 * All CLI tools including non-hook vendors (skill-install only).
 * Derived from VENDORS plus the install-only targets, sorted alphabetically
 * for deterministic output where consumers iterate.
 */
export const ALL_CLI_VENDORS: CliVendor[] = [
  ...VENDORS,
  "copilot",
  "hermes",
].sort() as CliVendor[];

export type SkillTargetBase = "project" | "home";

export interface SkillTargetSpec {
  base: SkillTargetBase;
  path: string;
}

export const CLI_SKILLS_DIR: Record<CliTool, SkillTargetSpec> = {
  claude: { base: "project", path: ".claude/skills" },
  copilot: { base: "project", path: ".github/skills" },
  hermes: { base: "home", path: ".hermes/skills/oma" },
};
