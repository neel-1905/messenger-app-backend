import { Router } from "express";
import { requireAuth } from "@/middlewares/auth.middleware";
import {
  searchUsers,
  getProfile,
  updateProfile,
} from "@/modules/user/user.controller";

const router = Router();

router.use(requireAuth);

router.get("/search", searchUsers);
router.get("/:userId/profile", getProfile);
router.patch("/profile", updateProfile);

export default router;
