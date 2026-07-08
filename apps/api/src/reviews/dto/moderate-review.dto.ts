import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ModerationStatus } from "@prisma/client";
import { IsEnum, IsOptional, IsString } from "class-validator";

export class ModerateReviewDto {
  @ApiProperty({ enum: ModerationStatus })
  @IsEnum(ModerationStatus)
  moderationStatus!: ModerationStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  moderationNotes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  moderatedByUserId?: string;
}
