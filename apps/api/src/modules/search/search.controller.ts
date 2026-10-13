import { Controller, Get, HttpCode, HttpStatus, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { SearchQueryDto } from "./dto/search.dto";
import { SearchService, type SearchEngine } from "./search.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import type { SearchResult } from "@trato/shared";

@ApiTags("search")
@Controller("search")
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  findAll(@Query() query: SearchQueryDto): Promise<SearchResult> {
    return this.searchService.search(query);
  }

  @Get("suggestions")
  async suggestions(@Query("q") q = ""): Promise<{ suggestions: string[] }> {
    return { suggestions: await this.searchService.suggest(q) };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post("reindex")
  @HttpCode(HttpStatus.OK)
  reindex(): Promise<{ indexed: number; engine: SearchEngine; message?: string }> {
    return this.searchService.reindexAll();
  }
}
