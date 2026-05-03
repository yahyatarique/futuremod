import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Resolve workspace packages from source so `pnpm studio` works
      // on a clean checkout without a separate `pnpm build` step.
      "@futuremod/ui": path.resolve(__dirname, "../../packages/ui/src/index.ts"),
      "@futuremod/ai-context": path.resolve(__dirname, "../../packages/ai-context/src/index.ts"),
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    port: 5173,
  },
});
