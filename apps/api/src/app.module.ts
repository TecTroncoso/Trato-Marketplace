import { Module } from "@nestjs/common";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { DbModule } from "./db/db.module";
import { CategoriesModule } from "./modules/categories/categories.module";
import { ProductsModule } from "./modules/products/products.module";
import { SearchModule } from "./modules/search/search.module";
import { OrdersModule } from "./modules/orders/orders.module";
import { QuestionsModule } from "./modules/questions/questions.module";
import { ReviewsModule } from "./modules/reviews/reviews.module";
import { FavoritesModule } from "./modules/favorites/favorites.module";
import { HomeModule } from "./modules/home/home.module";
import { HealthController } from "./health/health.controller";

@Module({
  imports: [
    DbModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    ProductsModule,
    SearchModule,
    OrdersModule,
    QuestionsModule,
    ReviewsModule,
    FavoritesModule,
    HomeModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
