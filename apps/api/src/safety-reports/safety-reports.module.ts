import { Module } from "@nestjs/common";

import { SafetyReportsController } from "./safety-reports.controller";
import { SafetyReportsService } from "./safety-reports.service";

@Module({
  controllers: [SafetyReportsController],
  providers: [SafetyReportsService]
})
export class SafetyReportsModule {}
