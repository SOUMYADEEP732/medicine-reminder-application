import mongoose from "mongoose";

const familySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model("Family", familySchema);
