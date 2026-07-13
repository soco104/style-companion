import { BadRequestException, NotFoundException } from "@nestjs/common";
import { BookingStatus } from "@prisma/client";

import { BookingsService } from "./bookings.service";

const createPrismaMock = () => ({
  booking: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn()
  },
  customerProfile: {
    findUnique: jest.fn()
  },
  shopperProfile: {
    findUnique: jest.fn()
  },
  shopperPricingPackage: {
    findUnique: jest.fn()
  }
});

describe("BookingsService", () => {
  it("rejects booking requests with an invalid schedule", async () => {
    const prisma = createPrismaMock();
    const service = new BookingsService(prisma as never);

    await expect(
      service.create({
        city: "Nashville",
        customerProfileId: "customer-profile-1",
        goal: "Build work outfits.",
        scheduledEndAt: new Date("2026-08-01T15:00:00.000Z"),
        scheduledStartAt: new Date("2026-08-01T16:00:00.000Z"),
        shopperProfileId: "shopper-profile-1",
        state: "TN",
        timezone: "America/Chicago",
        totalPriceCents: 17000
      })
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("rejects customers booking their own shopper profile", async () => {
    const prisma = createPrismaMock();
    prisma.customerProfile.findUnique.mockResolvedValue({ id: "customer-profile-1", userId: "user-1" });
    prisma.shopperProfile.findUnique.mockResolvedValue({
      id: "shopper-profile-1",
      isActive: true,
      userId: "user-1"
    });
    const service = new BookingsService(prisma as never);

    await expect(
      service.create({
        city: "Nashville",
        customerProfileId: "customer-profile-1",
        goal: "Build work outfits.",
        scheduledEndAt: new Date("2026-08-01T17:00:00.000Z"),
        scheduledStartAt: new Date("2026-08-01T15:00:00.000Z"),
        shopperProfileId: "shopper-profile-1",
        state: "TN",
        timezone: "America/Chicago",
        totalPriceCents: 17000
      })
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("accepts only requested bookings", async () => {
    const prisma = createPrismaMock();
    prisma.booking.findUnique.mockResolvedValue({ id: "booking-1", status: BookingStatus.CANCELLED });
    const service = new BookingsService(prisma as never);

    await expect(service.accept("booking-1", {})).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.booking.update).not.toHaveBeenCalled();
  });

  it("completes accepted bookings and records status history", async () => {
    const prisma = createPrismaMock();
    prisma.booking.findUnique.mockResolvedValue({
      customerProfileId: "customer-profile-1",
      id: "booking-1",
      scheduledEndAt: new Date("2026-08-01T17:00:00.000Z"),
      scheduledStartAt: new Date("2026-08-01T15:00:00.000Z"),
      shopperProfileId: "shopper-profile-1",
      status: BookingStatus.ACCEPTED
    });
    prisma.booking.update.mockResolvedValue({ id: "booking-1", status: BookingStatus.COMPLETED });
    const service = new BookingsService(prisma as never);

    await expect(
      service.complete("booking-1", {
        changedByUserId: "shopper-user-1",
        reason: "Session finished"
      })
    ).resolves.toEqual({ id: "booking-1", status: BookingStatus.COMPLETED });

    expect(prisma.booking.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          completedAt: expect.any(Date),
          status: BookingStatus.COMPLETED,
          statusHistory: {
            create: {
              changedByUserId: "shopper-user-1",
              reason: "Session finished",
              status: BookingStatus.COMPLETED
            }
          }
        }),
        where: { id: "booking-1" }
      })
    );
  });

  it("throws when transitioning a missing booking", async () => {
    const prisma = createPrismaMock();
    prisma.booking.findUnique.mockResolvedValue(null);
    const service = new BookingsService(prisma as never);

    await expect(service.accept("missing", {})).rejects.toBeInstanceOf(NotFoundException);
  });

  it("prevents requesting a booking outside shopper availability", async () => {
    const prisma = createPrismaMock();
    prisma.customerProfile.findUnique.mockResolvedValue({ id: "customer-profile-1", userId: "customer-user-1" });
    prisma.shopperProfile.findUnique.mockResolvedValue({
      availability: [],
      id: "shopper-profile-1",
      isActive: true,
      userId: "shopper-user-1"
    });
    const service = new BookingsService(prisma as never);

    await expect(
      service.create({
        city: "Nashville",
        customerProfileId: "customer-profile-1",
        goal: "Build work outfits.",
        scheduledEndAt: new Date("2026-08-01T17:00:00.000Z"),
        scheduledStartAt: new Date("2026-08-01T15:00:00.000Z"),
        shopperProfileId: "shopper-profile-1",
        state: "TN",
        timezone: "America/Chicago",
        totalPriceCents: 17000
      })
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("prevents requested bookings that overlap an accepted shopper booking", async () => {
    const prisma = createPrismaMock();
    prisma.customerProfile.findUnique.mockResolvedValue({ id: "customer-profile-1", userId: "customer-user-1" });
    prisma.shopperProfile.findUnique.mockResolvedValue({
      availability: [
        {
          endsAt: new Date("2026-08-01T20:00:00.000Z"),
          startsAt: new Date("2026-08-01T14:00:00.000Z")
        }
      ],
      id: "shopper-profile-1",
      isActive: true,
      userId: "shopper-user-1"
    });
    prisma.booking.findFirst.mockResolvedValueOnce({ id: "accepted-shopper-conflict" }).mockResolvedValueOnce(null);
    const service = new BookingsService(prisma as never);

    await expect(
      service.create({
        city: "Nashville",
        customerProfileId: "customer-profile-1",
        goal: "Build work outfits.",
        scheduledEndAt: new Date("2026-08-01T17:00:00.000Z"),
        scheduledStartAt: new Date("2026-08-01T15:00:00.000Z"),
        shopperProfileId: "shopper-profile-1",
        state: "TN",
        timezone: "America/Chicago",
        totalPriceCents: 17000
      })
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.booking.create).not.toHaveBeenCalled();
  });

  it("rejects inactive pricing packages", async () => {
    const prisma = createPrismaMock();
    prisma.customerProfile.findUnique.mockResolvedValue({ id: "customer-profile-1", userId: "customer-user-1" });
    prisma.shopperProfile.findUnique.mockResolvedValue({
      availability: [
        {
          endsAt: new Date("2026-08-01T20:00:00.000Z"),
          startsAt: new Date("2026-08-01T14:00:00.000Z")
        }
      ],
      id: "shopper-profile-1",
      isActive: true,
      userId: "shopper-user-1"
    });
    prisma.shopperPricingPackage.findUnique.mockResolvedValue({
      id: "package-1",
      isActive: false,
      shopperProfileId: "shopper-profile-1"
    });
    const service = new BookingsService(prisma as never);

    await expect(
      service.create({
        city: "Nashville",
        customerProfileId: "customer-profile-1",
        goal: "Build work outfits.",
        pricingPackageId: "package-1",
        scheduledEndAt: new Date("2026-08-01T17:00:00.000Z"),
        scheduledStartAt: new Date("2026-08-01T15:00:00.000Z"),
        shopperProfileId: "shopper-profile-1",
        state: "TN",
        timezone: "America/Chicago"
      })
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.booking.create).not.toHaveBeenCalled();
  });

  it("uses selected active package pricing when creating a booking", async () => {
    const prisma = createPrismaMock();
    prisma.customerProfile.findUnique.mockResolvedValue({ id: "customer-profile-1", userId: "customer-user-1" });
    prisma.shopperProfile.findUnique.mockResolvedValue({
      availability: [
        {
          endsAt: new Date("2026-08-01T20:00:00.000Z"),
          startsAt: new Date("2026-08-01T14:00:00.000Z")
        }
      ],
      id: "shopper-profile-1",
      isActive: true,
      userId: "shopper-user-1"
    });
    prisma.shopperPricingPackage.findUnique.mockResolvedValue({
      id: "package-1",
      isActive: true,
      shopperProfileId: "shopper-profile-1",
      totalPriceCents: 17000
    });
    prisma.booking.findFirst.mockResolvedValue(null);
    prisma.booking.create.mockResolvedValue({ id: "booking-1", pricingPackageId: "package-1", totalPriceCents: 17000 });
    const service = new BookingsService(prisma as never);

    await expect(
      service.create({
        city: "Nashville",
        customerProfileId: "customer-profile-1",
        goal: "Build work outfits.",
        pricingPackageId: "package-1",
        scheduledEndAt: new Date("2026-08-01T17:00:00.000Z"),
        scheduledStartAt: new Date("2026-08-01T15:00:00.000Z"),
        shopperProfileId: "shopper-profile-1",
        state: "TN",
        timezone: "America/Chicago",
        totalPriceCents: 99999
      })
    ).resolves.toEqual({ id: "booking-1", pricingPackageId: "package-1", totalPriceCents: 17000 });
    expect(prisma.booking.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          pricingPackageId: "package-1",
          totalPriceCents: 17000
        })
      })
    );
  });

  it("prevents accepting a requested booking when the shopper is already reserved", async () => {
    const prisma = createPrismaMock();
    prisma.booking.findUnique.mockResolvedValue({
      customerProfileId: "customer-profile-1",
      id: "booking-1",
      scheduledEndAt: new Date("2026-08-01T17:00:00.000Z"),
      scheduledStartAt: new Date("2026-08-01T15:00:00.000Z"),
      shopperProfileId: "shopper-profile-1",
      status: BookingStatus.REQUESTED
    });
    prisma.booking.findFirst.mockResolvedValueOnce({ id: "accepted-shopper-conflict" }).mockResolvedValueOnce(null);
    const service = new BookingsService(prisma as never);

    await expect(service.accept("booking-1", { changedByUserId: "shopper-user-1" })).rejects.toBeInstanceOf(
      BadRequestException
    );
    expect(prisma.booking.update).not.toHaveBeenCalled();
  });

  it("accepts requested bookings and writes reservation status history when no overlap exists", async () => {
    const prisma = createPrismaMock();
    prisma.booking.findUnique.mockResolvedValue({
      customerProfileId: "customer-profile-1",
      id: "booking-1",
      scheduledEndAt: new Date("2026-08-01T17:00:00.000Z"),
      scheduledStartAt: new Date("2026-08-01T15:00:00.000Z"),
      shopperProfileId: "shopper-profile-1",
      status: BookingStatus.REQUESTED
    });
    prisma.booking.findFirst.mockResolvedValue(null);
    prisma.booking.update.mockResolvedValue({ id: "booking-1", status: BookingStatus.ACCEPTED });
    const service = new BookingsService(prisma as never);

    await expect(service.accept("booking-1", { changedByUserId: "shopper-user-1" })).resolves.toEqual({
      id: "booking-1",
      status: BookingStatus.ACCEPTED
    });
    expect(prisma.booking.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: BookingStatus.ACCEPTED,
          statusHistory: {
            create: {
              changedByUserId: "shopper-user-1",
              reason: undefined,
              status: BookingStatus.ACCEPTED
            }
          }
        })
      })
    );
  });
});
