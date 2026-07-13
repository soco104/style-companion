import { Type } from "class-transformer";
import { IsDate, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class AvailabilityQueryDto {
  @ApiProperty()
  @IsString()
  shopperProfileId!: string;

  @ApiProperty({ example: "2026-08-01T00:00:00.000Z" })
  @IsDate()
  @Type(() => Date)
  from!: Date;

  @ApiProperty({ example: "2026-08-08T00:00:00.000Z" })
  @IsDate()
  @Type(() => Date)
  to!: Date;
}
