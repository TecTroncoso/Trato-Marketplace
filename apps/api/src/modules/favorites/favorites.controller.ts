import { Body, Controller, Delete, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { FavoritesService } from "./favorites.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { SafeUser } from "../../common/guards/jwt-auth.guard";
import type { ProductSummary } from "@trato/shared";

class AddFavoriteDto {
  productId: string;
}

class SyncFavoritesDto {
  productIds: string[];
}

@ApiTags("favorites")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("favorites")
export class FavoritesController {
  constructor(private readonly favorites: FavoritesService) {}

  @Get()
  list(@CurrentUser() user: SafeUser): Promise<ProductSummary[]> {
    return this.favorites.list(user.id);
  }

  @Post()
  add(@CurrentUser() user: SafeUser, @Body() dto: AddFavoriteDto): Promise<{ productId: string; added: boolean }> {
    return this.favorites.add(user.id, dto.productId);
  }

  @Post("sync")
  sync(@CurrentUser() user: SafeUser, @Body() dto: SyncFavoritesDto): Promise<{ added: number }> {
    return this.favorites.sync(user.id, dto.productIds ?? []);
  }

  @Delete(":productId")
  remove(@CurrentUser() user: SafeUser, @Param("productId") productId: string): Promise<{ productId: string; removed: boolean }> {
    return this.favorites.remove(user.id, productId);
  }
}
