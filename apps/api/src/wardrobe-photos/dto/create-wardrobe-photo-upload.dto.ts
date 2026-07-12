import { Type } from "class-transformer";
import { IsArray, IsEnum, IsInt, IsObject, IsOptional, IsString, Min } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { WardrobePhotoUploadedByRole, WardrobePhotoVisibility } from "@prisma/client";

export class CreateWardrobePhotoUploadDto {
  @ApiPropertyOptional({ description: "Deprecated dev fallback when auth is disabled." })
  @IsOptional()
  @IsString()
  uploadedByUserId?: string;

  @ApiProperty({ example: "image/jpeg" })
  @IsString()
  contentType!: string;

  @ApiPropertyOptional({ example: "navy-blazer.jpg" })
  @IsOptional()
  @IsString()
  fileName?: string;

  @ApiPropertyOptional({ description: "Booking that this photo is shared for." })
  @IsOptional()
  @IsString()
  bookingId?: string;

  @ApiPropertyOptional({ example: 900 })
  @IsOptional()
  @IsInt()
  @Min(60)
  @Type(() => Number)
  expiresInSeconds?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  caption?: string;

  @ApiProperty({ example: "tops" })
  @IsString()
  category!: string;

  @ApiPropertyOptional({ enum: WardrobePhotoVisibility, default: WardrobePhotoVisibility.PRIVATE })
  @IsOptional()
  @IsEnum(WardrobePhotoVisibility)
  visibility?: WardrobePhotoVisibility;

  @ApiProperty({ enum: WardrobePhotoUploadedByRole })
  @IsEnum(WardrobePhotoUploadedByRole)
  uploadedByRole!: WardrobePhotoUploadedByRole;

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
