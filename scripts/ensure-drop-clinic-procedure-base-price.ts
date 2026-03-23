/**
 * Aplica drizzle/ensure-drop-clinic-procedure-base-price.sql via DATABASE_URL.
 * Uso: pnpm db:ensure-drop-clinic-procedure-base-price
 */
import { readFileSync } from "fs";
import path from "path";

import { config } from "dotenv";
import { Client } from "pg";

config({ path: ".env.local" });
config({ path: ".env" });

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL não definida (.env ou .env.local).");
  process.exit(1);
}

const sqlPath = path.join(
  process.cwd(),
  "drizzle",
  "ensure-drop-clinic-procedure-base-price.sql",
);

async function main() {
  const sql = readFileSync(sqlPath, "utf8");
  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    await client.query(sql);
    console.log("OK: coluna base_price_in_cents removida de clinic_procedures.");
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
