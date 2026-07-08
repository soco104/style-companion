import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { AvailabilitySlot, Booking, BookingStatus } from "@prisma/client";

import { PaginationQueryDto } from "../common/dto/pagination-query.dto";
import { PrismaService } from "../prisma/prisma.service";
import { CreateBookingDto } from "./dto/create-booking.dto";
import { TransitionBookingDto } from "./dto/transition-booking.dto";

const bookingInclude = {
  customerProfile: { include: { user: true } },
  payment: true,
  review: true,
  shopperProfile: { include: { user: true } },
  statusHistory: { orderBy: { createdAt: "asc" as const } }
};

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateBookingDto) {
    this.assertValidSchedule(dto.scheduledStartAt, dto.scheduledEndAt);

    const [customerProfile, shopperProfile] = await Promise.all([
      this.prisma.customerProfile.findUnique({
        include: { user: true },
        where: { id: dto.customerProfileId }
      }),
      this.prisma.shopperProfile.findUnique({
        include: { availability: true, user: true },
        where: { id: dto.shopperProfileId }
      })
    ]);

    if (!customerProfile) {
      throw new NotFoundException("Customer profile not found.");
    }

    if (!shopperProfile) {
      throw new NotFoundException("Shopper profile not found.");
    }

    if (!shopperProfile.isActive) {
      throw new BadRequestException("Shopper is not accepting bookings.");
    }

    if (customerProfile.userId === shopperProfile.userId) {
      throw new BadRequestException("Customers cannot book their own shopper profile.");
    }

    this.assertWithinAvailability(shopperProfile.availability, dto.scheduledStartAt, dto.scheduledEndAt);
    await this.assertNoAcceptedOverlap({
      customerProfileId: dto.customerProfileId,
      endsAt: dto.scheduledEndAt,
      shopperProfileId: dto.shopperProfileId,
      startsAt: dto.scheduledStartAt
    });

    return this.prisma.booking.create({
      data: {
        ...dto,
        status: BookingStatus.REQUESTED,
        statusHistory: {
          create: {
            changedByUserId: customerProfile.userId,
            reason: "Booking requested.",
            status: BookingStatus.REQUESTED
          }
        }
      },
      include: bookingInclude
    });
  }

  findMany(query: PaginationQueryDto) {
    return this.prisma.booking.findMany({
      include: bookingInclude,
      orderBy: { scheduledStartAt: "desc" },
      skip: query.skip,
      take: query.take
    });
  }

  async findOne(id: string) {
    const booking = await this.prisma.booking.findUnique({
      include: bookingInclude,
      where: { id }
    });

    if (!booking) {
      throw new NotFoundException("Booking not found.");
    }

    return booking;
  }

  accept(id: string, dto: TransitionBookingDto) {
    return this.transition(id, BookingStatus.ACCEPTED, [BookingStatus.REQUESTED], dto, {}, true);
  }

  decline(id: string, dto: TransitionBookingDto) {
    return this.transition(id, BookingStatus.DECLINED, [BookingStatus.REQUESTED], dto);
  }

  cancel(id: string, dto: TransitionBookingDto) {
    return this.transition(id, BookingStatus.CANCELLED, [BookingStatus.REQUESTED, BookingStatus.ACCEPTED], dto, {
      cancelledAt: new Date()
    });
  }

  complete(id: string, dto: TransitionBookingDto) {
    return this.transition(id, BookingStatus.COMPLETED, [BookingStatus.ACCEPTED], dto, {
      completedAt: new Date()
    });
  }

  dispute(id: string, dto: TransitionBookingDto) {
    return this.transition(id, BookingStatus.DISPUTED, [BookingStatus.ACCEPTED, BookingStatus.COMPLETED], dto);
  }

  private assertValidSchedule(startsAt: Date, endsAt: Date) {
    if (endsAt <= startsAt) {
      throw new BadRequestException("Booking end time must be after start time.");
    }
  }

  private assertWithinAvailability(slots: AvailabilitySlot[], startsAt: Date, endsAt: Date) {
    const isAvailable = slots.some((slot) => slot.startsAt <= startsAt && slot.endsAt >= endsAt);

    if (!isAvailable) {
      throw new BadRequestException("Requested time is outside the shopper's availability.");
    }
  }

  private async assertNoAcceptedOverlap(input: {
    customerProfileId: string;
    endsAt: Date;
    excludeBookingId?: string;
    shopperProfileId: string;
    startsAt: Date;
  }) {
    const overlapWhere = {
      id: input.excludeBookingId ? { not: input.excludeBookingId } : undefined,
      scheduledEndAt: { gt: input.startsAt },
      scheduledStartAt: { lt: input.endsAt },
      status: BookingStatus.ACCEPTED
    };

    const [shopperConflict, customerConflict] = await Promise.all([
      this.prisma.booking.findFirst({
        where: {
          ...overlapWhere,
          shopperProfileId: input.shopperProfileId
        }
      }),
      this.prisma.booking.findFirst({
        where: {
          ...overlapWhere,
          customerProfileId: input.customerProfileId
        }
      })
    ]);

    if (shopperConflict) {
      throw new BadRequestException("Shopper already has an accepted booking during this time.");
    }

    if (customerConflict) {
      throw new BadRequestException("Customer already has an accepted booking during this time.");
    }
  }

  private async transition(
    id: string,
    nextStatus: BookingStatus,
    allowedCurrentStatuses: BookingStatus[],
    dto: TransitionBookingDto,
    extraData: Record<string, Date> = {},
    reservesTimeSlot = false
  ) {
    const booking = await this.prisma.booking.findUnique({
      where: { id }
    }) as Booking | null;

    if (!booking) {
      throw new NotFoundException("Booking not found.");
    }

    if (!allowedCurrentStatuses.includes(booking.status)) {
      throw new BadRequestException(
        `Booking cannot transition from ${booking.status} to ${nextStatus}.`
      );
    }

    if (reservesTimeSlot) {
      await this.assertNoAcceptedOverlap({
        customerProfileId: booking.customerProfileId,
        endsAt: booking.scheduledEndAt,
        excludeBookingId: booking.id,
        shopperProfileId: booking.shopperProfileId,
        startsAt: booking.scheduledStartAt
      });
    }

    return this.prisma.booking.update({
      data: {
        ...extraData,
        status: nextStatus,
        statusHistory: {
          create: {
            changedByUserId: dto.changedByUserId,
            reason: dto.reason,
            status: nextStatus
          }
        }
      },
      include: bookingInclude,
      where: { id }
    });
  }
}
