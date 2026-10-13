import { Module } from "@nestjs/common";
import { HomeController } from "./home.controller";
import { HomeService } from "./home.service";
import { CategoriesModule } from "../categories/categories.module";

@Module({
  imports: [CategoriesModule],
  controllers: [HomeController],
  providers: [HomeService],
})
export class HomeModule {}
