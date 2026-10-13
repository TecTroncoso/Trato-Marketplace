import "dotenv/config";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import bcrypt from "bcryptjs";
import { createDatabaseClient, type LibSQLClient } from "../client";
import {
  addresses,
  categories,
  favorites,
  orderItems,
  orders,
  products,
  questions,
  reviews,
  schema,
  users,
} from "../schema";
import {
  ANSWER_POOL,
  BONUS_LINES,
  BUYERS,
  CATALOG,
  DEMO_PASSWORD,
  QUESTION_POOL,
  REVIEW_COMMENTS,
  REVIEW_TITLES,
  SELLERS,
} from "./seed-data";
import type { Blueprint } from "./seed-data";
import { writeCategoryImage, writeFavicon, writeHeroImages, writeProductImages, writeSellerAvatar } from "./images";
import { createMeiliClient, pingMeilisearch, syncMeilisearch } from "../meili-sync";
import { activeProductSelection } from "../queries/products";
import { slugify } from "../../common/slugify";

let client: LibSQLClient;
let db: ReturnType<typeof drizzle<typeof schema>>;

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const random = mulberry32(20261011);
const randInt = (min: number, max: number): number => Math.floor(random() * (max - min + 1)) + min;
const pick = <T>(items: T[]): T => items[Math.floor(random() * items.length)];
const chance = (probability: number): boolean => random() < probability;
const round100 = (value: number): number => Math.round(value / 100) * 100;
const newId = (): string => crypto.randomUUID();

const CATEGORY_SELLERS: Record<string, string> = {
  celulares: "CeluMundo",
  computacion: "CompuGamer",
  electronica: "SonidoTotal",
  consolas: "TecnoShop Argentina",
  hogar: "Casa Única",
  electrodomesticos: "HouseElectro",
  deportes: "Deportes RD",
  moda: "ModaTotal",
  belleza: "BellezaShop",
  juguetes: "FraveStore",
  herramientas: "Herramientas PRO",
  oficina: "Córdoba Store",
  musica: "MegaTecno",
  mascotas: "PetKing",
};

const LONG_TEXTS = [
  "Diseñado para el uso diario, combina materiales resistentes con un acabado cuidado al detalle.",
  "Una opción confiable que se adapta a tus necesidades con un excelente desempeño.",
  "Fabricado con estándares de calidad exigentes y respaldado por nuestro servicio posventa.",
  "Pensado para quienes buscan durabilidad y buen rendimiento sin gastar de más.",
  "Probado por miles de compradores que destacan su calidad y su relación precio-calidad.",
];

interface Combo {
  title: string;
  brand: string | null;
  specs: Record<string, string>;
  price: number;
}

