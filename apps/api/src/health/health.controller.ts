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
    try {
      latencyMs = await this.db.ping();
    } catch {
      database = "error";
    }
    return {
      status: "ok",
      database,
      databaseMode: this.db.mode,
      replicaUrl: this.db.replicaUrl,
      latencyMs,
      searchEngine: this.search.engine,
      timestamp: new Date().toISOString(),
    };
  }
}
