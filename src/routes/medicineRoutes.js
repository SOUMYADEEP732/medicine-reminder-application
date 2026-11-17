import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  listMedicines,
  createMedicine,
  updateMedicine,
  deleteMedicine,
} from "../controllers/medicineController.js";

const router = Router();

router.use(requireAuth);
router.get("/", listMedicines);
router.get("/user/:userId", listMedicines);
router.post("/", createMedicine);
router.patch("/:id", updateMedicine);
router.delete("/:id", deleteMedicine);

export default router;
