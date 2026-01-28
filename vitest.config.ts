import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "happy-dom",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@core": path.resolve(__dirname, "./src/_core"),
      "@app": path.resolve(__dirname, "./src/_app"),
    },
  },
});
