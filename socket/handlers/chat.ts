import type { Server, Socket } from "socket.io";
import db from "@/db";
import { message, participant } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export function registerChatHandlers(io: Server, socket: Socket) {
  const userId = socket.data.user.id;

  // join all conversation rooms on connect
  socket.on("conversations:join", async (conversationIds: string[]) => {
    conversationIds.forEach((id) => socket.join(`conversation:${id}`));
  });

  // send message
  socket.on(
    "message:send",
    async (
      payload: {
        conversationId: string;
        content: string;
        type?: "text" | "image" | "file";
        replyToId?: string;
      },
      callback,
    ) => {
      try {
        // verify sender is a participant
        const membership = await db.query.participant.findFirst({
          where: and(
            eq(participant.conversationId, payload.conversationId),
            eq(participant.userId, userId),
          ),
        });

        if (!membership) {
          return callback?.({ error: "Not a participant" });
        }

        const [newMessage] = await db
          .insert(message)
          .values({
            conversationId: payload.conversationId,
            senderId: userId,
            content: payload.content,
            type: payload.type ?? "text",
            replyToId: payload.replyToId,
          })
          .returning();

        // broadcast to everyone in the conversation including sender
        io.to(`conversation:${payload.conversationId}`).emit(
          "message:new",
          newMessage,
        );

        callback?.({ data: newMessage });
      } catch (err) {
        callback?.({ error: "Failed to send message" });
      }
    },
  );

  // typing indicator
  socket.on("typing:start", (conversationId: string) => {
    socket.to(`conversation:${conversationId}`).emit("typing:start", {
      userId,
      conversationId,
    });
  });

  socket.on("typing:stop", (conversationId: string) => {
    socket.to(`conversation:${conversationId}`).emit("typing:stop", {
      userId,
      conversationId,
    });
  });

  // mark messages as read
  socket.on("messages:read", async (conversationId: string) => {
    await db
      .update(participant)
      .set({ lastReadAt: new Date() })
      .where(
        and(
          eq(participant.conversationId, conversationId),
          eq(participant.userId, userId),
        ),
      );

    socket.to(`conversation:${conversationId}`).emit("messages:read", {
      userId,
      conversationId,
    });
  });
}
