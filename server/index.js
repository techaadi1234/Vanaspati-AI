import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import Plant from "./models/Plant.js";

const app = express();
app.use(cors());
app.use(express.json());

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// GET /api/plants?q=cough&system=Ayurveda
app.get("/api/plants", async (req, res) => {
  const { q, system } = req.query;
  const filter = {};
  if (system) filter.ayushSystems = system;
  if (q) {
    const rx = new RegExp(escapeRegex(q), "i");
    filter.$or = [{ name: rx }, { scientificName: rx }, { hindiName: rx }, { uses: rx }];
  }
  res.json(await Plant.find(filter).sort("name"));
});

// GET /api/plants/tulsi
app.get("/api/plants/:slug", async (req, res) => {
  const plant = await Plant.findOne({ slug: req.params.slug });
  if (!plant) return res.status(404).json({ error: "Plant not found" });
  res.json(plant);
});

await mongoose.connect(process.env.MONGO_URI);
const PORT = process.env.PORT || 5001;
app.get("/", (req, res) => res.json({ status: "ok", service: "Virtual Herbal Garden API" }));
app.listen(PORT, () => console.log(`API on :${PORT}`));