
import express from "express";
import cors from "cors";

import { errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import familyRoutes from "./routes/familyRoutes.js";
import medicineRoutes from "./routes/medicineRoutes.js";
import doseLogRoutes from "./routes/doseLogRoutes.js";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://medicine-reminder-application-1.onrender.com"
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  }
}));

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/family", familyRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/doselogs", doseLogRoutes);

app.use(errorHandler);

export default app;
