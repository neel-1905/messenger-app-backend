import { Router } from "express";
import conversationRoutes from "@/modules/conversations/conversations.routes";
import messageRoutes from "@/modules/message/message.routes";
import userRoutes from "@/modules/user/user.routes";

const v1Routes = Router();

v1Routes.get("/", (_, res) => {
  res.send("V1 API is working");
});

v1Routes.get("/health", (_, res) => {
  res.status(200).json({ status: "V1 API is healthy" });
});

v1Routes.use("/conversations", conversationRoutes);
v1Routes.use("/messages", messageRoutes);
v1Routes.use("/users", userRoutes);

export default v1Routes;
