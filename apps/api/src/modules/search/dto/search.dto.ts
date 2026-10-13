import { Transform } from "class-transformer";
import { IsArray, IsBoolean, IsIn, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";
import type { SortValue } from "@trato/shared";

export class SearchQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  q?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  category?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @IsIn(["nuevo", "usado"])
  condition?: string;

  @IsOptional()
  @Transform(({ value }) => (value === undefined || value === null ? undefined : Array.isArray(value) ? value : [value]))
  @IsArray()
  @IsString({ each: true })
  brand?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(120)
  location?: string;

  @IsOptional()
  @IsBoolean()
  freeShipping?: boolean;

  @IsOptional()
  @IsBoolean()
  inStock?: boolean;

  @IsOptional()
  @IsIn(["relevance", "price_asc", "price_desc", "sold_desc", "rating_desc", "newest"])
  sort?: SortValue;

  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(48)
  perPage?: number;
}
