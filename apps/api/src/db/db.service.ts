import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import { createDatabaseClient, type LibSQLClient } from "./client";
import { schema } from "./schema";
import { ENV, databaseMode, type DatabaseMode } from "../config";

@Injectable()
export class DbService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger("DbService");
  private instance: LibSQLClient | null = null;
  private database: LibSQLDatabase<typeof schema> | null = null;
  readonly mode: DatabaseMode = databaseMode();

  async onModuleInit(): Promise<void> {
    this.instance = await createDatabaseClient();
    this.database = drizzle(this.instance, { schema });
    const latency = await this.ping();
    this.logger.log(`Base de datos lista (modo: ${this.mode}) · probe ${latency} ms`);
  }

  async onModuleDestroy(): Promise<void> {
    this.instance?.close();
  }

  get client(): LibSQLClient {
    if (!this.instance) {
      throw new Error("La base de datos no está inicializada");
    }
    return this.instance;
  }

  get db(): LibSQLDatabase<typeof schema> {
    if (!this.database) {
      throw new Error("La base de datos no está inicializada");
    }
    return this.database;
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
