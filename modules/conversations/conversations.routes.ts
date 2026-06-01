import { Router } from "express";
import { requireAuth } from "@/middlewares/auth.middleware";
import {
  getConversations,
  createDM,
  createGroup,
  getConversationById,
} from "@/modules/conversations/conversations.controller";

const router = Router();

router.use(requireAuth);

router.get("/", getConversations);
router.get("/:id", getConversationById);
router.post("/dm", createDM);
router.post("/group", createGroup);

export default router;
