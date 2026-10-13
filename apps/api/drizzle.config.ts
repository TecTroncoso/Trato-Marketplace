import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const url = process.env.DATABASE_URL ?? "file:./db/trato.db";
const authToken = process.env.TURSO_AUTH_TOKEN?.trim();

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: authToken ? "turso" : "sqlite",
  dbCredentials: authToken ? { url, authToken } : { url },
  strict: true,
  verbose: true,
});
