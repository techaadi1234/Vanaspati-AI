import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PlantViewer from "../components/PlantViewer.jsx";

export default function PlantDetail() {
  const { slug } = useParams();
  const [plant, setPlant] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ok | notfound | error

  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");
    fetch(`/api/plants/${slug}`, { signal: controller.signal })
      .then(async (res) => {
        if (res.status === 404) return setStatus("notfound");
        if (!res.ok) throw new Error();
        setPlant(await res.json());
        setStatus("ok");
      })
      .catch((e) => e.name !== "AbortError" && setStatus("error"));
    return () => controller.abort();
  }, [slug]);

  if (status === "loading") return <p className="text-stone-500">Loading...</p>;
  if (status === "notfound") return <p>Plant not found. <Link className="text-emerald-700 underline" to="/">Back</Link></p>;
  if (status === "error") return <p className="text-red-600">Something went wrong.</p>;

  return (
    <div>
      <Link to="/" className="text-sm text-emerald-700 hover:underline">← All plants</Link>
      <h1 className="mt-2 text-3xl font-bold">{plant.name}</h1>
      <p className="italic text-stone-500">
        {plant.scientificName} {plant.hindiName && `· ${plant.hindiName}`}
      </p>
      <div className="mt-6">
        <PlantViewer src={plant.modelUrl} name={plant.name} credit={plant.modelCredit} />
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Section title="Uses" items={plant.uses} />
        <Section title="Parts used" items={plant.partsUsed} />
        <Section title="AYUSH systems" items={plant.ayushSystems} />
        <div className="rounded-xl border bg-white p-4">
          <h2 className="mb-1 font-semibold">Preparation</h2>
          <p className="text-sm text-stone-700">{plant.preparation}</p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
        <strong>Precautions: </strong>{plant.precautions}
      </div>
    </div>
  );
}

function Section({ title, items }) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <h2 className="mb-2 font-semibold">{title}</h2>
      <div className="flex flex-wrap gap-1">
        {items.map((i) => (
          <span key={i} className="rounded-full bg-stone-100 px-2 py-0.5 text-sm">{i}</span>
        ))}
      </div>
    </div>
  );
}