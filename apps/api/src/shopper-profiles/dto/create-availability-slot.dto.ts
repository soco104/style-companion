import { Type } from "class-transformer";
import { IsBoolean, IsDate, IsOptional, IsString } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateAvailabilitySlotDto {
  @ApiPropertyOptional({ description: "Deprecated dev fallback when auth is disabled." })
  @IsOptional()
  @IsString()
  ownerUserId?: string;

  @ApiProperty({ example: "2026-08-01T15:00:00.000Z" })
  @IsDate()
  @Type(() => Date)
  startsAt!: Date;

  @ApiProperty({ example: "2026-08-01T17:00:00.000Z" })
  @IsDate()
  @Type(() => Date)
  endsAt!: Date;

  @ApiProperty({ example: "America/Chicago" })
  @IsString()
  timezone!: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isRecurring?: boolean;

  @ApiPropertyOptional({ example: "FREQ=WEEKLY;BYDAY=MO,WE;INTERVAL=1" })
  @IsOptional()
  @IsString()
  recurrenceRule?: string;
}
