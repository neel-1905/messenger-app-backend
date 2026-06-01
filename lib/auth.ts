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
    autoSignIn: false,
  },

  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await db
            .insert(schema.userProfile)
            .values({ userId: user.id })
            .onConflictDoNothing();
        },
      },
    },
  },
});
