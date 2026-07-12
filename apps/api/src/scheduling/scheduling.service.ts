import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { AvailabilitySlot, Booking, BookingStatus } from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";
import { AvailabilityQueryDto } from "./dto/availability-query.dto";

type TimeWindow = {
  startsAt: Date;
  endsAt: Date;
};

type MaterializedAvailabilitySlot = TimeWindow & {
  id: string;
  isRecurring: boolean;
  recurrenceRule?: string | null;
  sourceSlotId: string;
  timezone: string;
};

type ParsedRecurrenceRule = {
  byDays?: number[];
  count?: number;
  freq?: "DAILY" | "WEEKLY";
  interval: number;
  until?: Date;
};

@Injectable()
export class SchedulingService {
  constructor(private readonly prisma: PrismaService) {}

  async findAvailability(query: AvailabilityQueryDto) {
    if (query.to <= query.from) {
      throw new BadRequestException("Availability end must be after start.");
    }

    const shopperProfile = await this.prisma.shopperProfile.findUnique({
      select: { id: true },
      where: { id: query.shopperProfileId }
    });

    if (!shopperProfile) {
      throw new NotFoundException("Shopper profile not found.");
    }

    const [availabilitySlots, acceptedBookings] = await Promise.all([
      this.prisma.availabilitySlot.findMany({
        orderBy: { startsAt: "asc" },
        where: {
          OR: [
            {
              endsAt: { gt: query.from },
              isRecurring: false,
              startsAt: { lt: query.to }
            },
            {
              isRecurring: true,
              startsAt: { lt: query.to }
            }
          ],
          shopperProfileId: query.shopperProfileId
        }
      }),
      this.prisma.booking.findMany({
        orderBy: { scheduledStartAt: "asc" },
        where: {
          scheduledEndAt: { gt: query.from },
          scheduledStartAt: { lt: query.to },
          shopperProfileId: query.shopperProfileId,
          status: BookingStatus.ACCEPTED
        }
      })
    ]);
    const materializedSlots = this.materializeAvailabilitySlots(availabilitySlots, query.from, query.to);

    return {
      acceptedBookings: acceptedBookings.map((booking) => this.toBookingWindow(booking)),
      availableSlots: this.buildAvailableWindows(materializedSlots, acceptedBookings, query.from, query.to),
      from: query.from,
      shopperProfileId: query.shopperProfileId,
      slots: materializedSlots,
      to: query.to
    };
  }

  private buildAvailableWindows(
    slots: TimeWindow[],
    acceptedBookings: Booking[],
    rangeStart: Date,
    rangeEnd: Date
  ) {
    const blocks = acceptedBookings.map((booking) => ({
      endsAt: booking.scheduledEndAt,
      startsAt: booking.scheduledStartAt
    }));

    return slots.flatMap((slot) => {
      const initialWindow = {
        endsAt: minDate(slot.endsAt, rangeEnd),
        startsAt: maxDate(slot.startsAt, rangeStart)
      };

      if (initialWindow.endsAt <= initialWindow.startsAt) {
        return [];
      }

      return this.subtractBlocks(initialWindow, blocks);
    });
  }

  private materializeAvailabilitySlots(slots: AvailabilitySlot[], rangeStart: Date, rangeEnd: Date) {
    return slots.flatMap((slot) => {
      if (!slot.isRecurring) {
        if (slot.endsAt <= rangeStart || slot.startsAt >= rangeEnd) {
          return [];
        }

        return [
          {
            endsAt: slot.endsAt,
            id: slot.id,
            isRecurring: false,
            recurrenceRule: slot.recurrenceRule,
            sourceSlotId: slot.id,
            startsAt: slot.startsAt,
            timezone: slot.timezone
          }
        ];
      }

      return this.materializeRecurringSlot(slot, rangeStart, rangeEnd);
    });
  }

  private materializeRecurringSlot(slot: AvailabilitySlot, rangeStart: Date, rangeEnd: Date) {
    const rule = this.parseRecurrenceRule(slot.recurrenceRule);

    if (!rule.freq) {
      if (slot.endsAt <= rangeStart || slot.startsAt >= rangeEnd) {
        return [];
      }

      return [
        {
          endsAt: slot.endsAt,
          id: slot.id,
          isRecurring: true,
          recurrenceRule: slot.recurrenceRule,
          sourceSlotId: slot.id,
          startsAt: slot.startsAt,
          timezone: slot.timezone
        }
      ];
    }

    const durationMs = slot.endsAt.getTime() - slot.startsAt.getTime();
    const searchEnd = rule.until && rule.until < rangeEnd ? rule.until : rangeEnd;
    const windows: MaterializedAvailabilitySlot[] = [];
    let occurrenceCount = 0;

    for (
      let day = startOfUtcDay(slot.startsAt), iterations = 0;
      day < searchEnd && iterations < 1000;
      day = addUtcDays(day, 1), iterations += 1
    ) {
      const startsAt = copyUtcTime(day, slot.startsAt);

      if (startsAt < slot.startsAt) {
        continue;
      }

      if (!this.matchesRecurrenceDay(startsAt, slot.startsAt, rule)) {
        continue;
      }

      occurrenceCount += 1;

      if (rule.count && occurrenceCount > rule.count) {
        break;
      }

      const endsAt = new Date(startsAt.getTime() + durationMs);

      if (endsAt <= rangeStart || startsAt >= rangeEnd) {
        continue;
      }

      windows.push({
        endsAt,
        id: `${slot.id}:${startsAt.toISOString()}`,
        isRecurring: true,
        recurrenceRule: slot.recurrenceRule,
        sourceSlotId: slot.id,
        startsAt,
        timezone: slot.timezone
      });
    }

    return windows;
  }

