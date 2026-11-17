
import { Router } from "express";

import { requireAuth } from "../middleware/auth.js";

import {
  listDoseLogs,
  markDoseStatus,
  deleteDoseLog,
} from "../controllers/doseLogController.js";

const router = Router();

router.use(requireAuth);

router.get("/", listDoseLogs);
router.get("/user/:userId", listDoseLogs);

router.patch("/:id", markDoseStatus);

// Delete individual dose.
router.delete("/:id", deleteDoseLog);

export default router;
