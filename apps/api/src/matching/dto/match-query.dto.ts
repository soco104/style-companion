import { Type } from "class-transformer";
import { IsDateString, IsInt, IsOptional, IsString, Min } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class MatchQueryDto {
  @ApiPropertyOptional({ description: "Customer profile used to derive location, budget, and style goals." })
  @IsOptional()
  @IsString()
  customerProfileId?: string;

  @ApiPropertyOptional({ example: "Nashville" })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: "TN" })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ example: "Workwear" })
  @IsOptional()
  @IsString()
  specialty?: string;

  @ApiPropertyOptional({ description: "Comma-separated specialty names.", example: "Workwear,Capsule Wardrobes" })
  @IsOptional()
  @IsString()
  specialties?: string;

  @ApiPropertyOptional({ description: "Comma-separated style goal terms.", example: "workwear,capsule,petite" })
  @IsOptional()
  @IsString()
  styleGoals?: string;

  @ApiPropertyOptional({ description: "Customer maximum shopping or session budget in cents.", example: 60000 })
  @IsInt()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  budgetMaxCents?: number;

  @ApiPropertyOptional({ description: "Only include shoppers with availability after this ISO timestamp." })
  @IsDateString()
  @IsOptional()
  availableFrom?: string;

  @ApiPropertyOptional({ description: "Only include shoppers with availability before this ISO timestamp." })
  @IsDateString()
  @IsOptional()
  availableTo?: string;

  @ApiPropertyOptional({ default: 20, minimum: 1 })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  take = 20;
}
