import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Put, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { ProductsService } from "./products.service";
import { QuestionsService } from "../questions/questions.service";
import { ReviewsService } from "../reviews/reviews.service";
import { CategoriesService } from "../categories/categories.service";
import { CreateProductDto, UpdateProductDto } from "./dto/product.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { SafeUser } from "../../common/guards/jwt-auth.guard";
import type { ProductDetail, ProductSummary } from "@trato/shared";

@ApiTags("products")
@Controller()
export class ProductsController {
  constructor(
    private readonly products: ProductsService,
    private readonly questions: QuestionsService,
    private readonly reviews: ReviewsService,
    private readonly categories: CategoriesService,
  ) {}

  @Get("products/mine")
  @UseGuards(JwtAuthGuard)
  mine(@CurrentUser() user: SafeUser) {
    return this.products.mine(user.id);
  }

  @Get("sellers/:id/products")
  bySeller(@Param("id") id: string): Promise<ProductSummary[]> {
    return this.products.bySeller(id);
  }

  @Get("products/:id/related")
  related(@Param("id") id: string): Promise<ProductSummary[]> {
    return this.products.relatedFor(id);
  }

  @Get("products/:param")
  findByParam(@Param("param") param: string): Promise<ProductDetail> {
    return this.products.findByParam(param);
  }

  @Get("products/:slug/page")
  async page(@Param("slug") slug: string) {
    const product = await this.products.findByParam(slug);
    const [reviews, questions, related, sellerProducts, category] = await Promise.all([
      this.reviews.listForProduct(product.id).catch(() => null),
      this.questions.listForProduct(product.id).catch(() => []),
      this.products.related(product.id, product.categoryId, product.seller.id, 10).catch(() => []),
      this.products.bySeller(product.seller.id, 8).catch(() => []),
      this.categories
        .findBySlug(product.categorySlug)
        .then((c) => ({ name: c.name, slug: c.slug, parent: c.parent ? { name: c.parent.name, slug: c.parent.slug } : null }))
        .catch(() => null),
    ]);
    return {
      product,
      reviews,
      questions,
      related: related.filter((item) => item.id !== product.id),
      sellerProducts: sellerProducts.filter((item) => item.id !== product.id),
      category,
    };
  }

  @Post("products/:id/view")
  @HttpCode(HttpStatus.OK)
  registerView(@Param("id") id: string): Promise<{ id: string; views: number }> {
    return this.products.registerView(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post("products")
  @HttpCode(HttpStatus.CREATED)
  create(@CurrentUser() user: SafeUser, @Body() dto: CreateProductDto): Promise<ProductDetail> {
    return this.products.create(user.id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch("products/:id")
  update(@CurrentUser() user: SafeUser, @Param("id") id: string, @Body() dto: UpdateProductDto): Promise<ProductDetail> {
    return this.products.update(user.id, id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put("products/:id/pause")
  pause(@CurrentUser() user: SafeUser, @Param("id") id: string): Promise<{ id: string; status: string }> {
    return this.products.pause(user.id, id);
  }
}
