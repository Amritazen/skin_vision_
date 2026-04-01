import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  if (process.env.NODE_ENV === "production") {
    console.warn("DATABASE_URL is not set. Database operations will fail at runtime.");
  }
}

export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL || "" 
});
export const db = drizzle(pool, { schema });
