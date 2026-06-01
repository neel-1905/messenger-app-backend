import type { Request, Response } from "express";
import db from "@/db";
import { user, userProfile } from "@/db/schema";
import { eq, ilike } from "drizzle-orm";

export async function searchUsers(req: Request, res: Response) {
  const { q } = req.query;

  if (!q || typeof q !== "string") {
    return res.status(400).json({ message: "q is required" });
  }

  const users = await db.query.user.findMany({
    where: ilike(user.email, `%${q}%`),
    columns: {
      id: true,
      name: true,
      email: true,
      image: true,
    },
    limit: 20,
  });

  return res.json({ data: users });
}

export async function getProfile(req: Request, res: Response) {
  const { userId } = req.params;

  const profile = await db.query.userProfile.findFirst({
    where: eq(userProfile.userId, userId! as string),
    with: { user: true },
  });

  if (!profile) {
    return res.status(404).json({ message: "Profile not found" });
  }

  return res.json({ data: profile });
}

export async function updateProfile(req: Request, res: Response) {
  const userId = res.locals.user.id;
  const { bio, status } = req.body;

  const updated = await db
    .update(userProfile)
    .set({
      bio,
      status,
      updatedAt: new Date(),
    })
    .where(eq(userProfile.userId, userId))
    .returning();

  return res.json({ data: updated[0] });
}
