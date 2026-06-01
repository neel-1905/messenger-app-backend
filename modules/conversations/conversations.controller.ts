import type { Request, Response } from "express";
import db from "@/db";
import { conversation, participant } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function getConversations(req: Request, res: Response) {
  const userId = res.locals.user.id;

  const conversations = await db.query.participant.findMany({
    where: eq(participant.userId, userId),
    with: {
      conversation: {
        with: {
          participants: {
            with: { user: true },
          },
        },
      },
    },
  });

  return res.json({ data: conversations });
}

export async function getConversationById(req: Request, res: Response) {
  const userId = res.locals.user.id;
  const { id } = req.params;

  const membership = await db.query.participant.findFirst({
    where: and(
      eq(participant.conversationId, id! as string),
      eq(participant.userId, userId),
    ),
    with: {
      conversation: {
        with: {
          participants: {
            with: { user: true },
          },
        },
      },
    },
  });

  if (!membership) {
    return res.status(404).json({ message: "Conversation not found" });
  }

  return res.json({ data: membership.conversation });
}

export async function createDM(req: Request, res: Response) {
  const userId = res.locals.user.id;
  const { targetUserId } = req.body;

  if (!targetUserId) {
    return res.status(400).json({ message: "targetUserId is required" });
  }

  if (targetUserId === userId) {
    return res.status(400).json({ message: "Cannot DM yourself" });
  }

  // check if DM already exists between these two users
  const existing = await db.query.participant.findFirst({
    where: and(eq(participant.userId, userId)),
    with: {
      conversation: {
        with: {
          participants: true,
        },
      },
    },
  });

  const existingDM = existing?.conversation.participants.find(
    (p) => p.userId === targetUserId,
  );

  if (existingDM) {
    return res.json({ data: existing?.conversation });
  }

  // create new DM
  const [newConversation] = await db
    .insert(conversation)
    .values({ type: "dm", createdBy: userId })
    .returning();

  if (!newConversation) {
    return res.status(500).json({ message: "Failed to create conversation" });
  }

  await db.insert(participant).values([
    { conversationId: newConversation.id, userId, role: "owner" },
    {
      conversationId: newConversation.id,
      userId: targetUserId,
      role: "member",
    },
  ]);

  return res.status(201).json({ data: newConversation });
}

export async function createGroup(req: Request, res: Response) {
  const userId = res.locals.user.id;
  const { name, memberIds }: { name: string; memberIds: string[] } = req.body;

  if (!name) {
    return res.status(400).json({ message: "name is required" });
  }

  if (!memberIds || memberIds.length === 0) {
    return res.status(400).json({ message: "memberIds is required" });
  }

  const [newConversation] = await db
    .insert(conversation)
    .values({ type: "group", name, createdBy: userId })
    .returning();

  if (!newConversation) {
    return res.status(500).json({ message: "Failed to create conversation" });
  }

  const allMembers = [
    { conversationId: newConversation.id, userId, role: "owner" as const },
    ...memberIds.map((id) => ({
      conversationId: newConversation.id,
      userId: id,
      role: "member" as const,
    })),
  ];

  await db.insert(participant).values(allMembers);

  return res.status(201).json({ data: newConversation });
}
