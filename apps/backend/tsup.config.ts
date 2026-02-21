// @ts-nocheck
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs"],
  target: "es2022",
  outDir: "dist",
  clean: true,
  // Bundle workspace packages (they're TypeScript)
  // But keep @prisma/client external - it needs the query engine binary at runtime
  noExternal: ["@repo/common", "@repo/email", "@repo/database"],
  external: ["@prisma/client"],
});
