import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import pc from "picocolors";
import { VENDORS } from "../../constants/vendors.js";
import {
  generateCursorRules,
  mergeRulesIndexForVendor,
} from "../../platform/rules.js";
import {
  createCliSymlinks,
  detectExistingCliSymlinkDirs,
  ensureCursorMcpConfig,
  getInstalledSkillNames,
  installCodexWorkflowSkills,
  installCopilotWorkflowPrompts,
  installVendorAdaptations,
  isHookVendor,
  readVendorsFromConfig,
  vendorRequiresHomeConsent,
} from "../../platform/skills-installer.js";
import type { CliVendor } from "../../types/index.js";
import { loadSerenaConfig } from "../../utils/config.js";
import {
  applyRecommendedClaudeMcp,
  needsClaudeMcpUpdate,
} from "../../vendors/claude/mcp.js";
import {
  applyRecommendedCodexSettings,
  needsCodexSettingsUpdate,
  parseCodexConfig,
  serializeCodexConfig,
} from "../../vendors/codex/settings.js";
import {
  applyRecommendedGeminiSettings,
  needsGeminiSettingsUpdate,
} from "../../vendors/gemini/settings.js";
import {
  applyRecommendedQwenSettings,
  needsQwenSettingsUpdate,
} from "../../vendors/qwen/settings.js";

/**
 * Regenerate all vendor-specific files (.claude/, .cursor/, .gemini/, etc.)
 * from the SSOT in .agents/ without a full install or update.
 *
 * Useful during development of hooks, agents, or rules.
 */
