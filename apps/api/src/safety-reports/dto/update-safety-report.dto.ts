import { ApiPropertyOptional } from "@nestjs/swagger";
import { SafetyReportStatus } from "@prisma/client";
import { IsEnum, IsOptional, IsString } from "class-validator";

export class UpdateSafetyReportDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assignedAdminId?: string;

  @ApiPropertyOptional({ enum: SafetyReportStatus })
  @IsEnum(SafetyReportStatus)
  @IsOptional()
  status?: SafetyReportStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  resolutionNotes?: string;
}
