import { Type } from "class-transformer";
import { IsBoolean, IsInt, IsOptional, IsString, Min } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateShopperPricingPackageDto {
  @ApiPropertyOptional({ description: "Deprecated dev fallback when auth is disabled." })
  @IsOptional()
  @IsString()
  ownerUserId?: string;

  @ApiPropertyOptional({ example: "Closet Refresh" })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  sessionCount?: number;

  @ApiPropertyOptional({ example: 8500 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  pricePerSessionCents?: number;

  @ApiPropertyOptional({ example: 17000 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  totalPriceCents?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;
}
