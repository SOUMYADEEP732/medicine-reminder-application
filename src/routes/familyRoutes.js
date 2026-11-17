import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { getFamilyMembers, addFamilyMember } from "../controllers/familyController.js";

const router = Router();

router.use(requireAuth);
router.get("/members", getFamilyMembers);
router.post("/add-member", addFamilyMember);

export default router;
