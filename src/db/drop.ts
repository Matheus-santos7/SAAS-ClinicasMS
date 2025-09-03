import "dotenv/config";

import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";

const main = async () => {
  try {
    console.log("💧 Começando a limpar o banco de dados...");
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
    });
    await client.connect();
    const db = drizzle(client);

    // A instrução SQL abaixo irá gerar e executar comandos DROP TABLE
    // para todas as tabelas no schema 'public'.
    await db.execute(sql`
      DO $$ DECLARE
          r RECORD;
      BEGIN
          FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
              EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
          END LOOP;
      END $$;
    `);

    console.log("✅ Banco de dados limpo com sucesso!");
    await client.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Erro ao limpar o banco de dados:", error);
    process.exit(1);
  }
};

main();