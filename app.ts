import express from "express";
import cors from "cors";
import v1Routes from "@/routes/v1";
import { fromNodeHeaders, toNodeHandler } from "better-auth/node";
import { auth } from "@/lib/auth";

const app = express();
app.use(
  cors({
    origin: "*", // Replace with your frontend's origin
    methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed HTTP methods
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  }),
);

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());

app.get("/api/me", async (req, res) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  return res.json({ session, message: "Current session" });
});

app.use("/api/v1", v1Routes);

export default app;
