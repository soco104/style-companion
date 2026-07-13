import { ForbiddenException } from "@nestjs/common";

import { ShopperPricingPackagesService } from "./shopper-pricing-packages.service";

const createPrismaMock = () => ({
  shopperPricingPackage: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn()
  },
  shopperProfile: {
    findUnique: jest.fn()
  }
});

describe("ShopperPricingPackagesService", () => {
  it("prevents shoppers from creating packages for another shopper profile", async () => {
    const prisma = createPrismaMock();
    prisma.shopperProfile.findUnique.mockResolvedValue({ userId: "shopper-user-1" });
    const service = new ShopperPricingPackagesService(prisma as never);

    await expect(
      service.create("shopper-profile-1", "other-user", {
        pricePerSessionCents: 8500,
        sessionCount: 2,
        title: "Closet Refresh",
        totalPriceCents: 17000
      })
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.shopperPricingPackage.create).not.toHaveBeenCalled();
  });
});
