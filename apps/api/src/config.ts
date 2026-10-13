import "dotenv/config";

export const ENV = {
  port: parseInt(process.env.PORT ?? "4000", 10),
  jwtSecret: process.env.JWT_SECRET ?? "trato-dev-secret-cambiar-en-produccion",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  databaseUrl: process.env.DATABASE_URL ?? "file:./db/trato.db",
  tursoAuthToken: process.env.TURSO_AUTH_TOKEN ?? "",
  tursoSyncUrl: process.env.TURSO_SYNC_URL ?? "",
  tursoSyncInterval: parseInt(process.env.TURSO_SYNC_INTERVAL ?? "60000", 10),
  meilisearchUrl: process.env.MEILISEARCH_URL ?? "",
  meilisearchMasterKey: process.env.MEILISEARCH_MASTER_KEY ?? "",
  webOrigin: process.env.WEB_ORIGIN ?? "http://localhost:3000",
};

export type DatabaseMode = "file" | "remote" | "replica";

export function databaseMode(): DatabaseMode {
  if (ENV.tursoSyncUrl) return "replica";
  if (ENV.databaseUrl.startsWith("file:")) return "file";
  return "remote";
}
