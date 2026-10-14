import { Controller, Get, Query, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { SearchQueryDto } from "./dto/search.dto";
import { SearchService } from "./search.service";
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
}
