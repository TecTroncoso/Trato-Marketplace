import "dotenv/config";

export const ENV = {
  port: parseInt(process.env.PORT ?? "4000", 10),
  jwtSecret: process.env.JWT_SECRET ?? "trato-dev-secret-cambiar-en-produccion",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  databaseUrl: (process.env.DATABASE_URL ?? "file:./db/trato.db").trim(),
  tursoAuthToken: (process.env.TURSO_AUTH_TOKEN ?? "").trim(),
  tursoSyncUrl: (process.env.TURSO_SYNC_URL ?? "").trim(),
  tursoSyncInterval: parseInt(process.env.TURSO_SYNC_INTERVAL ?? "60000", 10),
  webOrigin: (process.env.WEB_ORIGIN ?? "http://localhost:3000").trim(),
};

export type DatabaseMode = "file" | "remote" | "replica";

export function databaseMode(): DatabaseMode {
  if (ENV.tursoSyncUrl && ENV.databaseUrl.startsWith("file:")) return "replica";
  if (ENV.databaseUrl.startsWith("file:")) return "file";
  return "remote";
}
