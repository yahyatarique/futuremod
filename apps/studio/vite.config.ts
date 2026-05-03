import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Resolve workspace packages from source so `pnpm studio` works on a
    // clean checkout without a separate `pnpm build` step first.
    // Array form with regex finds for exact package-name matching —
    // string aliases do prefix replacement, which breaks sub-path imports
    // like `@futuremod/ui/styles`.
    alias: [
      {
        find: "@futuremod/ui/styles",
        replacement: path.resolve(__dirname, "../../packages/ui/src/styles/globals.css"),
      },
      {
        find: /^@futuremod\/ui$/,
        replacement: path.resolve(__dirname, "../../packages/ui/src/index.ts"),
      },
      {
        find: /^@futuremod\/ai-context$/,
        replacement: path.resolve(__dirname, "../../packages/ai-context/src/index.ts"),
      },
      {
        find: "@",
        replacement: path.resolve(__dirname, "src"),
      },
    ],
  },
  server: {
    port: 5173,
  },
});
