import { isRecord } from "../../utils/type-guards.js";
import {
  RECOMMENDED_CHROME_DEVTOOLS_MCP,
  serenaStartMcpArgs,
} from "../serena.js";
import {
  applyPrivacyTelemetry,
  applyRecommendedMcpServers,
  filterMcpServerKeys,
  type McpServerEntry,
  needsPrivacyTelemetryUpdate,
  needsRecommendedMcpUpdate,
} from "../settings-shared.js";

/**
 * Recommended Gemini CLI settings managed by oh-my-agent.
 * Applies to project-local `.gemini/settings.json`.
 */

export const RECOMMENDED_GEMINI_GENERAL = {
  enableNotifications: true,
} as const;

export const RECOMMENDED_GEMINI_EXPERIMENTAL = {
  enableAgents: true,
} as const;

export const RECOMMENDED_GEMINI_MCP = {
  "chrome-devtools": RECOMMENDED_CHROME_DEVTOOLS_MCP,
  serena: {
    command: "serena",
    args: serenaStartMcpArgs("ide"),
    env: {
      SERENA_LOG_LEVEL: "info",
    },
  },
};

/**
 * Legacy bridge URL that oma previously wrote for Gemini. We detect it on
 * upgrade and replace with the stdio recommendation above. Custom user URLs
 * (anything else) are left alone so power users keep their own bridge setup.
 */
export const LEGACY_GEMINI_BRIDGE_URL = "http://localhost:12341/mcp";

// `privacy.usageStatisticsEnabled` (default true) controls anonymized usage
// stats sent to Google. Gated on the `telemetry` flag from oma-config.yaml
// (default off → flag set to false).
export interface GeminiSettingsOptions {
  /** When true, omit `privacy.usageStatisticsEnabled` opt-out so usage stats flow normally. */
  telemetry?: boolean;
}

type JsonRecord = Record<string, unknown>;

interface GeminiMcpServer extends McpServerEntry {
  env?: Record<string, string>;
  cwd?: string;
  headers?: Record<string, string>;
  type?: string;
  timeout?: number;
  trust?: boolean;
  description?: string;
  includeTools?: string[];
  excludeTools?: string[];
  extension?: Record<string, string | boolean | number>;
  oauth?: Record<string, unknown>;
  authProviderType?: string;
  targetAudience?: string;
  targetServiceAccount?: string;
}

export interface GeminiSettings {
  general?: JsonRecord;
  experimental?: JsonRecord;
  mcpServers?: Record<string, GeminiMcpServer>;
  [key: string]: unknown;
}

const GEMINI_ALLOWED_MCP_SERVER_KEYS = new Set([
  "command",
  "args",
  "env",
  "cwd",
  "url",
  "httpUrl",
  "headers",
  "tcp",
  "type",
  "timeout",
  "trust",
  "description",
  "includeTools",
  "excludeTools",
  "extension",
  "oauth",
  "authProviderType",
  "targetAudience",
  "targetServiceAccount",
]);

function sanitizeGeminiMcpServer(server: GeminiMcpServer): GeminiMcpServer {
  const nextServer = filterMcpServerKeys(
    server,
    GEMINI_ALLOWED_MCP_SERVER_KEYS,
  );

  const legacyAvailableTools = server.available_tools;
  if (
    Array.isArray(legacyAvailableTools) &&
    nextServer.includeTools === undefined
  ) {
    nextServer.includeTools = legacyAvailableTools
      .map((tool) => String(tool).trim())
      .filter(Boolean);
  }

  return nextServer;
}

export function sanitizeGeminiSettings(rawSettings: unknown): GeminiSettings {
  const geminiSettings = normalizeGeminiSettings(rawSettings);

  if (geminiSettings.mcpServers) {
    geminiSettings.mcpServers = Object.fromEntries(
      Object.entries(geminiSettings.mcpServers).map(([name, server]) => [
        name,
        sanitizeGeminiMcpServer(server),
      ]),
    );
  }

  return geminiSettings;
}

function normalizeGeminiSettings(input: unknown): GeminiSettings {
  if (!isRecord(input)) return {};

  const general = isRecord(input.general) ? input.general : undefined;
  const experimental = isRecord(input.experimental)
    ? input.experimental
    : undefined;
  const mcpServers = isRecord(input.mcpServers)
    ? (input.mcpServers as Record<string, GeminiMcpServer>)
    : undefined;

  return {
    ...input,
    general,
    experimental,
    mcpServers,
  };
}

export function needsGeminiSettingsUpdate(
  rawSettings: unknown,
  options: GeminiSettingsOptions = {},
): boolean {
  const normalizedSettings = normalizeGeminiSettings(rawSettings);
  const geminiSettings = sanitizeGeminiSettings(rawSettings);

  if (JSON.stringify(normalizedSettings) !== JSON.stringify(geminiSettings)) {
    return true;
  }

  const general = geminiSettings.general;
  if (!general) return true;

  for (const [key, expected] of Object.entries(RECOMMENDED_GEMINI_GENERAL)) {
    if (general[key] !== expected) return true;
  }

  const experimental = geminiSettings.experimental;
  if (!experimental) return true;

  for (const [key, expected] of Object.entries(
    RECOMMENDED_GEMINI_EXPERIMENTAL,
  )) {
    if (experimental[key] !== expected) return true;
  }

  if (needsRecommendedMcpUpdate(geminiSettings.mcpServers)) return true;

  return needsPrivacyTelemetryUpdate(geminiSettings, options.telemetry);
}

export function applyGeminiSettings(
  rawSettings: unknown,
  options: GeminiSettingsOptions = {},
): GeminiSettings {
  const geminiSettings = sanitizeGeminiSettings(rawSettings);

  geminiSettings.general = {
    ...(geminiSettings.general || {}),
    ...RECOMMENDED_GEMINI_GENERAL,
  };

  geminiSettings.experimental = {
    ...(geminiSettings.experimental || {}),
    ...RECOMMENDED_GEMINI_EXPERIMENTAL,
  };

  geminiSettings.mcpServers = applyRecommendedMcpServers(
    geminiSettings.mcpServers,
    RECOMMENDED_GEMINI_MCP,
  );

  applyPrivacyTelemetry(geminiSettings, options.telemetry);

  return geminiSettings;
}
