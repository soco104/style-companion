import { IsArray, IsOptional, IsString } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateShopperStylePreferenceDto {
  @ApiPropertyOptional({ description: "Deprecated dev fallback when auth is disabled." })
  @IsOptional()
  @IsString()
  ownerUserId?: string;

  @ApiProperty({ example: ["minimal", "tailored", "workwear"] })
  @IsArray()
  @IsString({ each: true })
  styleTags!: string[];

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
