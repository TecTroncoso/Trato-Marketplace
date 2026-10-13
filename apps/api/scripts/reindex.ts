import "dotenv/config";
import { drizzle } from "drizzle-orm/libsql";
import { createDatabaseClient } from "../src/db/client";
import { schema } from "../src/db/schema";
import { activeProductSelection } from "../src/db/queries/products";
import { createMeiliClient, pingMeilisearch, syncMeilisearch } from "../src/db/meili-sync";

async function main(): Promise<void> {
  const client = await createDatabaseClient();
  const db = drizzle(client, { schema });
  const meili = await createMeiliClient();

  if (!meili) {
    console.log("MEILISEARCH_URL no está configurado. La búsqueda usa el modo local (tolerante a errores).");
    client.close();
    return;
  }
  if (!(await pingMeilisearch(meili))) {
    console.log("Meilisearch no responde. La búsqueda sigue activa en modo local.");
    client.close();
    return;
  }

  const rows = await activeProductSelection(db);
  const total = await syncMeilisearch(meili, rows);
  console.log(`Índice reconstruido: ${total} productos en Meilisearch.`);
  client.close();
}

void main();
