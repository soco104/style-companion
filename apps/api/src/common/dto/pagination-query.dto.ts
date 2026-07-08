import { Type } from "class-transformer";
import { IsInt, IsOptional, Max, Min } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class PaginationQueryDto {
  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsInt()
  @IsOptional()
  @Max(100)
  @Min(1)
  @Type(() => Number)
  take = 20;

  @ApiPropertyOptional({ default: 0, minimum: 0 })
  @IsInt()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  skip = 0;
}
