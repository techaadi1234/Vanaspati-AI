import * as ort from "onnxruntime-web";

export const USING_MOCK = false;
export const CONFIDENCE_THRESHOLD = 0.6;
const IMG = 224;

export const CLASSES = [
  { slug: "arjun", label: "Arjun" },
  { slug: "curry-leaf", label: "Curry Leaf" },
  { slug: "kalanchoe", label: "Kalanchoe" },
  { slug: "marsh-pennywort", label: "Marsh Pennywort" },
  { slug: "mint", label: "Mint" },
  { slug: "neem", label: "Neem" },
];
const LABELS = Object.fromEntries(CLASSES.map((c) => [c.slug, c.label]));

ort.env.wasm.wasmPaths = "/ort/";
ort.env.wasm.numThreads = 1; // avoids needing cross-origin isolation headers

let loading = null;
function load() {
  if (!loading) {
    loading = (async () => {
      const names = await (await fetch("/model/classes.json")).json();
      const session = await ort.InferenceSession.create("/model/herbal.onnx", {
        executionProviders: ["wasm"],
      });
      return { names, session };
    })();
    loading.catch(() => (loading = null)); // allow retry after a failure
  }
  return loading;
}

// Centre-crop to a square, resize to 224x224, return raw 0-255 RGB floats (NHWC).
async function toTensor(file) {
  const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
  const side = Math.min(bmp.width, bmp.height);
  const sx = (bmp.width - side) / 2;
  const sy = (bmp.height - side) / 2;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = IMG;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(bmp, sx, sy, side, side, 0, 0, IMG, IMG);
  bmp.close?.();
  const { data } = ctx.getImageData(0, 0, IMG, IMG);
  const out = new Float32Array(IMG * IMG * 3);
  for (let i = 0, j = 0; i < data.length; i += 4) {
    out[j++] = data[i];
    out[j++] = data[i + 1];
    out[j++] = data[i + 2];
  }
  return new ort.Tensor("float32", out, [1, IMG, IMG, 3]);
}

// Returns top-3: [{ slug, label, confidence }] sorted high to low.
export async function classifyImage(file) {
  const { names, session } = await load();
  const input = await toTensor(file);
  const result = await session.run({ [session.inputNames[0]]: input });
  const probs = result[session.outputNames[0]].data;
  return Array.from(probs, (p, i) => ({
    slug: names[i],
    label: LABELS[names[i]] ?? names[i],
    confidence: p,
  }))
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3);
}
