import { Body, Controller, Delete, Get, Param, Patch, Post, Put, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { SafeUser } from "../../common/guards/jwt-auth.guard";
import type { AddressRow } from "../../db/schema";

class CreateAddressDto {
  label: string;
  recipient: string;
  street: string;
  city: string;
  province: string;
  zip: string;
  phone?: string | null;
  isDefault?: boolean;
}

class UpdateProfileDto {
  name?: string;
  phone?: string;
  location?: string;
  sellerName?: string;
}

@ApiTags("users")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("users")
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get("me")
  me(@CurrentUser() user: SafeUser): SafeUser {
    return user;
  }

  @Patch("me")
  updateProfile(@CurrentUser() user: SafeUser, @Body() dto: UpdateProfileDto): Promise<SafeUser> {
    return this.users.updateProfile(user.id, dto) as Promise<SafeUser>;
  }

  @Get("me/addresses")
  listAddresses(@CurrentUser() user: SafeUser): Promise<AddressRow[]> {
    return this.users.listAddresses(user.id);
  }

  @Post("me/addresses")
  createAddress(@CurrentUser() user: SafeUser, @Body() dto: CreateAddressDto): Promise<AddressRow> {
    return this.users.createAddress(user.id, {
      label: dto.label,
      recipient: dto.recipient,
      street: dto.street,
      city: dto.city,
      province: dto.province,
      zip: dto.zip,
      phone: dto.phone ?? null,
      isDefault: dto.isDefault ?? false,
    });
  }

  @Delete("me/addresses/:id")
  removeAddress(@CurrentUser() user: SafeUser, @Param("id") id: string): Promise<void> {
    return this.users.deleteAddress(user.id, id);
  }

  @Put("me/addresses/:id/default")
  setDefaultAddress(@CurrentUser() user: SafeUser, @Param("id") id: string): Promise<AddressRow> {
    return this.users.setDefaultAddress(user.id, id);
  }
}
