import "dotenv/config";
import { createDatabaseClient } from "../src/db/client";

async function main(): Promise<void> {
  const client = await createDatabaseClient();

  const casos: string[] = [
    '( "heladera"* OR "refrigerador"* OR "nevera"* ) AND "frost"*',
    '( "heladera"* OR "refrigerador"* OR "nevera"* ) AND ( "no"* ) AND "frost"*',
    '( "camara"* OR "fotografica"* ) AND ( "canon"* )',
    '"galaxy"* AND "s24"*',
    '( "televisor"* OR "tv"* OR "television"* ) AND "lg"*',
  ];

  for (const match of casos) {
    try {
      const rows = await client.execute({
        sql: `select title from products_fts where products_fts match ? limit 4`,
        args: [match],
      });
      console.log(`OK    ${match.slice(0, 64).padEnd(64)} → ${rows.rows.length} | ${rows.rows.map((row) => String(row.title)).slice(0, 3).join(" | ")}`);
    } catch (error) {
      console.log(`FALLA ${match.slice(0, 64).padEnd(64)} → ${String((error as Error).message).slice(0, 90)}`);
    }
  }

  client.close();
}

main().catch((error) => {
  console.error(String(error?.message ?? error));
  process.exit(1);
});
