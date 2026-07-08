import { Type } from "class-transformer";
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateShopperProfileDto {
  @ApiProperty()
  @IsString()
  userId!: string;

  @ApiProperty({ example: "Practical wardrobe edits for busy professionals" })
  @IsString()
  @MinLength(1)
  headline!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({ example: "Nashville" })
  @IsString()
  city!: string;

  @ApiProperty({ example: "TN" })
  @IsString()
  state!: string;

  @ApiPropertyOptional({ default: 15 })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  serviceRadiusMiles?: number;

  @ApiProperty({ example: 8500 })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  hourlyRateCents!: number;

  @ApiPropertyOptional({ default: "USD" })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
