import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import db from "@/db";
import * as schema from "@/db/schema";
import { expo } from "@better-auth/expo";

export const auth = betterAuth({
  plugins: [expo()],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),

  trustedOrigins: ["*"],

  emailAndPassword: {
    enabled: true,
  },
});