function parseVariantAttributes(variant: string): Record<string, string> {
  const attributes: Record<string, string> = {};
  if (!variant) return attributes;
  const ram = variant.match(/(\d+)\s?ram/i);
  const storage = variant.match(/(\d+)\s?(gb|tb)/i);
  if (ram) attributes["Memoria RAM"] = `${ram[1]} GB`;
  if (storage && !ram) attributes["Almacenamiento"] = `${storage[1]} ${storage[2].toUpperCase()}`;
  if (/^\d+(\.\d+)?$/.test(variant.trim())) attributes["Talle"] = variant.trim();
  const screen = variant.match(/(\d+(?:\.\d+)?)"/);
  if (screen) attributes["Pantalla"] = `${screen[1]}"`;
  return attributes;
}

function expandBlueprint(blueprint: Blueprint): Combo[] {
  if (blueprint.kind === "plain") {
    const middle = (blueprint.price[0] + blueprint.price[1]) / 2;
    const price = round100(middle * (0.92 + random() * 0.16));
    return [{ title: blueprint.title, brand: blueprint.brand ?? null, specs: blueprint.specs ?? {}, price }];
  }
  const colors: (string | null)[] = blueprint.colors?.length ? blueprint.colors : [null];
  const variants = blueprint.variants.length ? blueprint.variants : [""];
  const pairs: { variant: string; color: string | null }[] = [];
  for (const color of colors) {
    for (const variant of variants) {
      pairs.push({ variant, color });
    }
  }
  const limited = pairs.slice(0, 6);
  return limited.map((pair, index) => {
    const ratio = limited.length > 1 ? index / (limited.length - 1) : 0.5;
    const base = blueprint.price[0] + (blueprint.price[1] - blueprint.price[0]) * ratio;
    const price = round100(base * (0.95 + random() * 0.1));
    const parts = [blueprint.brand, blueprint.model];
    if (pair.variant) parts.push(pair.variant);
    if (pair.color) parts.push(pair.color);
    const specs: Record<string, string> = { ...(blueprint.specs ?? {}) };
    if (pair.color) specs["Color"] = pair.color;
    Object.assign(specs, parseVariantAttributes(pair.variant));
    return { title: parts.join(" "), brand: blueprint.brand, specs, price };
  });
}

async function insertChunked<T>(table: Parameters<typeof db.insert>[0], rows: T[], chunkSize = 50): Promise<void> {
  for (let index = 0; index < rows.length; index += chunkSize) {
    await db.insert(table).values(rows.slice(index, index + chunkSize) as never);
  }
}

async function main(): Promise<void> {
  client = await createDatabaseClient();
  db = drizzle(client, { schema });

  console.log("Limpiando la base de datos...");
  await db.delete(favorites);
  await db.delete(orderItems);
  await db.delete(orders);
  await db.delete(reviews);
  await db.delete(questions);
  await db.delete(products);
  await db.delete(categories);
  await db.delete(addresses);
  await db.delete(users);

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  console.log("Insertando usuarios...");
  const sellerRows: { id: string; name: string; sellerName: string }[] = [];
  const sellerValues = SELLERS.map((seller, index) => {
    const id = newId();
    sellerRows.push({ id, name: seller.name, sellerName: seller.sellerName });
    return {
      id,
      email: seller.email,
      password: passwordHash,
      name: seller.name,
      phone: seller.phone,
      role: "seller",
      sellerName: seller.sellerName,
      sellerStatus: seller.status,
      sellerSales: seller.sales,
      sellerRating: seller.rating,
      location: seller.location,
      memberSince: seller.memberSince,
      avatar: writeSellerAvatar(slugify(seller.sellerName), seller.sellerName, (index * 47) % 360),
    };
  });
  await insertChunked(users, sellerValues);

  const buyerRows: { id: string; name: string }[] = [];
  const buyerValues = BUYERS.map((buyer) => {
    const id = newId();
    buyerRows.push({ id, name: buyer.name });
    return {
      id,
      email: buyer.email,
      password: passwordHash,
      name: buyer.name,
      phone: buyer.phone,
      role: "buyer",
      location: buyer.location,
      memberSince: 2022,
    };
  });
  await insertChunked(users, buyerValues);
  const demoBuyer = buyerRows[0];

  const sellersByName = new Map(sellerRows.map((seller) => [seller.sellerName, seller]));
  const sellerNames = Array.from(sellersByName.keys());

  console.log("Insertando categorías e imágenes...");
  writeHeroImages();
  writeFavicon();
  const categoryValues: (typeof categories.$inferInsert)[] = [];
  const leafByName = new Map<string, { id: string }>();
  CATALOG.forEach((root, rootIndex) => {
    const rootId = newId();
    categoryValues.push({
      id: rootId,
      name: root.name,
      slug: root.slug,
      icon: root.icon,
      image: writeCategoryImage(root.slug, root.name, root.icon, root.hue),
      level: 1,
      order: rootIndex,
    });
    root.leaves.forEach((leaf, leafIndex) => {
      const leafId = newId();
      leafByName.set(leaf.slug, { id: leafId });
      categoryValues.push({
        id: leafId,
        name: leaf.name,
        slug: leaf.slug,
        icon: leaf.icon,
        image: writeCategoryImage(leaf.slug, leaf.name, leaf.icon, root.hue + 10),
        level: 2,
        order: leafIndex,
        parentId: rootId,
      });
    });
  });
  await insertChunked(categories, categoryValues);

  console.log("Generando productos e imágenes SVG...");
  const usedSlugs = new Set<string>();
  const productValues: (typeof products.$inferInsert)[] = [];
  CATALOG.forEach((root) => {
    const preferredSeller = CATEGORY_SELLERS[root.slug];
    root.leaves.forEach((leaf) => {
      const category = leafByName.get(leaf.slug);
      if (!category) return;
      for (const blueprint of leaf.blueprints) {
        for (const combo of expandBlueprint(blueprint)) {
          let slug = slugify(combo.title);
          if (usedSlugs.has(slug)) {
            slug = `${slug}-${productValues.length}`;
          }
          usedSlugs.add(slug);

          const isUsed = blueprint.kind === "branded" && chance(0.12);
          const price = isUsed ? round100(combo.price * 0.78) : combo.price;
          const condition = isUsed ? "usado" : "nuevo";
          const freeShipping = chance(0.85);
          const hasDiscount = !isUsed && chance(0.42);
          const originalPrice = hasDiscount ? round100(price * (1.08 + random() * 0.3)) : null;
          const soldQuantity = Math.floor(Math.pow(random(), 2.1) * 4200);
          const stock = chance(0.08) ? 0 : randInt(1, 35);
          const sellerName = preferredSeller ?? pick(sellerNames);
          const seller = sellersByName.get(sellerName) ?? sellersByName.get(sellerNames[0]);
          const images = writeProductImages(slug, combo.title, leaf.icon, root.hue + (productValues.length % 25));
          const attributeLines = Object.entries({ Marca: combo.brand ?? "Genérico", ...combo.specs })
            .map(([key, value]) => `- ${key}: ${value}`)
            .join("\n");
          const description = [
            `${combo.title}.`,
            "",
            pick(LONG_TEXTS),
            pick(BONUS_LINES),
            "",
            "Especificaciones:",
            attributeLines,
            "",
            condition === "nuevo" ? "Condición: Nuevo, sin uso." : "Condición: Usado, en excelente estado.",
            condition === "nuevo"
              ? "Garantía: 12 meses de garantía oficial del vendedor."
              : "Garantía: 3 meses de garantía del vendedor.",
            freeShipping ? "Envío: Envío gratis a todo el país." : "Envío: Se calcula al finalizar la compra.",
          ].join("\n");

          productValues.push({
            id: newId(),
            title: combo.title,
            slug,
            description,
            price,
            originalPrice,
            condition,
            stock,
            soldQuantity,
            views: randInt(40, 9000),
            brand: combo.brand,
            images,
            attributes: combo.specs,
            freeShipping,
            featured: chance(0.12),
            status: "active",
            categoryId: category.id,
            sellerId: seller.id,
            createdAt: new Date(Date.now() - randInt(0, 120) * 86_400_000),
          });
        }
      }
    });
  });
  await insertChunked(products, productValues, 40);
  console.log(`  ${productValues.length} productos creados`);

  console.log("Creando opiniones y preguntas...");
  const reviewValues: (typeof reviews.$inferInsert)[] = [];
  const questionValues: (typeof questions.$inferInsert)[] = [];
  for (const product of productValues) {
    if (chance(0.75)) {
      const authors = [...buyerRows].sort(() => random() - 0.5).slice(0, randInt(1, 6));
      for (const author of authors) {
        const roll = random();
        const rating = roll < 0.55 ? 5 : roll < 0.8 ? 4 : roll < 0.92 ? 3 : roll < 0.97 ? 2 : 1;
        reviewValues.push({
          productId: product.id as string,
          userId: author.id,
          rating,
          title: pick(REVIEW_TITLES[rating]),
          comment: pick(REVIEW_COMMENTS[rating]),
          createdAt: new Date(Date.now() - randInt(1, 90) * 86_400_000),
        });
      }
    }
    if (chance(0.5)) {
      for (let index = 0; index < randInt(1, 3); index += 1) {
        const answered = chance(0.7);
        const questionIndex = Math.floor(random() * QUESTION_POOL.length);
        const createdAt = new Date(Date.now() - randInt(1, 60) * 86_400_000);
        questionValues.push({
          productId: product.id as string,
          userId: pick(buyerRows).id,
          question: QUESTION_POOL[questionIndex],
          answer: answered ? ANSWER_POOL[questionIndex] : null,
          answeredAt: answered ? new Date(createdAt.getTime() + 3_600_000) : null,
          createdAt,
        });
      }
    }
  }
  await insertChunked(reviews, reviewValues, 60);
  await insertChunked(questions, questionValues, 60);

  console.log("Recalculando reputación y favoritos (SQL agregado)...");
  await db.run(sql`
    UPDATE products SET
      rating = COALESCE((SELECT ROUND(AVG(rating), 1) FROM reviews WHERE reviews.product_id = products.id), 0),
      reviews_count = (SELECT COUNT(*) FROM reviews WHERE reviews.product_id = products.id)
  `);

  console.log("Creando historial de compras...");
  const statuses = ["confirmado", "preparando", "enviado", "entregado", "entregado"];
  const payments = ["tarjeta_credito", "tarjeta_debito", "efectivo", "transferencia"];
  const sellerNameById = new Map(sellerRows.map((seller) => [seller.id, seller.sellerName]));
  const orderValues: (typeof orders.$inferInsert)[] = [];
  const itemValues: (typeof orderItems.$inferInsert)[] = [];
  for (let index = 0; index < 18; index += 1) {
    const buyer = pick(buyerRows);
    const chosen = [...productValues].sort(() => random() - 0.5).slice(0, randInt(1, 3));
    const subtotal = chosen.reduce((sum, product) => sum + (product.price as number), 0);
    const orderId = newId();
    const createdAt = new Date(Date.now() - randInt(1, 90) * 86_400_000);
    orderValues.push({
      id: orderId,
      code: `TR-${(100000 + index).toString(36).toUpperCase()}${randInt(1000, 9999)}`,
      userId: buyer.id,
      status: pick(statuses),
      subtotal,
      shippingCost: 0,
      total: subtotal,
      paymentMethod: pick(payments),
      shippingMethod: chance(0.3) ? "express" : "estandar",
      addressSnapshot: {
        recipient: buyer.name,
        street: `${pick(["Av. Corrientes", "Av. Santa Fe", "Av. Cabildo", "Calle Mitre", "Av. Colón"])} ${randInt(100, 4800)}`,
        city: "Capital Federal",
        province: "Buenos Aires",
        zip: `${randInt(1000, 1999)}`,
        phone: null,
      },
      createdAt,
    });
    for (const product of chosen) {
      itemValues.push({
        orderId,
        productId: product.id as string,
        title: product.title as string,
        price: product.price as number,
        quantity: randInt(1, 2),
        image: (product.images as string[])[0] ?? null,
        sellerId: product.sellerId as string,
        sellerName: sellerNameById.get(product.sellerId as string) ?? "Vendedor Trato",
        slug: product.slug as string,
        createdAt,
      });
    }
  }
  await insertChunked(orders, orderValues);
  await insertChunked(orderItems, itemValues);

  console.log("Agregando favoritos...");
  const favoriteKeys = new Set<string>();
  const favoriteValues: (typeof favorites.$inferInsert)[] = [];
  const addFavorite = (userId: string, productId: string) => {
    const key = `${userId}:${productId}`;
    if (favoriteKeys.has(key)) return;
    favoriteKeys.add(key);
    favoriteValues.push({ userId, productId });
  };
  for (const product of [...productValues].sort(() => random() - 0.5).slice(0, 8)) {
    addFavorite(demoBuyer.id, product.id as string);
  }
  for (const buyer of buyerRows.slice(1)) {
    for (const product of [...productValues].sort(() => random() - 0.5).slice(0, 3)) {
      addFavorite(buyer.id, product.id as string);
    }
  }
  await insertChunked(favorites, favoriteValues);
  await db.run(sql`
    UPDATE products SET
      favorite_count = (SELECT COUNT(*) FROM favorites WHERE favorites.product_id = products.id)
  `);

  console.log("Sincronizando el buscador...");
  const meili = await createMeiliClient();
  if (meili && (await pingMeilisearch(meili))) {
    const rows = await activeProductSelection(db);
    const total = await syncMeilisearch(meili, rows);
    console.log(`  ${total} productos indexados en Meilisearch`);
  } else {
    console.log("  Meilisearch no disponible: la búsqueda usa el modo local (tolerante a errores tipográficos).");
  }

  const [counts] = await db.all<{ usuarios: number; categorias: number; productos: number; opiniones: number; preguntas: number; ordenes: number; favoritos: number }>(sql`
    SELECT
      (SELECT COUNT(*) FROM users) AS usuarios,
      (SELECT COUNT(*) FROM categories) AS categorias,
      (SELECT COUNT(*) FROM products) AS productos,
      (SELECT COUNT(*) FROM reviews) AS opiniones,
      (SELECT COUNT(*) FROM questions) AS preguntas,
      (SELECT COUNT(*) FROM orders) AS ordenes,
      (SELECT COUNT(*) FROM favorites) AS favoritos
  `);

  console.log("\nBase de datos lista:");
  console.log(counts);
  console.log(`\nUsuario demo: demo@trato.com  /  ${DEMO_PASSWORD}`);
  console.log(`Vendedores tambien usan la contrasena: ${DEMO_PASSWORD}`);

  client.close();
}

main().catch((error) => {
  console.error(error);
  client?.close();
  process.exit(1);
});
