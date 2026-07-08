import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class TransitionBookingDto {
  @ApiPropertyOptional({ description: "User who triggered the status change." })
  @IsOptional()
  @IsString()
  changedByUserId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;
}
