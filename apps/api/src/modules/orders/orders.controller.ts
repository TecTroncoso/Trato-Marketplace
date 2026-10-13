import { Body, Controller, Get, Param, Post, Put, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { OrdersService } from "./orders.service";
import { CheckoutDto, UpdateOrderStatusDto } from "./dto/order.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { SafeUser } from "../../common/guards/jwt-auth.guard";
import type { Order as SharedOrder } from "@trato/shared";

@ApiTags("orders")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("orders")
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post("checkout")
  checkout(@CurrentUser() user: SafeUser, @Body() dto: CheckoutDto): Promise<SharedOrder> {
    return this.orders.checkout(user.id, dto);
  }

  @Get()
  myOrders(@CurrentUser() user: SafeUser): Promise<SharedOrder[]> {
    return this.orders.myOrders(user.id);
  }

  @Get("sales")
  sales(@CurrentUser() user: SafeUser): Promise<SharedOrder[]> {
    return this.orders.sales(user.id);
  }

  @Get(":id")
  detail(@CurrentUser() user: SafeUser, @Param("id") id: string): Promise<SharedOrder> {
    return this.orders.detail(user.id, id);
  }

  @Put(":id/status")
  updateStatus(@CurrentUser() user: SafeUser, @Param("id") id: string, @Body() dto: UpdateOrderStatusDto): Promise<SharedOrder> {
    return this.orders.updateStatus(user.id, id, dto);
  }
}
