import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from "class-validator";

export class CreateUserDto {
  @ApiProperty({ example: "maya@example.com" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "Maya Customer" })
  @IsString()
  @MinLength(1)
  name!: string;

  @ApiPropertyOptional({ example: "+15550101010" })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ enum: UserRole })
  @IsEnum(UserRole)
  role!: UserRole;
}
