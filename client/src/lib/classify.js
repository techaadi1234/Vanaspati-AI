// The one place the rest of the app talks to the classifier.
// Swap the body of classifyImage() for the real model later; the shape stays the same.

export const USING_MOCK = true;
export const CONFIDENCE_THRESHOLD = 0.6;

export const CLASSES = [
  { slug: "arjun", label: "Arjun" },
  { slug: "curry-leaf", label: "Curry Leaf" },
  { slug: "kalanchoe", label: "Kalanchoe" },
  { slug: "marsh-pennywort", label: "Marsh Pennywort" },
  { slug: "mint", label: "Mint" },
  { slug: "neem", label: "Neem" },
];

// Returns top-3: [{ slug, label, confidence }] sorted high to low.
export async function classifyImage(file) {
  await new Promise((r) => setTimeout(r, 600)); // fake latency

  // Cycle through three outcomes by file size so every UI state can be tested.
  const mode = file.size % 3;
  const start = file.size % CLASSES.length;
  const pick = (i) => CLASSES[(start + i) % CLASSES.length];

  const scores =
    mode === 0 ? [0.86, 0.09, 0.03] // confident
    : mode === 1 ? [0.48, 0.31, 0.12] // ambiguous: below threshold
    : [0.35, 0.28, 0.2]; // unsure

  return scores.map((confidence, i) => ({ ...pick(i), confidence }));
}