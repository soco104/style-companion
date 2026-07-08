import { Injectable } from "@nestjs/common";
import { PaymentProvider, PaymentStatus } from "@prisma/client";

import { PaginationQueryDto } from "../common/dto/pagination-query.dto";
import { StripeConnectService } from "../integrations/stripe-connect/stripe-connect.service";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePaymentPlaceholderDto } from "./dto/create-payment-placeholder.dto";

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stripeConnectService: StripeConnectService
  ) {}

  placeholder() {
    return {
      integration: this.stripeConnectService.getStatus(),
      provider: "placeholder",
      status: "not_integrated",
      note: "Payment processing is intentionally stubbed for the MVP backend scaffold."
    };
  }

  createPlaceholder(dto: CreatePaymentPlaceholderDto) {
    return this.prisma.payment.create({
      data: {
        amountCents: dto.amountCents,
        bookingId: dto.bookingId,
        currency: dto.currency,
        customerProfileId: dto.customerProfileId,
        provider: PaymentProvider.MANUAL,
        status: PaymentStatus.PENDING
      }
    });
  }

  findMany(query: PaginationQueryDto) {
    return this.prisma.payment.findMany({
      include: {
        booking: true,
        customerProfile: { include: { user: true } }
      },
      orderBy: { createdAt: "desc" },
      skip: query.skip,
      take: query.take
    });
  }
}
