import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Cada arquivo levanta o próprio Postgres em WASM e aplica ~20 migrações.
    // O padrão de 5s não cobre isso nem em máquina rápida.
    testTimeout: 120_000,
    hookTimeout: 120_000,
  },
});
