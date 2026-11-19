import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home.jsx";
import PlantDetail from "./pages/PlantDetail.jsx";
import Scan from "./pages/Scan.jsx";

export default function App() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-800">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link to="/" className="text-xl font-bold text-emerald-700">
            🌿 Virtual Herbal Garden
          </Link>
          <nav className="flex gap-4 text-sm font-medium">
            <Link to="/" className="hover:text-emerald-700">Plants</Link>
            <Link to="/scan" className="hover:text-emerald-700">Scan</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/plants/:slug" element={<PlantDetail />} />
          <Route path="/scan" element={<Scan />} />
        </Routes>
      </main>
    </div>
  );
}