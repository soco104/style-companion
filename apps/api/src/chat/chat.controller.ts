import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from "@nestjs/swagger";

import { PaginationQueryDto } from "../common/dto/pagination-query.dto";
import { ChatService } from "./chat.service";
import { CreateChatThreadDto } from "./dto/create-chat-thread.dto";

@ApiTags("chat")
@Controller("chat")
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get("placeholder")
  @ApiOkResponse({ description: "Describes current chat integration status." })
  placeholder() {
    return this.chatService.placeholder();
  }

  @Post("threads")
  @ApiCreatedResponse({ description: "Creates a chat thread shell for a booking." })
  createThread(@Body() dto: CreateChatThreadDto) {
    return this.chatService.createThread(dto);
  }

  @Get("threads")
  @ApiOkResponse({ description: "Lists chat thread shells." })
  findThreads(@Query() query: PaginationQueryDto) {
    return this.chatService.findThreads(query);
  }
}
