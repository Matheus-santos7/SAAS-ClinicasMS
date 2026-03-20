/**
 * Aplica drizzle/ensure-registry.sql (idempotente) via DATABASE_URL.
 * Uso: pnpm db:ensure-registry
 */
import { config } from "dotenv";

import { readFileSync } from "fs";

config({ path: ".env.local" });
config({ path: ".env" });
import path from "path";

import { Client } from "pg";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL não definida (.env ou .env.local).");
  process.exit(1);
}

const sqlPath = path.join(process.cwd(), "drizzle", "ensure-registry.sql");

async function main() {
  const sql = readFileSync(sqlPath, "utf8");
  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    await client.query(sql);
    console.log("OK: registry aplicado (clinic_procedures, expense_types, vendors.notes).");
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
