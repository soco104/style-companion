import { Module } from "@nestjs/common";

import { StyleQuizController } from "./style-quiz.controller";
import { StyleQuizService } from "./style-quiz.service";

@Module({
  controllers: [StyleQuizController],
  providers: [StyleQuizService]
})
export class StyleQuizModule {}