  private parseRecurrenceRule(recurrenceRule?: string | null): ParsedRecurrenceRule {
    const parsed: ParsedRecurrenceRule = { interval: 1 };

    if (!recurrenceRule) {
      return parsed;
    }

    for (const part of recurrenceRule.split(";")) {
      const [rawKey, rawValue] = part.split("=");
      const key = rawKey?.trim().toUpperCase();
      const value = rawValue?.trim().toUpperCase();

      if (!key || !value) {
        continue;
      }

      if (key === "FREQ" && (value === "DAILY" || value === "WEEKLY")) {
        parsed.freq = value;
      }

      if (key === "INTERVAL") {
        const interval = Number(value);
        parsed.interval = Number.isInteger(interval) && interval > 0 ? interval : 1;
      }

      if (key === "BYDAY") {
        parsed.byDays = value
          .split(",")
          .map((day) => WEEKDAY_TO_UTC_DAY[day])
          .filter((day): day is number => day !== undefined);
      }

      if (key === "COUNT") {
        const count = Number(value);
        parsed.count = Number.isInteger(count) && count > 0 ? count : undefined;
      }

      if (key === "UNTIL") {
        const until = parseUntilDate(value);
        parsed.until = until;
      }
    }

    return parsed;
  }

  private matchesRecurrenceDay(startsAt: Date, anchorStartsAt: Date, rule: ParsedRecurrenceRule) {
    if (rule.freq === "DAILY") {
      const dayDiff = diffUtcDays(startOfUtcDay(anchorStartsAt), startOfUtcDay(startsAt));
      return dayDiff >= 0 && dayDiff % rule.interval === 0;
    }

    if (rule.freq === "WEEKLY") {
      const byDays = rule.byDays?.length ? rule.byDays : [anchorStartsAt.getUTCDay()];

      if (!byDays.includes(startsAt.getUTCDay())) {
        return false;
      }

      const weekDiff = Math.floor(diffUtcDays(startOfUtcDay(anchorStartsAt), startOfUtcDay(startsAt)) / 7);
      return weekDiff >= 0 && weekDiff % rule.interval === 0;
    }

    return false;
  }

  private subtractBlocks(window: TimeWindow, blocks: TimeWindow[]) {
    return blocks.reduce<TimeWindow[]>((openWindows, block) => {
      return openWindows.flatMap((openWindow) => this.subtractBlock(openWindow, block));
    }, [window]);
  }

  private subtractBlock(window: TimeWindow, block: TimeWindow) {
    if (block.endsAt <= window.startsAt || block.startsAt >= window.endsAt) {
      return [window];
    }

    const windows: TimeWindow[] = [];

    if (block.startsAt > window.startsAt) {
      windows.push({
        endsAt: minDate(block.startsAt, window.endsAt),
        startsAt: window.startsAt
      });
    }

    if (block.endsAt < window.endsAt) {
      windows.push({
        endsAt: window.endsAt,
        startsAt: maxDate(block.endsAt, window.startsAt)
      });
    }

    return windows;
  }

  private toBookingWindow(booking: Booking) {
    return {
      bookingId: booking.id,
      endsAt: booking.scheduledEndAt,
      startsAt: booking.scheduledStartAt
    };
  }
}

const maxDate = (a: Date, b: Date) => (a > b ? a : b);
const minDate = (a: Date, b: Date) => (a < b ? a : b);

const WEEKDAY_TO_UTC_DAY: Record<string, number> = {
  FR: 5,
  MO: 1,
  SA: 6,
  SU: 0,
  TH: 4,
  TU: 2,
  WE: 3
};

const addUtcDays = (date: Date, days: number) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + days));

const copyUtcTime = (date: Date, timeSource: Date) =>
  new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      timeSource.getUTCHours(),
      timeSource.getUTCMinutes(),
      timeSource.getUTCSeconds(),
      timeSource.getUTCMilliseconds()
    )
  );

const diffUtcDays = (start: Date, end: Date) =>
  Math.floor((startOfUtcDay(end).getTime() - startOfUtcDay(start).getTime()) / 86_400_000);

const parseUntilDate = (value: string) => {
  const compactMatch = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})Z?)?$/.exec(value);

  if (compactMatch) {
    const [, year, month, day, hour = "23", minute = "59", second = "59"] = compactMatch;
    return new Date(
      Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second))
    );
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

const startOfUtcDay = (date: Date) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
