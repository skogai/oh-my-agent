/**
 * Antigravity CLI (agy) wiring. Two surfaces, two locations (per the official
 * contract at antigravity.google/docs/hooks, cross-checked against the binary):
 *
 *   1. HOOKS → a `hooks.json` in agy's customization directory. agy auto-loads
 *      it from the workspace root `.agents/` (or `~/.gemini/config/`). We write
 *      the project's `<workspace>/.agents/hooks.json`. The schema is a top-level
 *      map of hook NAME → event config:
 *        - lifecycle events (PreInvocation / PostInvocation / Stop): an array of
 *          handler objects directly (matcher ignored)
 *        - tool events (PreToolUse / PostToolUse): an array of
 *          `{ matcher, hooks: [handler] }` (matcher is a tool-name regex,
 *          e.g. `run_command`)
 *        - handler = `{ type:"command", command, timeout }` (timeout in SECONDS)
 *      Hooks inject context via PreInvocation `injectSteps` and gate Stop via
 *      `decision:"continue"` — see hook-output.ts.
 *
 *   2. STATUS LINE → a native `statusLine` field in agy's HOME settings.json
 *      (`~/.gemini/antigravity-cli/settings.json`). agy persists only its own
 *      settings allowlist there and STRIPS unknown keys on launch — verified
 *      that `hooks` and `defaultHooksPath` are both dropped, so we never write
 *      them. The HUD command runs from a HOME copy of the core hooks.
 *
 * NOTE: agy hooks fire on the interactive execution loop; headless `agy --print`
 * does not run them, so live firing must be confirmed in an interactive session.
 */

import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { clearNonDirectory } from "../../utils/fs-utils.js";

const AGY_HOME_DIR = ".gemini/antigravity-cli";
const ANTIGRAVITY_VARIANT = ".agents/hooks/variants/antigravity.json";
// agy's customization directory in the workspace is `.agents/`; hooks.json
// sits at its root and is auto-loaded.
const PROJECT_HOOKS_JSON = join(".agents", "hooks.json");
const PROJECT_CORE_HOOKS = join(".agents", "hooks", "core");
// Lifecycle events take handler arrays directly; tool events wrap handlers in
// `{ matcher, hooks: [...] }`.
const TOOL_EVENTS = new Set(["PreToolUse", "PostToolUse"]);

interface HookRef {
  hook: string;
  matcher?: string;
  timeout: number;
}

interface AntigravityVariant {
  events: Record<string, HookRef | HookRef[]>;
  statusLine?: { hook: string };
}

interface AgySettings {
  // biome-ignore lint/suspicious/noExplicitAny: settings.json schema is dynamic
  [key: string]: any;
}

function homePaths() {
  const home = homedir();
  const settingsPath = join(home, AGY_HOME_DIR, "settings.json");
  const hooksDir = join(home, AGY_HOME_DIR, "hooks");
  const staleHooksJson = join(home, AGY_HOME_DIR, "hooks.json");
  return { home, settingsPath, hooksDir, staleHooksJson };
}

function readAgySettings(settingsPath: string): AgySettings {
  if (!existsSync(settingsPath)) return {};
  try {
    return JSON.parse(readFileSync(settingsPath, "utf-8"));
  } catch {
    return {};
  }
}

function copyCoreHooks(sourceDir: string, hooksDir: string): void {
  const src = join(sourceDir, PROJECT_CORE_HOOKS);
  if (!existsSync(src)) return;

  mkdirSync(hooksDir, { recursive: true });
  for (const entry of readdirSync(hooksDir, { withFileTypes: true })) {
    clearNonDirectory(join(hooksDir, entry.name));
  }
  cpSync(src, hooksDir, { recursive: true, force: true, dereference: true });
}

function readAntigravityVariant(sourceDir: string): AntigravityVariant {
  const path = join(sourceDir, ANTIGRAVITY_VARIANT);
  try {
    return JSON.parse(readFileSync(path, "utf-8")) as AntigravityVariant;
  } catch {
    return {
      events: {
        PreInvocation: [
          { hook: "keyword-detector.ts", timeout: 5 },
          { hook: "state-boundary.ts", timeout: 5 },
          { hook: "skill-injector.ts", timeout: 3 },
        ],
        PreToolUse: {
          hook: "test-filter.ts",
          matcher: "run_command",
          timeout: 5,
        },
        Stop: { hook: "persistent-mode.ts", timeout: 5 },
      },
      statusLine: { hook: "hud.ts" },
    };
  }
}

