import { envConfig } from "@/config/env-config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
const pool = new Pool({
  connectionString: envConfig.DATABASE_URL,
});
const db = drizzle({ client: pool, schema });
export default db;
