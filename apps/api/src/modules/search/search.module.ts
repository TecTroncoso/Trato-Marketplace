import { Module, OnModuleInit } from "@nestjs/common";
import { SearchController } from "./search.controller";
import { SearchService } from "./search.service";
import { CategoriesModule } from "../categories/categories.module";

@Module({
  imports: [CategoriesModule],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule implements OnModuleInit {
  constructor(private readonly search: SearchService) {}

  onModuleInit(): void {
    void this.search.configureIndex();
  }
}
