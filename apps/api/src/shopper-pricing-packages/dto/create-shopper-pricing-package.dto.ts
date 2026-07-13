import { Type } from "class-transformer";
import { IsBoolean, IsInt, IsOptional, IsString, Min } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateShopperPricingPackageDto {
  @ApiPropertyOptional({ description: "Deprecated dev fallback when auth is disabled." })
  @IsOptional()
  @IsString()
  ownerUserId?: string;

  @ApiProperty({ example: "Closet Refresh" })
  @IsString()
  title!: string;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  sessionCount!: number;

  @ApiProperty({ example: 8500 })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  pricePerSessionCents!: number;

  @ApiProperty({ example: 17000 })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  totalPriceCents!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isActive?: boolean;
}
