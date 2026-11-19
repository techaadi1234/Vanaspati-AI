import mongoose from "mongoose";

const plantSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true }, // "tulsi" → /plants/tulsi
    name: { type: String, required: true, trim: true },
    scientificName: { type: String, required: true },
    hindiName: String,
    ayushSystems: [{ type: String, enum: ["Ayurveda", "Yoga", "Unani", "Siddha", "Homeopathy"] }],
    uses: [String],          // ["cough", "cold", "fever"]
    partsUsed: [String],     // ["leaf", "root"]
    preparation: String,
    precautions: String,
    image: String,
    modelUrl: String,        // .glb, filled in later
    modelCredit: String,  
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true }, // [lng, lat] — lng FIRST
    },
  },
  { timestamps: true }
);

plantSchema.index({ location: "2dsphere" });

export default mongoose.model("Plant", plantSchema);