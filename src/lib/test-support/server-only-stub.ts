// Test-only stand-in for the "server-only" npm package (see vitest.config.mts's
// alias comment) — a real build resolves it to an empty module via the
// "react-server" export condition; this is the same no-op for the test
// environment, which doesn't emulate that condition.
export {};
