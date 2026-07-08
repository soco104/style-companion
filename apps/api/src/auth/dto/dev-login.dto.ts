import { ApiProperty } from "@nestjs/swagger";
import { IsEmail } from "class-validator";

export class DevLoginDto {
  @ApiProperty({ example: "customer@stylecompanion.test" })
  @IsEmail()
  email!: string;
}
