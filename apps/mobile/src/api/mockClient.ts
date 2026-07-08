import type {
  BookingInput,
  CustomerProfileInput,
  ReviewInput,
  ReviewResponseInput,
  SafetyReportInput,
  ShopperMatch,
  ShopperProfileInput,
  StyleQuizInput
} from "@style-companion/shared";

import type { CustomerProfile, MobileApiClient, Session, ShopperProfile } from "./types";

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

const matches: ShopperMatch[] = [
  {
    averageRating: 4.9,
    bio: "I help clients build repeatable outfits for work, weekends, and events.",
    city: "Nashville",
    headline: "Capsule wardrobe coach for busy weeks",
    hourlyRateCents: 8500,
    id: "shopper-1",
    explanation: [
      "Distance: Nashville, TN matches the customer location",
      "Specialty: matched workwear and capsule wardrobe",
      "Availability: has upcoming availability"
    ],
    matchScore: 94,
    name: "Jordan Style",
    reviewCount: 42,
    specialties: ["Workwear", "Capsule wardrobes", "In-person shopping"],
    state: "TN"
  },
  {
    averageRating: 4.8,
    bio: "Warm, practical shopping support with an eye for fit and comfort.",
    city: "Nashville",
    headline: "Everyday polish without overbuying",
    hourlyRateCents: 7000,
    id: "shopper-2",
    explanation: [
      "Distance: Nashville, TN matches the customer location",
      "Specialty: matched budget styling",
      "Availability: has upcoming availability"
    ],
    matchScore: 86,
    name: "Sam Rivera",
    reviewCount: 31,
    specialties: ["Closet edits", "Budget styling", "Petite fit"],
    state: "TN"
  },
  {
    averageRating: 4.7,
    bio: "Personal shopping sessions for events, travel wardrobes, and confidence resets.",
    city: "Franklin",
    headline: "Occasion outfits that still feel like you",
    hourlyRateCents: 9500,
    id: "shopper-3",
    explanation: [
      "Distance: Franklin, TN is in the same state",
      "Specialty: matched events and travel capsules",
      "Availability: has upcoming availability"
    ],
    matchScore: 76,
    name: "Lee Morgan",
    reviewCount: 25,
    specialties: ["Events", "Travel capsules", "Color pairing"],
    state: "TN"
  }
];

export const mockClient: MobileApiClient = {
  async createBooking(input: BookingInput) {
    await delay();
    const shopper = matches.find((match) => match.id === input.shopperProfileId);

    return {
      id: `booking-${Date.now()}`,
      locationName: input.locationName,
      scheduledStartAt: input.scheduledStartAt,
      shopperName: shopper?.name ?? "Style guide",
      status: "REQUESTED",
      totalPriceCents: input.totalPriceCents
    };
  },
  async createCustomerProfile(input: CustomerProfileInput): Promise<CustomerProfile> {
    await delay();
    return {
      ...input,
      id: "customer-profile-demo"
    };
  },
  async createReview(_bookingId: string, _input: ReviewInput) {
    await delay();
    return { id: `review-${Date.now()}` };
  },
  async createReviewResponse(_reviewId: string, _input: ReviewResponseInput) {
    await delay();
    return { id: `review-response-${Date.now()}` };
  },
  async createSafetyReport(_input: SafetyReportInput) {
    await delay();
    return { id: `safety-report-${Date.now()}` };
  },
  async createShopperProfile(input: ShopperProfileInput): Promise<ShopperProfile> {
    await delay();
    return {
      ...input,
      id: "shopper-profile-demo"
    };
  },
  async createStyleQuiz(_input: StyleQuizInput) {
    await delay();
    return { id: "style-quiz-demo" };
  },
  async devLogin(email: string): Promise<Session> {
    await delay();
    return {
      token: "mock-token",
      user: {
        email,
        id: "user-demo",
        name: email.split("@")[0] || "Style Companion user"
      }
    };
  },
  async getShopperMatches(_customerProfileId: string) {
    await delay();
    return matches;
  }
};
