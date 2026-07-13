import { IsArray, IsEnum, IsObject, IsOptional, IsString } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { WardrobePhotoVisibility } from "@prisma/client";

export class UpdateWardrobePhotoDto {
  @ApiPropertyOptional({ description: "Deprecated dev fallback when auth is disabled." })
  @IsOptional()
  @IsString()
  uploadedByUserId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  caption?: string;

  @ApiPropertyOptional({ example: "tops" })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ enum: WardrobePhotoVisibility })
  @IsOptional()
  @IsEnum(WardrobePhotoVisibility)
  visibility?: WardrobePhotoVisibility;

  @ApiPropertyOptional({ example: ["blazer", "workwear"] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
