import dotenv from "dotenv";

dotenv.config();

type ENV_Config = {
  PORT: number;
  DATABASE_URL: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
};

export const envConfig: ENV_Config = {
  PORT: Number(process.env.PORT!) || 4000,
  DATABASE_URL: process.env.DATABASE_URL!,
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET!,
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL!,
};
