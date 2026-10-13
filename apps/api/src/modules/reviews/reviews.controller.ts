import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { ReviewsService } from "./reviews.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { SafeUser } from "../../common/guards/jwt-auth.guard";

class CreateReviewDto {
  productId: string;
  rating: number;
  title?: string;
  comment: string;
}

@ApiTags("reviews")
@Controller()
export class ReviewsController {
  constructor(private readonly reviews: ReviewsService) {}

  @Get("products/:id/reviews")
  list(@Param("id") id: string) {
    return this.reviews.listForProduct(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post("reviews")
  create(@CurrentUser() user: SafeUser, @Body() dto: CreateReviewDto) {
    return this.reviews.create(user, dto);
  }
}
