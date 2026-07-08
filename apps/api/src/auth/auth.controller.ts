import { Body, Controller, Post } from "@nestjs/common";
import { ApiCreatedResponse, ApiTags } from "@nestjs/swagger";

import { AuthService } from "./auth.service";
import { DevLoginDto } from "./dto/dev-login.dto";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("dev-login")
  @ApiCreatedResponse({ description: "Development-only identity lookup." })
  devLogin(@Body() dto: DevLoginDto) {
    return this.authService.devLogin(dto);
  }
}
