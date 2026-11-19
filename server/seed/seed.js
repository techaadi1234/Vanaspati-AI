import "dotenv/config";
import mongoose from "mongoose";
import { readFileSync } from "fs";
import Plant from "../models/Plant.js";

const plants = JSON.parse(readFileSync(new URL("./plants.json", import.meta.url)));

await mongoose.connect(process.env.MONGO_URI);
await Plant.deleteMany({});
await Plant.insertMany(plants);
console.log(`Seeded ${plants.length} plants`);
await mongoose.disconnect();