
import mongoose from "mongoose";

const doseLogSchema = new mongoose.Schema(
  {
    medicine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Medicine",
      required: true,
    },
    date: { type: String, required: true },
    time: { type: String, required: true },
    status: {
      type: String,
      enum: ["upcoming", "taken", "missed"],
      default: "upcoming",
    },

    // Prevent a deleted daily reminder from being recreated.
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("DoseLog", doseLogSchema);
