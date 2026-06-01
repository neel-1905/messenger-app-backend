import type { Server, Socket } from "socket.io";
import db from "@/db";
import { userProfile } from "@/db/schema";
import { eq } from "drizzle-orm";
import { io } from "../index";

export function registerPresenceHandlers(_io: Server, socket: Socket) {
  const userId = socket.data.user.id;

  async function setOnline(online: boolean) {
    await db
      .update(userProfile)
      .set({
        isOnline: online,
        lastSeen: new Date(),
      })
      .where(eq(userProfile.userId, userId));

    // broadcast to everyone — you can scope this to mutual conversations later
    io.emit("presence:update", { userId, isOnline: online });
  }

  // mark online on connect
  setOnline(true);

  socket.on("disconnect", () => {
    setOnline(false);
  });
}
