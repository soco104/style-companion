import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from "@nestjs/swagger";

import { PaginationQueryDto } from "../common/dto/pagination-query.dto";
import { CreateShopperProfileDto } from "./dto/create-shopper-profile.dto";
import { CreateSpecialtyDto } from "./dto/create-specialty.dto";
import { UpdateShopperProfileDto } from "./dto/update-shopper-profile.dto";
import { ShopperProfilesService } from "./shopper-profiles.service";

@ApiTags("shopper-profiles")
@Controller("profiles/shopper")
export class ShopperProfilesController {
  constructor(private readonly shopperProfilesService: ShopperProfilesService) {}

  @Post()
  @ApiCreatedResponse({ description: "Creates a shopper profile." })
  create(@Body() dto: CreateShopperProfileDto) {
    return this.shopperProfilesService.create(dto);
  }

  @Get()
  @ApiOkResponse({ description: "Lists shopper profiles." })
  findMany(@Query() query: PaginationQueryDto) {
    return this.shopperProfilesService.findMany(query);
  }

  @Get(":id")
  @ApiOkResponse({ description: "Gets a shopper profile." })
  findOne(@Param("id") id: string) {
    return this.shopperProfilesService.findOne(id);
  }

  @Patch(":id")
  @ApiOkResponse({ description: "Updates a shopper profile." })
  update(@Param("id") id: string, @Body() dto: UpdateShopperProfileDto) {
    return this.shopperProfilesService.update(id, dto);
  }

  @Post(":id/specialties")
  @ApiCreatedResponse({ description: "Adds a shopper specialty." })
  addSpecialty(@Param("id") id: string, @Body() dto: CreateSpecialtyDto) {
    return this.shopperProfilesService.addSpecialty(id, dto);
  }
}
