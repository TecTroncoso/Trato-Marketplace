import { Injectable, Logger, OnModuleDestroy, OnModuleInit, ServiceUnavailableException } from "@nestjs/common";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import { createDatabaseClient, type LibSQLClient } from "./client";
import { schema } from "./schema";
import { ENV, databaseMode, type DatabaseMode } from "../config";

const SERVERLESS = Boolean(process.env.VERCEL || process.env.RENDER || process.env.NETLIFY);

@Injectable()
export class DbService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger("DbService");
  private instance: LibSQLClient | null = null;
  private database: LibSQLDatabase<typeof schema> | null = null;
  private bootError: string | null = null;
  readonly mode: DatabaseMode = databaseMode();

  async onModuleInit(): Promise<void> {
    try {
      this.instance = await createDatabaseClient();
      this.database = drizzle(this.instance, { schema });
    } catch (error) {
      this.bootError = (error as Error).message;
      this.logger.error(`No se pudo crear el cliente de base de datos: ${this.bootError}`);
      this.logServerlessHints();
      return;
    }
    try {
      const latency = await this.ping();
      this.logger.log(`Base de datos lista (modo: ${this.mode}) · probe ${latency} ms`);
    } catch (error) {
      this.bootError = (error as Error).message;
      this.logger.error(`La base de datos no respondió en el arranque (modo: ${this.mode}): ${this.bootError}`);
      this.logServerlessHints();
    }
  }

  private logServerlessHints(): void {
    if (!SERVERLESS) return;
    if (this.mode !== "remote") {
      this.logger.error(
        `En serverless el modo "${this.mode}" no persiste: definí DATABASE_URL con la URL libsql:// de Turso, dejá TURSO_SYNC_URL vacío y agregá TURSO_AUTH_TOKEN.`,
      );
    }
    if (!ENV.tursoAuthToken) {
      this.logger.error("Falta TURSO_AUTH_TOKEN en las variables de entorno del proyecto.");
    }
  }

  async onModuleDestroy(): Promise<void> {
    this.instance?.close();
  }

  get client(): LibSQLClient {
    if (!this.instance) {
      throw new ServiceUnavailableException(`Base de datos no inicializada: ${this.bootError ?? "error desconocido"}`);
    }
    return this.instance;
  }

  get db(): LibSQLDatabase<typeof schema> {
    if (!this.database) {
      throw new ServiceUnavailableException(`Base de datos no inicializada: ${this.bootError ?? "error desconocido"}`);
    }
    return this.database;
  }

  get bootFailure(): string | null {
    return this.bootError;
  }

  get databaseUrlSource(): "env" | "default" {
    return process.env.DATABASE_URL ? "env" : "default";
  }

  async ping(): Promise<number> {
    const started = Date.now();
    await this.client.execute("select 1");
    return Date.now() - started;
  }

  get isReplica(): boolean {
    return this.mode === "replica";
  }

  async sync(): Promise<void> {
    if (!this.isReplica || !this.instance) return;
    try {
      await this.instance.sync();
    } catch (error) {
      this.logger.warn(`No se pudo sincronizar la réplica embebida: ${(error as Error).message}`);
    }
  }

  get replicaUrl(): string | null {
    return this.isReplica ? ENV.tursoSyncUrl : null;
  }
}
