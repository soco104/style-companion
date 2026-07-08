import { Type } from "class-transformer";
import { IsInt, IsString, Max, Min, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateReviewDto {
  @ApiProperty()
  @IsString()
  bookingId!: string;

  @ApiProperty()
  @IsString()
  customerProfileId!: string;

  @ApiProperty()
  @IsString()
  shopperProfileId!: string;

  @ApiProperty({ minimum: 1, maximum: 5 })
  @IsInt()
  @Max(5)
  @Min(1)
  @Type(() => Number)
  rating!: number;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  body!: string;
}
