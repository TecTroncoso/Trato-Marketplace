import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { ENV, databaseMode } from "../config";

export type LibSQLClient = import("@libsql/client", { with: { "resolution-mode": "import" } }).Client;

function ensureFileDirectory(url: string): void {
  if (!url.startsWith("file:")) return;
  const raw = url.slice("file:".length).replace(/^\/\//, "");
  if (!raw) return;
  try {
    mkdirSync(dirname(resolve(process.cwd(), raw)), { recursive: true });
  } catch {
    void 0;
  }
}

export async function createDatabaseClient(): Promise<LibSQLClient> {
  const { createClient } = await import("@libsql/client");
  const mode = databaseMode();
  const authToken = ENV.tursoAuthToken.trim() || undefined;

  ensureFileDirectory(ENV.databaseUrl);

  if (mode === "replica") {
    return createClient({
      url: ENV.databaseUrl,
      authToken,
      syncUrl: ENV.tursoSyncUrl.trim(),
      syncInterval: ENV.tursoSyncInterval,
    });
  }

  return createClient({ url: ENV.databaseUrl, authToken });
}
