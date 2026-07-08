import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Min } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreatePaymentPlaceholderDto {
  @ApiProperty()
  @IsString()
  bookingId!: string;

  @ApiProperty()
  @IsString()
  customerProfileId!: string;

  @ApiProperty({ example: 17000 })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  amountCents!: number;

  @ApiPropertyOptional({ default: "USD" })
  @IsOptional()
  @IsString()
  currency?: string;
}
