import { Injectable } from "@nestjs/common";

import { PaginationQueryDto } from "../common/dto/pagination-query.dto";
import { TwilioConversationsService } from "../integrations/twilio-conversations/twilio-conversations.service";
import { PrismaService } from "../prisma/prisma.service";
import { CreateChatThreadDto } from "./dto/create-chat-thread.dto";

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly twilioConversationsService: TwilioConversationsService
  ) {}

  placeholder() {
    return {
      integration: this.twilioConversationsService.getStatus(),
      provider: "placeholder",
      status: "thread_shell_only",
      note: "Message delivery and realtime transport are not implemented yet."
    };
  }

  createThread(dto: CreateChatThreadDto) {
    return this.prisma.chatThread.create({
      data: dto
    });
  }

  findThreads(query: PaginationQueryDto) {
    return this.prisma.chatThread.findMany({
      include: {
        booking: true,
        customerProfile: { include: { user: true } },
        shopperProfile: { include: { user: true } }
      },
      orderBy: { updatedAt: "desc" },
      skip: query.skip,
      take: query.take
    });
  }
}
