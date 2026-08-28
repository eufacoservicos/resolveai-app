import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      include: [
        "src/lib/cpf.ts",
        "src/lib/cep.ts",
        "src/lib/constants.ts",
        "src/lib/business-hours.ts",
        "src/lib/utils.ts",
        "src/components/providers/provider-detail.tsx",
        "src/components/providers/provider-card.tsx",
        "src/components/providers/business-hours-display.tsx",
        "src/components/reviews/review-card.tsx",
      ],
      thresholds: {
        statements: 80,
        branches: 70,
        functions: 75,
        lines: 80,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
