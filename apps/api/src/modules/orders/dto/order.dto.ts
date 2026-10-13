import { ArrayMinSize, IsArray, IsIn, IsInt, IsObject, IsOptional, IsString, Max, MaxLength, Min, MinLength, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class CheckoutItemDto {
  @IsString()
  productId: string;

  @IsInt()
  @Min(1)
  @Max(50)
  quantity: number;
}

export class CheckoutAddressDto {
  @IsString()
  @MinLength(3, { message: "Ingresá el nombre de quien recibe" })
  @MaxLength(80)
  recipient: string;

  @IsString()
  @MinLength(4, { message: "Ingresá la calle y altura" })
  @MaxLength(120)
  street: string;

  @IsString()
  @MinLength(2)
  @MaxLength(80)
  city: string;

  @IsString()
  @MinLength(2)
  @MaxLength(80)
  province: string;

  @IsString()
  @MinLength(4, { message: "Ingresá el código postal" })
  @MaxLength(10)
  zip: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;
}

export class CheckoutDto {
  @IsArray({ message: "El carrito está vacío" })
  @ArrayMinSize(1, { message: "El carrito está vacío" })
  @ValidateNested({ each: true })
  @Type(() => CheckoutItemDto)
  items: CheckoutItemDto[];

  @IsIn(["tarjeta_credito", "tarjeta_debito", "efectivo", "transferencia"], {
    message: "Elegí un método de pago válido",
  })
  paymentMethod: string;

  @IsOptional()
  @IsIn(["estandar", "express"])
  shippingMethod?: string;

  @IsObject({ message: "Ingresá una dirección de envío" })
  @ValidateNested()
  @Type(() => CheckoutAddressDto)
  address: CheckoutAddressDto;
}

export class UpdateOrderStatusDto {
  @IsIn(["preparando", "enviado", "entregado", "cancelado"], { message: "Estado inválido" })
  status: string;
}
