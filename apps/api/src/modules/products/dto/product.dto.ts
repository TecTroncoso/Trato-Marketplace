import { IsArray, IsBoolean, IsIn, IsInt, IsObject, IsOptional, IsString, Max, MaxLength, Min, MinLength } from "class-validator";

export class CreateProductDto {
  @IsString()
  @MinLength(10, { message: "El título debe tener al menos 10 caracteres" })
  @MaxLength(120)
  title: string;

  @IsString()
  @MinLength(20, { message: "La descripción debe tener al menos 20 caracteres" })
  @MaxLength(4000)
  description: string;

  @IsInt({ message: "El precio debe ser un número entero" })
  @Min(100, { message: "El precio mínimo es $100" })
  @Max(99999999)
  price: number;

  @IsOptional()
  @IsInt()
  @Min(100)
  @Max(99999999)
  originalPrice?: number;

  @IsInt()
  @Min(0, { message: "El stock no puede ser negativo" })
  @Max(99999)
  stock: number;

  @IsIn(["nuevo", "usado"], { message: "La condición debe ser nuevo o usado" })
  condition: string;

  @IsString()
  @MinLength(3)
  @MaxLength(120)
  categorySlug: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  brand?: string;

  @IsOptional()
  @IsBoolean()
  freeShipping?: boolean;

  @IsOptional()
  @IsObject()
  attributes?: Record<string, string>;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(20)
  @MaxLength(4000)
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(100)
  @Max(99999999)
  price?: number;

  @IsOptional()
  @IsInt()
  @Min(100)
  @Max(99999999)
  originalPrice?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(99999)
  stock?: number;

  @IsOptional()
  @IsIn(["nuevo", "usado"])
  condition?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  brand?: string;

  @IsOptional()
  @IsBoolean()
  freeShipping?: boolean;

  @IsOptional()
  @IsObject()
  attributes?: Record<string, string>;
}
