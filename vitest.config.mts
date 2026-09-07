import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      // "server-only" is a marker package that throws unless Vite/webpack
      // resolves it under the "react-server" export condition — a real
      // Next.js server build does that automatically, but Vitest's plain
      // Node environment doesn't emulate the RSC module graph, so this
      // marker would just throw a false alarm for tests that legitimately
      // import server-only modules like github.ts. It's a build-time lint
      // aid, not real runtime behavior under test, so it's stubbed out here.
      "server-only": path.resolve(import.meta.dirname, "src/lib/test-support/server-only-stub.ts"),
    },
  },
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
