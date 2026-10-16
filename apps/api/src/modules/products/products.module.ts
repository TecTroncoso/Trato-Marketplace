import { Module } from "@nestjs/common";
import { ProductsController } from "./products.controller";
import { ProductsService } from "./products.service";
import { CategoriesModule } from "../categories/categories.module";
import { QuestionsModule } from "../questions/questions.module";
import { ReviewsModule } from "../reviews/reviews.module";

@Module({
  imports: [CategoriesModule, QuestionsModule, ReviewsModule],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
