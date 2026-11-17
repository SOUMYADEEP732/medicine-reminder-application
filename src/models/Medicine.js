import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    dosage: {
      type: String,
      trim: true,
    },

    instruction: {
      type: String,
      trim: true,
    },

    time: {
      type: String,
      required: true,
    },

    color: {
      type: String,
      default: "blue",
    },

    // Remaining scheduled doses in stock.
    remainingDoses: {
      type: Number,
      min: 0,
      default: 30,
    },

    // Show a refill alert when stock reaches this number.
    refillThreshold: {
      type: Number,
      min: 0,
      default: 5,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Medicine", medicineSchema);