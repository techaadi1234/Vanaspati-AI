import "@google/model-viewer";

export default function PlantViewer({ src, name, credit }) {
  if (!src) {
    return (
      <div className="flex h-72 items-center justify-center rounded-xl border border-dashed bg-stone-100 text-stone-500">
        3D model coming soon
      </div>
    );
  }

  return (
    <div>
      <model-viewer
        src={src}
        alt={`3D model of ${name}`}
        camera-controls
        auto-rotate
        ar
        ar-modes="webxr scene-viewer quick-look"
        shadow-intensity="1"
        loading="lazy"
        style={{ width: "100%", height: "320px", background: "#ecfdf5", borderRadius: "12px" }}
      >
        <button
          slot="ar-button"
          className="absolute bottom-3 right-3 rounded-full bg-emerald-600 px-4 py-2 text-sm text-white shadow"
        >
          📱 View in your space
        </button>
      </model-viewer>
      {credit && <p className="mt-1 text-xs text-stone-500">{credit}</p>}
    </div>
  );
}