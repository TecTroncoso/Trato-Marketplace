import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Put, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { ProductsService } from "./products.service";
import { CreateProductDto, UpdateProductDto } from "./dto/product.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { SafeUser } from "../../common/guards/jwt-auth.guard";
import type { ProductDetail, ProductSummary } from "@trato/shared";

@ApiTags("products")
@Controller()
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

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
