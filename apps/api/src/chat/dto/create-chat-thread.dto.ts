import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateChatThreadDto {
  @ApiProperty()
  @IsString()
  bookingId!: string;

  @ApiProperty()
  @IsString()
  customerProfileId!: string;

  @ApiProperty()
  @IsString()
  shopperProfileId!: string;
}
