import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, MinLength } from "class-validator";

export class UpdateCustomerProfileDto {
  @ApiPropertyOptional({ example: "Nashville" })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: "TN" })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  bio?: string;

  @ApiPropertyOptional({ example: "she/her" })
  @IsOptional()
  @IsString()
  pronouns?: string;
}