function hookName(hook: string): string {
  return hook.replace(/\.[^.]+$/, "");
}

type AgyHooksDoc = Record<string, Record<string, unknown[]>>;

/**
 * Build agy's `hooks.json` document: a top-level map of hook name → event
 * config. Each OMA core hook gets its own named entry; commands point at the
 * project's core hooks by absolute path so resolution is cwd-independent.
 */
function buildAgyHooksDoc(
  coreHooksDir: string,
  variant: AntigravityVariant,
): AgyHooksDoc {
  const doc: AgyHooksDoc = {};
  for (const [eventName, rawConfig] of Object.entries(variant.events)) {
    const configs = Array.isArray(rawConfig) ? rawConfig : [rawConfig];
    for (const config of configs) {
      const handler = {
        type: "command",
        command: `bun "${join(coreHooksDir, config.hook)}"`,
        timeout: config.timeout,
      };
      const entry = TOOL_EVENTS.has(eventName)
        ? [
            {
              ...(config.matcher ? { matcher: config.matcher } : {}),
              hooks: [handler],
            },
          ]
        : [handler];
      const name = `oma-${hookName(config.hook)}`;
      doc[name] = { ...(doc[name] ?? {}), [eventName]: entry };
    }
  }
  return doc;
}

interface AgyInstallResult {
  installed: boolean;
  reason?: string;
  settingsPath?: string;
  hooksJsonPath?: string;
  hooksDir?: string;
}

/**
 * Wire OMA into agy: write the project `.agents/hooks.json` (hook events) and
 * the HOME `statusLine` (HUD). Idempotent. Preserves unrelated settings keys
 * (colorScheme, toolPermission, trustedWorkspaces, ...).
 *
 * Returns `installed: false` with a `reason` when agy's HOME config dir doesn't
 * exist (agy not installed / never run) — we don't bootstrap it ourselves.
 */
export function installAntigravityHud(sourceDir: string): AgyInstallResult {
  const { settingsPath, hooksDir, staleHooksJson } = homePaths();
  const agyConfigDir = join(homedir(), AGY_HOME_DIR);

  if (!existsSync(agyConfigDir)) {
    return {
      installed: false,
      reason: `agy config dir not found at ~/${AGY_HOME_DIR} — run agy once to initialize`,
    };
  }

  // HOME copy of core hooks — backs the statusLine (HUD) command.
  copyCoreHooks(sourceDir, hooksDir);

  const variant = readAntigravityVariant(sourceDir);
  const statusLineHook = variant.statusLine?.hook ?? "hud.ts";

  // Project hooks.json — agy auto-loads it from the workspace `.agents/` root.
  // Commands point at the project's own core hooks (absolute, cwd-independent).
  const hooksJsonPath = join(sourceDir, PROJECT_HOOKS_JSON);
  const coreHooksDir = join(sourceDir, PROJECT_CORE_HOOKS);
  let writtenHooksJson: string | undefined;
  if (existsSync(coreHooksDir)) {
    mkdirSync(join(sourceDir, ".agents"), { recursive: true });
    writeFileSync(
      hooksJsonPath,
      `${JSON.stringify(buildAgyHooksDoc(coreHooksDir, variant), null, 2)}\n`,
    );
    writtenHooksJson = hooksJsonPath;
  }

  // HOME settings.json: wire the native statusLine; never write hooks/
  // defaultHooksPath (agy strips them). Remove dead keys from earlier installs.
  const settings = readAgySettings(settingsPath);
  settings.statusLine = {
    type: "command",
    command: `bun "${join(hooksDir, statusLineHook)}"`,
  };
  if ("hooks" in settings) delete settings.hooks;
  if ("defaultHooksPath" in settings) delete settings.defaultHooksPath;
  mkdirSync(agyConfigDir, { recursive: true });
  writeFileSync(settingsPath, `${JSON.stringify(settings, null, 2)}\n`);

  // Remove the stale HOME hooks.json written by earlier (incorrect) installs —
  // agy never loaded it from there.
  if (existsSync(staleHooksJson)) {
    try {
      unlinkSync(staleHooksJson);
    } catch {
      // best-effort cleanup
    }
  }

  return {
    installed: true,
    settingsPath,
    hooksJsonPath: writtenHooksJson,
    hooksDir,
  };
}
