import "dotenv/config";
import { defineConfig } from "drizzle-kit";

// Migrations issue DDL, which the transaction-mode pooler (port 6543) cannot
// run. Point DIRECT_URL at the direct connection (port 5432) for drizzle-kit;
// DATABASE_URL stays the pooled connection the app uses at runtime.
const migrationUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!migrationUrl) {
  throw new Error("Set DIRECT_URL (preferred) or DATABASE_URL to run drizzle-kit.");
}

export default defineConfig({
  schema: "./src/lib/database/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: migrationUrl,
  },
  verbose: true,
  strict: true,
});
