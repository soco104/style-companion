import { Controller, Get, Query } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";

import { MatchQueryDto } from "./dto/match-query.dto";
import { MatchingService } from "./matching.service";

@ApiTags("matching")
@Controller("shoppers")
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @Get("matches")
  @ApiOkResponse({ description: "Finds active shoppers by location and specialty." })
  findShoppers(@Query() query: MatchQueryDto) {
    return this.matchingService.findShoppers(query);
  }
}
