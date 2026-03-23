/**
 * Aplica drizzle/ensure-expense-type-column.sql (idempotente) via DATABASE_URL.
 * Uso: pnpm db:ensure-expense-type-column
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
  "ensure-expense-type-column.sql",
);

async function main() {
  const sql = readFileSync(sqlPath, "utf8");
  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    await client.query(sql);
    console.log(
      "OK: coluna expense_type_id e índice aplicados (clinic_financial_transactions).",
    );
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
