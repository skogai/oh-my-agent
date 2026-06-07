/**
 * Tests for selectTransport — design 019, §2.7 + §2.8 + edge case 4.2.
 *
 * Verifies that:
 *   1. selectTransport() returns an InProcessTransport today (daemon not yet impl).
 *   2. OMA_HOOK_SOCKET env var is accepted without crashing (probe falls back gracefully).
 *   3. An explicit non-existent socketPath falls back gracefully (edge case 4.2: stale socket).
 */

import { afterEach, describe, expect, it } from "vitest";
import { InProcessTransport, selectTransport } from "./transport.js";

describe("selectTransport", () => {
  const originalEnv = process.env.OMA_HOOK_SOCKET;

  afterEach(() => {
    // Restore env after each test that may mutate it.
    if (originalEnv === undefined) {
      delete process.env.OMA_HOOK_SOCKET;
    } else {
      process.env.OMA_HOOK_SOCKET = originalEnv;
    }
  });

  it("returns an InProcessTransport when no socket env is set", async () => {
    delete process.env.OMA_HOOK_SOCKET;
    const transport = await selectTransport();
    expect(transport).toBeInstanceOf(InProcessTransport);
  });

  it("returns an InProcessTransport when OMA_HOOK_SOCKET points to a non-existent path (edge case 4.2 — stale socket)", async () => {
    // Simulate a stale / non-existent daemon socket path.
    process.env.OMA_HOOK_SOCKET = "/tmp/__oma_hook_nonexistent_test.sock";
    const transport = await selectTransport();
    expect(transport).toBeInstanceOf(InProcessTransport);
  });

  it("returns an InProcessTransport when socketPath opt points to a non-existent path", async () => {
    const transport = await selectTransport({
      socketPath: "/tmp/__oma_hook_nonexistent_opts_test.sock",
      connectTimeoutMs: 50,
    });
    expect(transport).toBeInstanceOf(InProcessTransport);
  });

  it("returns an InProcessTransport when cwd is provided (per-project default path probe)", async () => {
    delete process.env.OMA_HOOK_SOCKET;
    const transport = await selectTransport({ cwd: "/tmp" });
    expect(transport).toBeInstanceOf(InProcessTransport);
  });

  it("returned transport dispatches without throwing (fail-open integration)", async () => {
    const transport = await selectTransport();
    // dispatch with a minimal valid HookRequest — no handlers registered in test
    // env, so output should be empty string (no-op) and must not throw.
    const response = await transport.dispatch({
      vendor: "claude",
      nativeEvent: "UserPromptSubmit",
      rawStdin: "{}",
      cwd: "/tmp",
    });
    expect(typeof response.output).toBe("string");
  });
});
