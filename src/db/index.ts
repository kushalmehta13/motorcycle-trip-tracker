import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

type Database = ReturnType<typeof createDatabase>;

let instance: Database | null = null;

function createDatabase() {
  const connectionString =
    process.env.POSTGRES_URL ??
    process.env.DATABASE_URL ??
    process.env.NEON_DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "No database connection string found. Set POSTGRES_URL (or DATABASE_URL) in your environment.",
    );
  }

  return drizzle(neon(connectionString), { schema });
}

export function getDb(): Database {
  if (!instance) {
    instance = createDatabase();
  }
  return instance;
}
