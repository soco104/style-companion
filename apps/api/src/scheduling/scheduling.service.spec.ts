import { SchedulingService } from "./scheduling.service";

const createPrismaMock = () => ({
  availabilitySlot: {
    findMany: jest.fn()
  },
  booking: {
    findMany: jest.fn()
  },
  shopperProfile: {
    findUnique: jest.fn()
  }
});

describe("SchedulingService", () => {
  it("subtracts accepted bookings from shopper availability windows", async () => {
    const prisma = createPrismaMock();
    prisma.shopperProfile.findUnique.mockResolvedValue({ id: "shopper-profile-1" });
    prisma.availabilitySlot.findMany.mockResolvedValue([
      {
        endsAt: new Date("2026-08-01T20:00:00.000Z"),
        id: "slot-1",
        isRecurring: false,
        recurrenceRule: null,
        startsAt: new Date("2026-08-01T14:00:00.000Z")
      }
    ]);
    prisma.booking.findMany.mockResolvedValue([
      {
        id: "booking-1",
        scheduledEndAt: new Date("2026-08-01T17:00:00.000Z"),
        scheduledStartAt: new Date("2026-08-01T15:00:00.000Z")
      }
    ]);
    const service = new SchedulingService(prisma as never);

    await expect(
      service.findAvailability({
        from: new Date("2026-08-01T00:00:00.000Z"),
        shopperProfileId: "shopper-profile-1",
        to: new Date("2026-08-02T00:00:00.000Z")
      })
    ).resolves.toEqual(
      expect.objectContaining({
        availableSlots: [
          expect.objectContaining({
            endsAt: new Date("2026-08-01T15:00:00.000Z"),
            startsAt: new Date("2026-08-01T14:00:00.000Z")
          }),
          expect.objectContaining({
            endsAt: new Date("2026-08-01T20:00:00.000Z"),
            startsAt: new Date("2026-08-01T17:00:00.000Z")
          })
        ]
      })
    );
  });

  it("materializes weekly recurring availability and subtracts accepted bookings", async () => {
    const prisma = createPrismaMock();
    prisma.shopperProfile.findUnique.mockResolvedValue({ id: "shopper-profile-1" });
    prisma.availabilitySlot.findMany.mockResolvedValue([
      {
        endsAt: new Date("2026-07-27T17:00:00.000Z"),
        id: "recurring-slot-1",
        isRecurring: true,
        recurrenceRule: "FREQ=WEEKLY;BYDAY=MO;INTERVAL=1",
        startsAt: new Date("2026-07-27T14:00:00.000Z"),
        timezone: "America/Chicago"
      }
    ]);
    prisma.booking.findMany.mockResolvedValue([
      {
        id: "booking-1",
        scheduledEndAt: new Date("2026-08-03T16:00:00.000Z"),
        scheduledStartAt: new Date("2026-08-03T15:00:00.000Z")
      }
    ]);
    const service = new SchedulingService(prisma as never);

    await expect(
      service.findAvailability({
        from: new Date("2026-08-03T00:00:00.000Z"),
        shopperProfileId: "shopper-profile-1",
        to: new Date("2026-08-04T00:00:00.000Z")
      })
    ).resolves.toEqual(
      expect.objectContaining({
        availableSlots: [
          expect.objectContaining({
            endsAt: new Date("2026-08-03T15:00:00.000Z"),
            startsAt: new Date("2026-08-03T14:00:00.000Z")
          }),
          expect.objectContaining({
            endsAt: new Date("2026-08-03T17:00:00.000Z"),
            startsAt: new Date("2026-08-03T16:00:00.000Z")
          })
        ]
      })
    );
  });
});
