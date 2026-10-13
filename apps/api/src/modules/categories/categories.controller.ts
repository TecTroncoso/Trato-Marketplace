import { Controller, Get, Param } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CategoriesService } from "./categories.service";
import type { CategoryRow } from "../../db/schema";
import type { Category as SharedCategory } from "@trato/shared";

@ApiTags("categories")
@Controller("categories")
export class CategoriesController {
  constructor(private readonly categories: CategoriesService) {}

  @Get()
  tree(): Promise<SharedCategory[]> {
    return this.categories.tree();
  }

  @Get("all")
  flat(): Promise<SharedCategory[]> {
    return this.categories.flat();
  }

  @Get(":slug")
  findBySlug(@Param("slug") slug: string) {
    return this.categories.findBySlug(slug);
  }

  @Get(":slug/ancestors")
  ancestors(@Param("slug") slug: string): Promise<CategoryRow[]> {
    return this.categories.ancestors(slug);
  }
}
