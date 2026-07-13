import { IsArray, IsOptional, IsString } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateShopperStylePreferenceDto {
  @ApiPropertyOptional({ description: "Deprecated dev fallback when auth is disabled." })
  @IsOptional()
  @IsString()
  ownerUserId?: string;

  @ApiPropertyOptional({ example: ["minimal", "tailored", "workwear"] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  styleTags?: string[];

  @ApiPropertyOptional({ example: ["Everlane", "Madewell"] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredBrands?: string[];

  @ApiPropertyOptional({ example: ["ultra fast fashion"] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  avoidedStyles?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
