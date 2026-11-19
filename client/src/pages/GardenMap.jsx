import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Vite does not resolve Leaflet's default icon paths, so set them explicitly.
const icon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function FitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (points.length) map.fitBounds(points, { padding: [40, 40], maxZoom: 18 });
  }, [points, map]);
  return null;
}

export default function GardenMap() {
  const [plants, setPlants] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ctrl = new AbortController();
    fetch("/api/plants", { signal: ctrl.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setPlants)
      .catch((e) => {
        if (e.name !== "AbortError") setError("Could not load the map data.");
      })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, []);

  // GeoJSON is [lng, lat]; Leaflet wants [lat, lng].
  const located = useMemo(
    () =>
      plants
        .filter((p) => p.location?.coordinates?.length === 2)
        .map((p) => ({
          ...p,
          pos: [p.location.coordinates[1], p.location.coordinates[0]],
        })),
    [plants]
  );
  const points = useMemo(() => located.map((p) => p.pos), [located]);

  return (
    <div>
      <h1 className="text-2xl font-semibold">Garden map</h1>
      <p className="mt-1 text-sm text-gray-600">
        Demo layout: marker positions are illustrative, not surveyed locations.
      </p>
      {loading && <p className="mt-4">Loading map…</p>}
      {error && <p className="mt-4 text-red-600">{error}</p>}
      {!loading && !error && (
        <div className="mt-4 overflow-hidden rounded border">
          <MapContainer
            center={[25.243, 86.985]}
            zoom={17}
            style={{ height: "70vh", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FitBounds points={points} />
            {located.map((p) => (
              <Marker key={p.slug} position={p.pos} icon={icon}>
                <Popup>
                  <strong>{p.name}</strong>
                  <br />
                  <em>{p.scientificName}</em>
                  <br />
                  <Link to={`/plants/${p.slug}`}>View details</Link>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}
    </div>
  );
}