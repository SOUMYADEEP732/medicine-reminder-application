import express from "express";
import cors from "cors";

import { errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import familyRoutes from "./routes/familyRoutes.js";
import medicineRoutes from "./routes/medicineRoutes.js";
import doseLogRoutes from "./routes/doseLogRoutes.js";

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/family", familyRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/doselogs", doseLogRoutes);

app.use(errorHandler);

export default app;