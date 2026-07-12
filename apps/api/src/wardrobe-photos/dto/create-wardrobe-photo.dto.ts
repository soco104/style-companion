import { IsArray, IsEnum, IsObject, IsOptional, IsString } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { WardrobePhotoUploadedByRole, WardrobePhotoVisibility } from "@prisma/client";

export class CreateWardrobePhotoDto {
  @ApiPropertyOptional({ description: "Deprecated dev fallback when auth is disabled." })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ description: "Deprecated dev fallback when auth is disabled." })
  @IsOptional()
  @IsString()
  uploadedByUserId?: string;

  @ApiProperty({ example: "https://example.test/media/wardrobe/maya-blazer.jpg" })
  @IsString()
  url!: string;

  @ApiProperty({ example: "dev/wardrobe/maya-blazer.jpg" })
  @IsString()
  storageKey!: string;

  @ApiPropertyOptional({ description: "Booking that this photo is shared for." })
  @IsOptional()
  @IsString()
  bookingId?: string;

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
