import { MatchingService } from "./matching.service";

const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24);

const createPrismaMock = () => ({
  customerProfile: {
    findUnique: jest.fn()
  },
  shopperProfile: {
    findMany: jest.fn()
  }
});

const shopper = (overrides: Record<string, unknown>) => ({
  availability: [],
  averageRating: 4.5,
  bio: "General personal styling help.",
  city: "Nashville",
  createdAt: new Date(),
  currency: "USD",
  headline: "Personal styling",
  hourlyRateCents: 9000,
  id: "shopper",
  isActive: true,
  reviewCount: 10,
  serviceRadiusMiles: 15,
  specialties: [],
  state: "TN",
  updatedAt: new Date(),
  user: {
    email: "shopper@example.test",
    id: "user",
    name: "Shopper"
  },
  userId: "user",
  ...overrides
});

describe("MatchingService", () => {
  it("ranks shoppers by deterministic weighted match score with explanations", async () => {
    const prisma = createPrismaMock();
    prisma.shopperProfile.findMany.mockResolvedValue([
      shopper({
        availability: [{ isRecurring: false, startsAt: futureDate }],
        averageRating: 4.8,
        bio: "Workwear capsule shopping for polished office outfits.",
        headline: "Capsule workwear guide",
        hourlyRateCents: 8500,
        id: "best",
        reviewCount: 40,
        specialties: [
          { name: "Workwear" },
          { name: "Capsule Wardrobes" }
        ],
        user: { id: "best-user", name: "Best Match" }
      }),
      shopper({
        availability: [{ isRecurring: false, startsAt: futureDate }],
        averageRating: 5,
        bio: "High-rated closet support.",
        headline: "Closet edit expert",
        hourlyRateCents: 7000,
        id: "rating-only",
        reviewCount: 80,
        specialties: [{ name: "Closet Edits" }],
        user: { id: "rating-user", name: "Rating Only" }
      }),
      shopper({
        averageRating: 4.9,
        bio: "Great workwear support, but far away and unavailable.",
        city: "Atlanta",
        headline: "Workwear stylist",
        hourlyRateCents: 8500,
        id: "far",
        reviewCount: 60,
        specialties: [{ name: "Workwear" }],
        state: "GA",
        user: { id: "far-user", name: "Far Match" }
      })
    ]);

    const service = new MatchingService(prisma as never);

    const results = await service.findShoppers({
      budgetMaxCents: 20000,
      city: "Nashville",
      specialty: "Workwear",
      state: "TN",
      styleGoals: "capsule work outfits",
      take: 10
    });

    expect(results).toHaveLength(3);
    const [best, ratingOnly, far] = results;

    expect(results.map((result) => result.id)).toEqual(["best", "rating-only", "far"]);
    expect(best?.matchScore).toBeGreaterThan(ratingOnly?.matchScore ?? 0);
    expect(ratingOnly?.matchScore).toBeGreaterThan(far?.matchScore ?? 0);
    expect(best?.explanation).toEqual(
      expect.arrayContaining([
        expect.stringContaining("Distance: Nashville, TN matches"),
        expect.stringContaining("Specialty: matched"),
        expect.stringContaining("Availability: has upcoming availability"),
        expect.stringContaining("Budget: estimated two-hour session fits budget")
      ])
    );
  });

  it("derives customer location, budget, and style goals from the latest style quiz", async () => {
    const prisma = createPrismaMock();
    prisma.customerProfile.findUnique.mockResolvedValue({
      city: "Nashville",
      id: "customer-profile-1",
      state: "TN",
      styleQuizResponses: [
        {
          additionalNotes: "Needs work outfits with petite fit.",
          budgetMaxCents: 18000,
          preferredOccasions: ["work"],
          styleGoals: {
            priorities: ["capsule wardrobe"]
          }
        }
      ]
    });
    prisma.shopperProfile.findMany.mockResolvedValue([
      shopper({
        availability: [{ isRecurring: false, startsAt: futureDate }],
        bio: "Capsule wardrobe and petite workwear help.",
        headline: "Petite workwear capsule guide",
        hourlyRateCents: 8500,
        id: "quiz-match",
        specialties: [{ name: "Capsule Wardrobes" }, { name: "Petite Fit" }],
        user: { id: "quiz-user", name: "Quiz Match" }
      })
    ]);

    const service = new MatchingService(prisma as never);

    const results = await service.findShoppers({
      customerProfileId: "customer-profile-1",
      take: 5
    });

    expect(prisma.customerProfile.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "customer-profile-1" }
      })
    );
    expect(results).toHaveLength(1);
    const [result] = results;

    expect(result).toEqual(
      expect.objectContaining({
        id: "quiz-match",
        matchScore: expect.any(Number)
      })
    );
    expect(result?.explanation.join(" ")).toContain("matched");
  });
});
