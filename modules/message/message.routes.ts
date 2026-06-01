import { Router } from "express";
import { requireAuth } from "@/middlewares/auth.middleware";
import { getMessages } from "@/modules/message/message.controller";

const router = Router();

router.use(requireAuth);

router.get("/:conversationId", getMessages);

export default router;
