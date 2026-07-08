import { Type } from "class-transformer";
import {
  IsArray,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Min,
  MinLength
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateStyleQuizResponseDto {
  @ApiProperty()
  @IsString()
  customerProfileId!: string;

  @ApiProperty({ example: { priorities: ["workwear", "capsule wardrobe"] } })
  @IsObject()
  styleGoals!: Record<string, unknown>;

  @ApiProperty({ example: ["work", "weekend"] })
  @IsArray()
  @IsString({ each: true })
  preferredOccasions!: string[];

  @ApiPropertyOptional({ example: 25000 })
  @IsInt()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  budgetMinCents?: number;

  @ApiPropertyOptional({ example: 60000 })
  @IsInt()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  budgetMaxCents?: number;

  @ApiProperty({ example: ["navy", "cream"] })
  @IsArray()
  @IsString({ each: true })
  colorPreferences!: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fitConcerns?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sizingNotes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  additionalNotes?: string;
}
