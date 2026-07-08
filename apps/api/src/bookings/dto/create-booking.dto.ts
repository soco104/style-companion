import { Type } from "class-transformer";
import { IsDate, IsInt, IsOptional, IsString, Min } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateBookingDto {
  @ApiProperty()
  @IsString()
  customerProfileId!: string;

  @ApiProperty()
  @IsString()
  shopperProfileId!: string;

  @ApiProperty({ example: "2026-08-01T15:00:00.000Z" })
  @IsDate()
  @Type(() => Date)
  scheduledStartAt!: Date;

  @ApiProperty({ example: "2026-08-01T17:00:00.000Z" })
  @IsDate()
  @Type(() => Date)
  scheduledEndAt!: Date;

  @ApiProperty({ example: "America/Chicago" })
  @IsString()
  timezone!: string;

  @ApiPropertyOptional({ example: "Green Hills Mall" })
  @IsOptional()
  @IsString()
  locationName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  addressLine1?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  addressLine2?: string;

  @ApiProperty({ example: "Nashville" })
  @IsString()
  city!: string;

  @ApiProperty({ example: "TN" })
  @IsString()
  state!: string;

  @ApiPropertyOptional({ example: "37215" })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiProperty({ example: "Build polished work outfits that mix and match." })
  @IsString()
  goal!: string;

  @ApiPropertyOptional({ example: 60000 })
  @IsInt()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  budgetCents?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customerNotes?: string;

  @ApiProperty({ example: 17000 })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  totalPriceCents!: number;

  @ApiPropertyOptional({ default: "USD" })
  @IsOptional()
  @IsString()
  currency?: string;
}
