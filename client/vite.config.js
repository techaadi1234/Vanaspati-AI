import { copyFileSync, mkdirSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const require = createRequire(import.meta.url);
const clientRoot = dirname(fileURLToPath(import.meta.url));

function copyOrtWasm() {
  return {
    name: "copy-ort-wasm",
    buildStart() {
      const src = join(dirname(require.resolve("onnxruntime-web/package.json")), "dist");
      const dest = join(clientRoot, "public/ort");
      mkdirSync(dest, { recursive: true });
      for (const file of readdirSync(src)) {
        if (
          file.startsWith("ort-wasm-simd-threaded") &&
          (file.endsWith(".wasm") || file.endsWith(".mjs"))
        ) {
          copyFileSync(join(src, file), join(dest, file));
        }
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), copyOrtWasm()],
  server: { proxy: { "/api": "http://localhost:5001" } },
});