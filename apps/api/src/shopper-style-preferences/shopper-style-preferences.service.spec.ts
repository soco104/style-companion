import { ForbiddenException } from "@nestjs/common";

import { ShopperStylePreferencesService } from "./shopper-style-preferences.service";

const createPrismaMock = () => ({
  shopperProfile: {
    findUnique: jest.fn()
  },
  shopperStylePreference: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn()
  }
});

describe("ShopperStylePreferencesService", () => {
  it("prevents shoppers from creating style preferences for another shopper profile", async () => {
    const prisma = createPrismaMock();
    prisma.shopperProfile.findUnique.mockResolvedValue({ userId: "shopper-user-1" });
    const service = new ShopperStylePreferencesService(prisma as never);

    await expect(
      service.create("shopper-profile-1", "other-user", {
        styleTags: ["tailored"]
      })
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.shopperStylePreference.create).not.toHaveBeenCalled();
  });
});
