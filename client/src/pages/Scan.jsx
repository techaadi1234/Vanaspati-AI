import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { classifyImage, CONFIDENCE_THRESHOLD } from "../lib/classify";

export default function Scan() {
  const [preview, setPreview] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Free the object URL when the preview changes or the page unmounts.
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  async function onFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setResults(null);
    setPreview(URL.createObjectURL(file));
    setLoading(true);
    try {
      setResults(await classifyImage(file));
    } catch (err) {
      console.error(err);
      setError("Could not analyse this image. Try another photo.");
    } finally {
      setLoading(false);
    }
  }

  const top = results?.[0];
  const sure = top && top.confidence >= CONFIDENCE_THRESHOLD;

  return (
    <div className="mx-auto max-w-xl p-4">
      <h1 className="text-2xl font-semibold">Identify a leaf</h1>
      <p className="mt-1 text-sm text-gray-600">
        Supports 6 species only. Use a clear, well-lit photo of a single leaf.
      </p>
      <div className="mt-3 rounded border border-amber-400 bg-amber-50 p-2 text-sm text-amber-900">
        EXPERIMENTAL: trained on a small public dataset, not yet validated on field photos. It can only name 6 species and may mislabel non-leaf images.
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <label className="cursor-pointer rounded bg-green-700 px-4 py-2 text-white">
          Take photo
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={onFile}
          />
        </label>
        <label className="cursor-pointer rounded border border-green-700 px-4 py-2 text-green-800">
          Upload image
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFile}
          />
        </label>
      </div>

      {preview && (
        <img
          src={preview}
          alt="Your leaf"
          className="mt-4 max-h-72 w-full rounded object-contain"
        />
      )}

      {loading && <p className="mt-4">Analysing…</p>}
      {error && <p className="mt-4 text-red-600">{error}</p>}

      {results && !loading && (
        <div className="mt-4">
          {sure ? (
            <p className="font-medium">Most likely:</p>
          ) : (
            <p className="rounded bg-gray-100 p-2 font-medium">
              Not sure. Try another angle, closer to one leaf, in daylight.
              Best guesses:
            </p>
          )}
          <ul className="mt-2 space-y-2">
            {results.map((r) => (
              <li
                key={r.slug}
                className="flex items-center justify-between rounded border p-3"
              >
                <Link
                  to={`/plants/${r.slug}`}
                  className="text-green-800 underline"
                >
                  {r.label}
                </Link>
                <span className="text-sm text-gray-600">
                  {Math.round(r.confidence * 100)}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}