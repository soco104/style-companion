import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from "@nestjs/swagger";

import { CreateStyleQuizResponseDto } from "./dto/create-style-quiz-response.dto";
import { StyleQuizService } from "./style-quiz.service";

@ApiTags("style-quiz")
@Controller("style-quiz")
export class StyleQuizController {
  constructor(private readonly styleQuizService: StyleQuizService) {}

  @Post()
  @ApiCreatedResponse({ description: "Creates a style quiz response." })
  createResponse(@Body() dto: CreateStyleQuizResponseDto) {
    return this.styleQuizService.createResponse(dto);
  }

  @Get("customers/:customerProfileId/responses")
  @ApiOkResponse({ description: "Lists style quiz responses for a customer." })
  findByCustomer(@Param("customerProfileId") customerProfileId: string) {
    return this.styleQuizService.findByCustomer(customerProfileId);
  }
}
