import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { DbService } from "../db/db.service";
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
    return {
      status: database === "ok" ? "ok" : "degraded",
      service: "api",
      database,
      databaseError: databaseError ?? this.db.bootFailure,
      databaseMode: this.db.mode,
      databaseUrlSource: this.db.databaseUrlSource,
      replicaUrl: this.db.replicaUrl,
      latencyMs,
      searchEngine: this.search.engine,
      timestamp: new Date().toISOString(),
    };
  }
}
