import "dotenv/config";
import { createDatabaseClient } from "../src/db/client";
import { databaseMode } from "../src/config";

async function main(): Promise<void> {
  const client = await createDatabaseClient();
  const mode = databaseMode();
  const tables = await client.execute("select name from sqlite_master where type = 'table' order by name");
  const names = tables.rows.map((row) => String(row.name));
  const counts: Record<string, number> = {};
  for (const table of ["categories", "products", "users", "orders", "reviews", "questions", "favorites"]) {
    if (!names.includes(table)) continue;
    const result = await client.execute(`select count(*) as total from ${table}`);
    counts[table] = Number(result.rows[0]?.total ?? 0);
  }
  console.log(JSON.stringify({ mode, url: process.env.DATABASE_URL, tables: names, counts }, null, 2));
  client.close();
}

main().catch((error) => {
  console.error(String(error?.message ?? error));
  process.exit(1);
});
