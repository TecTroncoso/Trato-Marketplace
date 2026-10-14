import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { DbService } from "../db/db.service";
import { categories } from "../db/schema";
import { SearchService } from "../modules/search/search.service";

@ApiTags("health")
@Controller("health")
export class HealthController {
  constructor(
    private readonly db: DbService,
    private readonly search: SearchService,
  ) {}

  @Get()
  async check() {
    let database = "ok";
    let latencyMs: number | null = null;
    let databaseError: string | null = null;
    try {
      latencyMs = await this.db.ping();
    } catch (error) {
      database = "error";
      databaseError = (error as Error).message;
    }

    let schema = "ok";
    let schemaError: string | null = null;
    if (database === "ok") {
      try {
        await this.db.db.select({ id: categories.id }).from(categories).limit(1);
      } catch (error) {
        schema = "missing";
        const cause = (error as Error).cause as Error | undefined;
        schemaError = cause?.message ?? (error as Error).message;
      }
    }

    const searchFts = await this.search.isFtsEnabled().catch(() => false);

    return {
      status: database === "ok" && schema === "ok" ? "ok" : "degraded",
      service: "api",
      database,
      databaseError: databaseError ?? this.db.bootFailure,
      databaseMode: this.db.mode,
      databaseUrlSource: this.db.databaseUrlSource,
      replicaUrl: this.db.replicaUrl,
      latencyMs,
      schema,
      schemaError,
      schemaHint:
        schema === "missing"
          ? "El esquema no está aplicado en esta base: ejecutá npm run db:push y npm run seed con la MISMA DATABASE_URL que usa este deploy."
          : null,
      searchFts,
      searchFtsHint: searchFts ? null : "Buscador en modo in-process sin FTS. Activalo con: npm run db:fts",
      timestamp: new Date().toISOString(),
    };
  }
}
