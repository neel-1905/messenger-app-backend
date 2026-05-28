import { envConfig } from "@/config/env-config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
const pool = new Pool({
  connectionString: envConfig.DATABASE_URL,
});
const db = drizzle({ client: pool });
export default db;
