import { auth } from "@/lib/auth";
import type { Socket } from "socket.io";
import { fromNodeHeaders } from "better-auth/node";

export async function socketAuthMiddleware(
  socket: Socket,
  next: (err?: Error) => void,
) {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(socket.handshake.headers),
    });

    if (!session) {
      return next(new Error("Unauthorized"));
    }

    socket.data.user = session.user;
    socket.data.session = session.session;
    next();
  } catch {
    next(new Error("Unauthorized"));
  }
}