export function link(vendorFilter?: string[]): void {
  const cwd = process.cwd();

  if (!existsSync(join(cwd, ".agents"))) {
    console.error(
      `${pc.red("✗")} No .agents/ directory found. Run ${pc.cyan("oma install")} first.`,
    );
    process.exitCode = 1;
    return;
  }

  // Determine vendors to regenerate
  let configuredVendors: CliVendor[];
  if (vendorFilter && vendorFilter.length > 0) {
    configuredVendors = vendorFilter as CliVendor[];
  } else {
    configuredVendors = readVendorsFromConfig(cwd);
  }

  const hookVendors = configuredVendors.filter(isHookVendor);

  if (hookVendors.length === 0) {
    console.log(`${pc.yellow("⚠")} No vendors to link.`);
    return;
  }

  console.log(
    `${pc.blue("●")} Linking vendors: ${hookVendors.map((v) => pc.cyan(v)).join(", ")}`,
  );

  // 1. Install vendor-specific adaptations (agents, hooks, settings)
  installVendorAdaptations(cwd, cwd, hookVendors);

  const serenaCfg = loadSerenaConfig(cwd);

  // 2. Gemini-specific settings — serena MCP follows oma-config serena.mode.
  //    stdio (default): direct `serena start-mcp-server --context=ide`.
  //    bridge + bridge_host=gemini: `{url: bridge_url}` so Gemini shares the
  //    HTTP serena started by `oma bridge` (used when subagent fan-out
  //    matters or when paired with Antigravity).
  if (configuredVendors.includes("gemini")) {
    const geminiSettingsPath = join(cwd, ".gemini", "settings.json");
    let geminiSettings: unknown = {};
    if (existsSync(geminiSettingsPath)) {
      try {
        geminiSettings = JSON.parse(readFileSync(geminiSettingsPath, "utf-8"));
      } catch {
        geminiSettings = {};
      }
    }
    if (needsGeminiSettingsUpdate(geminiSettings)) {
      applyRecommendedGeminiSettings(geminiSettings);
      writeFileSync(
        geminiSettingsPath,
        `${JSON.stringify(geminiSettings, null, 2)}\n`,
      );
    }
    // Override serena entry for bridge mode (settings.ts only knows stdio).
    if (serenaCfg.mode === "bridge" && serenaCfg.bridgeHost === "gemini") {
      let parsed: Record<string, unknown> = {};
      try {
        parsed = JSON.parse(readFileSync(geminiSettingsPath, "utf-8"));
      } catch {
        parsed = {};
      }
      const mcpServers =
        parsed.mcpServers &&
        typeof parsed.mcpServers === "object" &&
        !Array.isArray(parsed.mcpServers)
          ? (parsed.mcpServers as Record<string, unknown>)
          : {};
      mcpServers.serena = { url: serenaCfg.bridgeUrl };
      parsed.mcpServers = mcpServers;
      writeFileSync(geminiSettingsPath, `${JSON.stringify(parsed, null, 2)}\n`);
    }
  }

  // 2b. Qwen-specific settings
  if (configuredVendors.includes("qwen")) {
    const qwenSettingsPath = join(cwd, ".qwen", "settings.json");
    let qwenSettings: unknown = {};
    if (existsSync(qwenSettingsPath)) {
      try {
        qwenSettings = JSON.parse(readFileSync(qwenSettingsPath, "utf-8"));
      } catch {
        qwenSettings = {};
      }
    }
    if (needsQwenSettingsUpdate(qwenSettings)) {
      const next = applyRecommendedQwenSettings(qwenSettings);
      mkdirSync(dirname(qwenSettingsPath), { recursive: true });
      writeFileSync(qwenSettingsPath, `${JSON.stringify(next, null, 2)}\n`);
    }
  }

  // 2c. Copilot-specific: workflow prompt wrappers under .github/prompts/
  if (configuredVendors.includes("copilot")) {
    installCopilotWorkflowPrompts(cwd, cwd);
  }

  // 2d. Codex-specific settings
  if (configuredVendors.includes("codex")) {
    installCodexWorkflowSkills(cwd, cwd);
    const codexConfigPath = join(cwd, ".codex", "config.toml");
    const rawToml = existsSync(codexConfigPath)
      ? readFileSync(codexConfigPath, "utf-8")
      : "";
    const codexSettings = parseCodexConfig(rawToml);
    if (needsCodexSettingsUpdate(codexSettings)) {
      const next = applyRecommendedCodexSettings(codexSettings);
      mkdirSync(dirname(codexConfigPath), { recursive: true });
      writeFileSync(codexConfigPath, `${serializeCodexConfig(next)}\n`);
    }
  }

  // 2e. Claude Code project-level MCP (`.mcp.json` at project root, serena
  //     with --context=claude-code, shared via version control). When the
  //     file is missing, seed mcpServers from the SSOT `.agents/mcp.json` so
  //     other servers (chrome-devtools, context7, etc.) are also exposed to
  //     Claude. Existing user customizations in `.mcp.json` are preserved.
  if (configuredVendors.includes("claude")) {
    const claudeMcpPath = join(cwd, ".mcp.json");
    const claudeMcpExists = existsSync(claudeMcpPath);
    let claudeMcp: unknown = {};
    if (claudeMcpExists) {
      try {
        claudeMcp = JSON.parse(readFileSync(claudeMcpPath, "utf-8"));
      } catch {
        claudeMcp = {};
      }
    } else {
      // Seed from SSOT so Claude sees the same MCP server set as Cursor.
      const agentsMcpPath = join(cwd, ".agents", "mcp.json");
      if (existsSync(agentsMcpPath)) {
        try {
          const ssot = JSON.parse(readFileSync(agentsMcpPath, "utf-8"));
          if (ssot && typeof ssot === "object" && ssot.mcpServers) {
            claudeMcp = { mcpServers: ssot.mcpServers };
          }
        } catch {
          claudeMcp = {};
        }
      }
    }
    if (!claudeMcpExists || needsClaudeMcpUpdate(claudeMcp)) {
      const next = applyRecommendedClaudeMcp(claudeMcp);
      writeFileSync(claudeMcpPath, `${JSON.stringify(next, null, 2)}\n`);
    }
  }

  // 3. Cursor-specific: MCP config (regular file, serena with --context=ide) + rules
  if (configuredVendors.includes("cursor")) {
    ensureCursorMcpConfig(cwd);
    generateCursorRules(cwd);
  }

  // 4. Merge vendor documentation (CLAUDE.md, GEMINI.md, AGENTS.md)
  const mergedFiles = new Set<string>();
  for (const v of VENDORS) {
    if (!configuredVendors.includes(v)) continue;
    const target =
      v === "claude" ? "CLAUDE.md" : v === "gemini" ? "GEMINI.md" : "AGENTS.md";
    if (mergedFiles.has(target)) continue;
    if (mergeRulesIndexForVendor(cwd, v)) {
      mergedFiles.add(target);
    }
  }

  // 5. Refresh CLI skill symlinks. HOME-write vendors only proceed if
  // already in oma-config (consent recorded by `oma install`).
  const cliTools = detectExistingCliSymlinkDirs(cwd);
  if (cliTools.length > 0) {
    const skillNames = getInstalledSkillNames(cwd);
    const recordedVendors = readVendorsFromConfig(cwd);
    const safeCliTools = cliTools.filter(
      (cli) => !vendorRequiresHomeConsent(cli) || recordedVendors.includes(cli),
    );
    createCliSymlinks(cwd, safeCliTools, skillNames);
  }

  // Summary
  const parts: string[] = [];
  for (const v of hookVendors) {
    parts.push(`${pc.green("✓")} ${v}`);
  }
  if (mergedFiles.size > 0) {
    parts.push(`${pc.green("✓")} docs: ${[...mergedFiles].join(", ")}`);
  }

  console.log(parts.join("\n"));
  console.log(`\n${pc.green("✓")} Linked ${hookVendors.length} vendor(s).`);
}
