import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from "@nestjs/swagger";

import { PaginationQueryDto } from "../common/dto/pagination-query.dto";
import { CreateSafetyReportDto } from "./dto/create-safety-report.dto";
import { UpdateSafetyReportDto } from "./dto/update-safety-report.dto";
import { SafetyReportsService } from "./safety-reports.service";

@ApiTags("safety-reports")
@Controller("safety-reports")
export class SafetyReportsController {
  constructor(private readonly safetyReportsService: SafetyReportsService) {}

  @Post()
  @ApiCreatedResponse({ description: "Creates a safety report." })
  create(@Body() dto: CreateSafetyReportDto) {
    return this.safetyReportsService.create(dto);
  }

  @Get()
  @ApiOkResponse({ description: "Lists safety reports." })
  findMany(@Query() query: PaginationQueryDto) {
    return this.safetyReportsService.findMany(query);
  }

  @Get(":id")
  @ApiOkResponse({ description: "Gets a safety report." })
  findOne(@Param("id") id: string) {
    return this.safetyReportsService.findOne(id);
  }

  @Patch(":id")
  @ApiOkResponse({ description: "Updates a safety report." })
  update(@Param("id") id: string, @Body() dto: UpdateSafetyReportDto) {
    return this.safetyReportsService.update(id, dto);
  }
}
