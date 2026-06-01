import { Server } from "socket.io";
import type { Server as HTTPServer } from "http";
import { socketAuthMiddleware } from "@/middlewares/socket.middleware";
import { registerChatHandlers } from "./handlers/chat";
import { registerPresenceHandlers } from "./handlers/presence";

export let io: Server;

export function initSocket(server: HTTPServer) {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use(socketAuthMiddleware);

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.data.user.id}`);

    registerChatHandlers(io, socket);
    registerPresenceHandlers(io, socket);

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.data.user.id}`);
    });
  });
}
