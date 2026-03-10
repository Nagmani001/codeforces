import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@repo/database/client": path.resolve(__dirname, "../../packages/database/src/index.ts"),
      "@repo/database/seed": path.resolve(__dirname, "../../packages/database/prisma/seed.ts"),
      "@repo/database/": path.resolve(__dirname, "../../packages/database/src/"),
    },
  },
  test: {
    testTimeout: 30000,
    hookTimeout: 30000,
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    sequence: {
      concurrent: false,
    },
  },
});
