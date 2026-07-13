import { Controller, Get, Query } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";

import { AvailabilityQueryDto } from "./dto/availability-query.dto";
import { SchedulingService } from "./scheduling.service";

@ApiTags("scheduling")
@Controller("scheduling")
export class SchedulingController {
  constructor(private readonly schedulingService: SchedulingService) {}

  @Get("availability")
  @ApiOkResponse({ description: "Looks up bookable availability windows for a shopper." })
  findAvailability(@Query() query: AvailabilityQueryDto) {
    return this.schedulingService.findAvailability(query);
  }
}
