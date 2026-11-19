import { copyFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const clientRoot = dirname(fileURLToPath(import.meta.url));
const NEEDED = ["ort-wasm-simd-threaded.mjs", "ort-wasm-simd-threaded.wasm"];

function copyOrtWasm() {
  return {
    name: "copy-ort-wasm",
    buildStart() {
      const src = join(clientRoot, "node_modules/onnxruntime-web/dist");
      const dest = join(clientRoot, "public/ort");
      mkdirSync(dest, { recursive: true });
      for (const file of NEEDED) {
        if (!existsSync(join(src, file))) {
          throw new Error(`onnxruntime-web file not found: ${file}`);
        }
        copyFileSync(join(src, file), join(dest, file));
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), copyOrtWasm()],
  server: { proxy: { "/api": "http://localhost:5001" } },
});
