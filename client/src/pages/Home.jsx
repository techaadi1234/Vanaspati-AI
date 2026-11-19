import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const SYSTEMS = ["Ayurveda", "Yoga", "Unani", "Siddha", "Homeopathy"];

export default function Home() {
  const [q, setQ] = useState("");
  const [system, setSystem] = useState("");
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        setError("");
        const params = new URLSearchParams();
        if (q) params.set("q", q);
        if (system) params.set("system", system);
        const res = await fetch(`/api/plants?${params}`, { signal: controller.signal });
        if (!res.ok) throw new Error("Request failed");
        setPlants(await res.json());
      } catch (e) {
        if (e.name !== "AbortError") setError("Could not load plants. Is the server running?");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [q, system]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name or use (try: cough)"
          className="flex-1 rounded-lg border border-stone-300 bg-white px-4 py-2 outline-none focus:border-emerald-600"
        />
        <select
          value={system}
          onChange={(e) => setSystem(e.target.value)}
          className="rounded-lg border border-stone-300 bg-white px-3 py-2"
        >
          <option value="">All AYUSH systems</option>
          {SYSTEMS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {error && <p className="text-red-600">{error}</p>}
      {loading && !error && <p className="text-stone-500">Loading...</p>}
      {!loading && !error && plants.length === 0 && (
        <p className="text-stone-500">No plants match your search.</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {plants.map((p) => (
          <Link
            key={p._id}
            to={`/plants/${p.slug}`}
            className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm transition hover:shadow-md"
          >
            <div className="mb-3 flex h-32 items-center justify-center rounded-lg bg-emerald-50 text-5xl">
              {p.image ? (
                <img src={p.image} alt={p.name} className="h-full w-full rounded-lg object-cover" />
              ) : (
                "🌿"
              )}
            </div>
            <h2 className="font-semibold">{p.name}</h2>
            <p className="text-sm italic text-stone-500">{p.scientificName}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {p.ayushSystems.map((s) => (
                <span key={s} className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800">
                  {s}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}