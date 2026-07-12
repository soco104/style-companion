import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsOptional, IsString, MinLength } from "class-validator";

export class UpdateProfileFeeWaiverDto {
  @ApiPropertyOptional({ description: "Whether marketplace/admin fees should be waived for this profile." })
  @IsBoolean()
  feesWaived!: boolean;

  @ApiPropertyOptional({ description: "Internal reason shown to admins." })
  @IsOptional()
  @IsString()
  @MinLength(1)
  feeWaiverReason?: string;

  @ApiPropertyOptional({ description: "Admin user id that applied or removed the waiver." })
  @IsOptional()
  @IsString()
  feeWaivedByUserId?: string;
}
