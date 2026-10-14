import "dotenv/config";
import { createDatabaseClient } from "../src/db/client";

const TOKENIZERS = ["unicode61 remove_diacritics 2", "unicode61"];

async function detectTokenizer(client: Awaited<ReturnType<typeof createDatabaseClient>>): Promise<string> {
  for (const tokenizer of TOKENIZERS) {
    try {
      await client.execute("drop table if exists _fts_probe");
      await client.execute(`create virtual table _fts_probe using fts5(x, tokenize='${tokenizer}')`);
      await client.execute(`insert into _fts_probe(x) values ('Cámara fotográfica 12mp')`);
      const test = await client.execute({ sql: "select x from _fts_probe where _fts_probe match ?", args: ["camara"] });
      await client.execute("drop table _fts_probe");
      if (!test.rows.length) {
        throw new Error("sin diacritics");
      }
      return tokenizer;
    } catch {
      void 0;
    }
  }
  throw new Error("FTS5 no está disponible en esta base");
}

const ddlStatements = (tokenizer: string): string[] => [
  `DROP TRIGGER IF EXISTS trg_products_fts_insert`,
  `DROP TRIGGER IF EXISTS trg_products_fts_update`,
  `DROP TRIGGER IF EXISTS trg_products_fts_delete`,
  `DROP TABLE IF EXISTS products_fts`,

  `CREATE VIRTUAL TABLE products_fts USING fts5(
     product_id UNINDEXED,
     title,
     brand,
     description,
     category_name,
     tokenize='${tokenizer}'
   )`,

  `CREATE TRIGGER trg_products_fts_insert AFTER INSERT ON products BEGIN
     INSERT INTO products_fts (product_id, title, brand, description, category_name)
     SELECT new.id, new.title, COALESCE(new.brand, ''), new.description,
            (SELECT name FROM categories WHERE categories.id = new.category_id)
     ;
   END`,

  `CREATE TRIGGER trg_products_fts_update AFTER UPDATE OF title, brand, description, category_id ON products BEGIN
     UPDATE products_fts
     SET title = new.title,
         brand = COALESCE(new.brand, ''),
         description = new.description,
         category_name = (SELECT name FROM categories WHERE categories.id = new.category_id)
     WHERE product_id = old.id;
   END`,

  `CREATE TRIGGER trg_products_fts_delete AFTER DELETE ON products BEGIN
     DELETE FROM products_fts WHERE product_id = old.id;
   END`,
];

async function main(): Promise<void> {
  const client = await createDatabaseClient();

  const productsTable = await client.execute("select name from sqlite_master where type = 'table' and name = 'products'");
  if (!productsTable.rows.length) {
    throw new Error("Falta la tabla products: corré primero npm run db:push && npm run seed");
  }

  const tokenizer = await detectTokenizer(client);

  console.log(`Recreando products_fts con tokenizer '${tokenizer}'...`);
  for (const stmt of ddlStatements(tokenizer)) {
    await client.execute(stmt);
  }

  console.log("Reconstruyendo el índice full-text desde products...");
  await client.execute(
    `insert into products_fts (product_id, title, brand, description, category_name)
     select p.id, p.title, coalesce(p.brand, ''), p.description, c.name
     from products p inner join categories c on c.id = p.category_id`,
  );
  const stats = await client.execute("select count(*) as total from products_fts");
  console.log(`Listo: ${stats.rows[0].total} documentos en products_fts.`);
  client.close();
}

main().catch((error) => {
  console.error(String(error?.message ?? error));
  process.exit(1);
});
