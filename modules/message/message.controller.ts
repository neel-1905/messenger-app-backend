import type { Request, Response } from "express";
import db from "@/db";
import { message, participant } from "@/db/schema";
import { and, eq, lt, desc } from "drizzle-orm";

export async function getMessages(req: Request, res: Response) {
  const userId = res.locals.user.id;
  const { conversationId } = req.params;
  const { cursor, limit = "30" } = req.query;

  // verify membership
  const membership = await db.query.participant.findFirst({
    where: and(
      eq(participant.conversationId, conversationId! as string),
      eq(participant.userId, userId),
    ),
  });

  if (!membership) {
    return res.status(403).json({ message: "Not a participant" });
  }

  const messages = await db.query.message.findMany({
    where: and(
      eq(message.conversationId, conversationId! as string),
      cursor ? lt(message.createdAt, new Date(cursor as string)) : undefined,
    ),
    orderBy: desc(message.createdAt),
    limit: parseInt(limit as string),
    with: {
      sender: true,
      attachments: true,
      reactions: true,
      replyTo: true,
    },
  });

  const nextCursor =
    messages.length === parseInt(limit as string)
      ? messages[messages.length - 1]?.createdAt.toISOString()
      : null;

  return res.json({ data: messages.reverse(), nextCursor });
}
