import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Without an explicit root/include, Vitest's default discovery walks the
    // whole repository — which silently picks up the identical test files
    // living inside .claude/worktrees/**/src (a nested git worktree checked
    // out under this repo), doubling every test file and its count with no
    // indication anything was duplicated. Scoping to this project's own src/
    // is both correct and sufficient: there are no tests anywhere else.
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
});
