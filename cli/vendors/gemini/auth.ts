import { homedir } from "node:os";
import { join } from "node:path";
import { safeReadJson } from "../../utils/safe-json.js";

export function isGeminiAuthenticated(): boolean {
  const creds = safeReadJson<{
    access_token?: unknown;
    refresh_token?: unknown;
  }>(join(homedir(), ".gemini", "oauth_creds.json"));
  return !!(creds?.access_token && creds?.refresh_token);
}
