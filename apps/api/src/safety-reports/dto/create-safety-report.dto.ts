import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { SafetyReportCategory } from "@prisma/client";
import { IsEnum, IsOptional, IsString, MinLength } from "class-validator";

export class CreateSafetyReportDto {
  @ApiProperty()
  @IsString()
  reporterUserId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reportedUserId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bookingId?: string;

  @ApiProperty({ enum: SafetyReportCategory })
  @IsEnum(SafetyReportCategory)
  category!: SafetyReportCategory;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  description!: string;
}
