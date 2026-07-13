import type {
  AvailabilitySlot,
  AvailabilitySlotInput,
  BookingInput,
  CustomerProfileInput,
  ReviewInput,
  ReviewResponseInput,
  SafetyReportInput,
  SchedulingAvailability,
  ShopperMatch,
  ShopperMatchSearchInput,
  ShopperPricingPackage,
  ShopperPricingPackageInput,
  ShopperProfileInput,
  ShopperStylePreference,
  ShopperStylePreferenceInput,
  StyleQuizInput,
  WardrobePhoto,
  WardrobePhotoInput,
  WardrobePhotoUpdateInput
} from "@style-companion/shared";

import type { CustomerProfile, MobileApiClient, Session, ShopperProfile } from "./types";
import { getCurrentSession } from "./sessionStore";

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

const daysFromNowAt = (days: number, hour: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
};

const matches: ShopperMatch[] = [
  {
    averageRating: 4.9,
    bio: "I help clients build repeatable outfits for work, weekends, and events.",
    city: "Nashville",
    headline: "Capsule wardrobe coach for busy weeks",
    hourlyRateCents: 8500,
    id: "shopper-1",
    userId: "user-shopper-1",
    explanation: [
      "Distance: Nashville, TN matches the customer location",
      "Style fit: matched preferred styles capsule, workwear",
      "Specialty: matched workwear and capsule wardrobe",
      "Availability: has upcoming availability",
      "Scoring weights: distance 25%, specialty 20%, style fit 15%, availability 18%, rating 12%, budget 10%"
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
    userId: "user-shopper-2",
    explanation: [
      "Distance: Nashville, TN matches the customer location",
      "Style fit: matched preferred styles budget-conscious, casual",
      "Specialty: matched budget styling",
      "Availability: has upcoming availability",
      "Scoring weights: distance 25%, specialty 20%, style fit 15%, availability 18%, rating 12%, budget 10%"
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
    userId: "user-shopper-3",
    explanation: [
      "Distance: Franklin, TN is in the same state",
      "Style fit: matched preferred styles events, travel",
      "Specialty: matched events and travel capsules",
      "Availability: has upcoming availability",
      "Scoring weights: distance 25%, specialty 20%, style fit 15%, availability 18%, rating 12%, budget 10%"
    ],
    matchScore: 76,
    name: "Lee Morgan",
    reviewCount: 25,
    specialties: ["Events", "Travel capsules", "Color pairing"],
    state: "TN"
  }
];

const searchTerms = (value?: string) =>
  (value ?? "")
    .split(/[,;|/-]|\s+/)
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

const pricingPackages: Record<string, ShopperPricingPackage[]> = {
  "shopper-1": [
    {
      description: "Two focused sessions for closet editing and outfit planning.",
      id: "package-shopper-1-refresh",
      isActive: true,
      pricePerSessionCents: 8500,
      sessionCount: 2,
      shopperProfileId: "shopper-1",
      title: "Closet Refresh",
      totalPriceCents: 17000
    },
    {
      description: "A single guided shopping session for one wardrobe gap.",
      id: "package-shopper-1-single",
      isActive: true,
      pricePerSessionCents: 9500,
      sessionCount: 1,
      shopperProfileId: "shopper-1",
      title: "Single Shopping Session",
      totalPriceCents: 9500
    }
  ],
  "shopper-2": [
    {
      description: "A practical closet review with outfit notes.",
      id: "package-shopper-2-audit",
      isActive: true,
      pricePerSessionCents: 7000,
      sessionCount: 1,
      shopperProfileId: "shopper-2",
      title: "Wardrobe Audit",
      totalPriceCents: 7000
    }
  ],
  "shopper-3": [
    {
      description: "Planning support for events, travel, or a confidence reset.",
      id: "package-shopper-3-event",
      isActive: true,
      pricePerSessionCents: 9500,
      sessionCount: 1,
      shopperProfileId: "shopper-3",
      title: "Occasion Session",
      totalPriceCents: 9500
    }
  ]
};

const stylePreferences: Record<string, ShopperStylePreference[]> = {
  "shopper-1": [
    {
      avoidedStyles: ["dry clean only", "uncomfortable heels"],
      id: "preference-shopper-1",
      notes: "Best for polished outfits with repeatable formulas.",
      preferredBrands: ["Madewell", "Everlane", "Quince"],
      shopperProfileId: "shopper-1",
      styleTags: ["tailored", "capsule", "workwear"]
    }
  ],
  "shopper-2": [
    {
      avoidedStyles: ["high maintenance fabrics"],
      id: "preference-shopper-2",
      notes: "Best for approachable outfit building from pieces clients already own.",
      preferredBrands: ["Target", "Old Navy", "Nordstrom Rack"],
      shopperProfileId: "shopper-2",
      styleTags: ["casual", "budget-conscious", "size-inclusive"]
    }
  ],
  "shopper-3": [
    {
      avoidedStyles: ["one-time novelty pieces"],
      id: "preference-shopper-3",
      notes: "Best for customers who need outfit confidence for a specific moment.",
      preferredBrands: ["Nordstrom", "Zara", "Anthropologie"],
      shopperProfileId: "shopper-3",
      styleTags: ["events", "travel", "color pairing"]
    }
  ]
};

const availabilitySlots: Record<string, AvailabilitySlot[]> = {
  "shopper-1": [
    {
      endsAt: daysFromNowAt(2, 12),
      id: "slot-shopper-1-a",
      isRecurring: false,
      shopperProfileId: "shopper-1",
      startsAt: daysFromNowAt(2, 10),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    },
    {
      endsAt: daysFromNowAt(4, 17),
      id: "slot-shopper-1-b",
      isRecurring: false,
      shopperProfileId: "shopper-1",
      startsAt: daysFromNowAt(4, 15),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }
  ],
  "shopper-2": [
    {
      endsAt: daysFromNowAt(3, 16),
      id: "slot-shopper-2-a",
      isRecurring: false,
      shopperProfileId: "shopper-2",
      startsAt: daysFromNowAt(3, 14),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }
  ],
  "shopper-3": [
    {
      endsAt: daysFromNowAt(5, 13),
      id: "slot-shopper-3-a",
      isRecurring: false,
      shopperProfileId: "shopper-3",
      startsAt: daysFromNowAt(5, 11),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }
  ]
};

const shopperProfiles: Record<string, ShopperProfile> = Object.fromEntries(
  matches.map((match) => [
    match.id,
    {
      bio: match.bio,
      city: match.city,
      headline: match.headline,
      hourlyRateCents: match.hourlyRateCents,
      id: match.id,
      serviceRadiusMiles: 20,
      state: match.state,
      userId: `user-${match.id}`
    }
  ])
);

const wardrobePhotos: WardrobePhoto[] = [
  {
    bookingId: "booking-demo",
    caption: "Current navy blazer that needs outfit ideas.",
    category: "outerwear",
    id: "wardrobe-customer-blazer",
    metadata: { source: "mock-placeholder" },
    storageKey: "mock/wardrobe/customer-blazer.jpg",
    tags: ["blazer", "navy", "workwear"],
    title: "Navy blazer",
    uploadedByRole: "CUSTOMER",
    url: "https://example.test/media/wardrobe/customer-blazer.jpg",
    userId: "user-demo",
    visibility: "BOOKING_SHARED"
  },
  {
    caption: "Public portfolio board for shopper detail screens.",
    category: "portfolio",
    id: "wardrobe-shopper-board",
    metadata: { source: "mock-placeholder" },
    storageKey: "mock/wardrobe/shopper-board.jpg",
    tags: ["portfolio", "capsule"],
    title: "Capsule board",
    uploadedByRole: "SHOPPER",
    url: "https://example.test/media/wardrobe/shopper-board.jpg",
    userId: "user-shopper-1",
    visibility: "PUBLIC_PROFILE"
  }
];

export const mockClient: MobileApiClient = {
  async addAvailabilitySlot(shopperProfileId: string, input: AvailabilitySlotInput) {
    await delay();
    const slot: AvailabilitySlot = {
      ...input,
      id: `slot-${Date.now()}`
    };
    availabilitySlots[shopperProfileId] = [...(availabilitySlots[shopperProfileId] ?? []), slot];
    return slot;
  },
  async createBooking(input: BookingInput) {
    await delay();
    const shopper = matches.find((match) => match.id === input.shopperProfileId);
    const start = input.scheduledStartAt ?? input.scheduledStart;
    const end = input.scheduledEndAt ?? input.scheduledEnd;
    const shopperSlots = availabilitySlots[input.shopperProfileId] ?? [];
    const matchingSlot = shopperSlots.find((slot) => slot.startsAt === start && slot.endsAt === end);

    if (!start || !end || !matchingSlot) {
      throw new Error("Selected slot is no longer available.");
    }

    availabilitySlots[input.shopperProfileId] = shopperSlots.filter((slot) => slot.id !== matchingSlot.id);

    return {
      id: `booking-${Date.now()}`,
      locationName: input.locationName,
      pricingPackageId: input.pricingPackageId,
      scheduledStartAt: start,
      shopperName: shopper?.name ?? "Style guide",
      status: "REQUESTED",
      totalPriceCents: input.totalPriceCents ?? (shopper?.hourlyRateCents ?? 0) * 2
    };
  },
  async createCustomerProfile(input: CustomerProfileInput): Promise<CustomerProfile> {
    await delay();
    return {
      ...input,
      id: "customer-profile-demo"
    };
  },
  async createPricingPackage(shopperProfileId: string, input: ShopperPricingPackageInput) {
    await delay();
    const pricingPackage: ShopperPricingPackage = {
      ...input,
      id: `package-${Date.now()}`,
      isActive: input.isActive ?? true,
      shopperProfileId
    };
    pricingPackages[shopperProfileId] = [...(pricingPackages[shopperProfileId] ?? []), pricingPackage];
    return pricingPackage;
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
    const profile = {
      ...input,
      id: "shopper-profile-demo"
    };
    shopperProfiles[profile.id] = profile;
    return profile;
  },
  async createShopperStylePreference(shopperProfileId: string, input: ShopperStylePreferenceInput) {
    await delay();
    const preference: ShopperStylePreference = {
      avoidedStyles: input.avoidedStyles ?? [],
      id: `preference-${Date.now()}`,
      notes: input.notes,
      preferredBrands: input.preferredBrands ?? [],
      shopperProfileId,
      styleTags: input.styleTags
    };
    stylePreferences[shopperProfileId] = [...(stylePreferences[shopperProfileId] ?? []), preference];
    return preference;
  },
  async createStyleQuiz(_input: StyleQuizInput) {
    await delay();
    return { id: "style-quiz-demo" };
  },
  async createWardrobePhoto(input: WardrobePhotoInput) {
    await delay();
    const photo: WardrobePhoto = {
      bookingId: input.bookingId,
      caption: input.caption,
      category: input.category,
      id: `wardrobe-${Date.now()}`,
      metadata: input.metadata,
      storageKey: input.storageKey,
      tags: input.tags ?? [],
      title: input.title,
      uploadedByRole: input.uploadedByRole,
      url: input.url,
      userId: input.userId ?? input.uploadedByUserId ?? "user-demo",
      visibility: input.visibility ?? "PRIVATE"
    };
    wardrobePhotos.unshift(photo);
    return photo;
  },
  async deleteWardrobePhoto(photoId: string) {
    await delay();
    const index = wardrobePhotos.findIndex((photo) => photo.id === photoId);

    if (index < 0) {
      throw new Error("Wardrobe photo not found.");
    }

    const [deleted] = wardrobePhotos.splice(index, 1);
    return deleted;
  },
  async devLogin(email: string): Promise<Session> {
    await delay();
    return {
      token: `dev:${email.includes("shopper") ? "user-shopper-1" : "user-demo"}:${email}`,
      user: {
        customerProfile: email.includes("customer") ? { id: "customer-profile-demo" } : null,
        email,
        id: email.includes("shopper") ? "user-shopper-1" : "user-demo",
        name: email.split("@")[0] || "Style Companion user",
        role: email.includes("shopper") ? "SHOPPER" : "CUSTOMER",
        shopperProfile: email.includes("shopper") ? { headline: "Capsule wardrobe coach", id: "shopper-1" } : null
      }
    };
  },
  async getAvailability(shopperProfileId: string, from: string, to: string): Promise<SchedulingAvailability> {
    await delay();
    const fromTime = new Date(from).getTime();
    const toTime = new Date(to).getTime();
    const availableSlots = (availabilitySlots[shopperProfileId] ?? []).filter((slot) => {
      const slotStart = new Date(slot.startsAt).getTime();
      const slotEnd = new Date(slot.endsAt).getTime();
      return slotStart < toTime && slotEnd > fromTime;
    });

    return {
      acceptedBookings: [],
      availableSlots,
      from,
      shopperProfileId,
      slots: availableSlots,
      to
    };
  },
  async getPricingPackages(shopperProfileId: string) {
    await delay();
    return pricingPackages[shopperProfileId] ?? [];
  },
  async getCurrentShopperProfile() {
    await delay();
    const session = getCurrentSession();
    const shopperProfileId = session?.user.shopperProfile?.id ?? "shopper-1";
    const profile = shopperProfiles[shopperProfileId];

    if (!profile) {
      throw new Error("Shopper profile not found.");
    }

    return {
      ...profile,
      availability: availabilitySlots[shopperProfileId] ?? [],
      pricingPackages: pricingPackages[shopperProfileId] ?? [],
      specialties: matches.find((match) => match.id === shopperProfileId)?.specialties.map((name) => ({ name })) ?? [],
      stylePreferences: stylePreferences[shopperProfileId] ?? [],
      user: {
        ...(session?.user ?? {
          email: "shopper@stylecompanion.test",
          id: profile.userId,
          name: "Jordan Style",
          role: "SHOPPER"
        }),
        wardrobePhotos: wardrobePhotos.filter((photo) => photo.userId === profile.userId && photo.visibility === "PUBLIC_PROFILE")
      }
    };
  },
  async getShopperProfile(shopperProfileId: string) {
    await delay();
    const profile = shopperProfiles[shopperProfileId];
    const match = matches.find((item) => item.id === shopperProfileId);

    if (!profile) {
      throw new Error("Shopper profile not found.");
    }

    return {
      ...profile,
      availability: availabilitySlots[shopperProfileId] ?? [],
      pricingPackages: pricingPackages[shopperProfileId] ?? [],
      specialties: match?.specialties.map((name) => ({ name })) ?? [],
      stylePreferences: stylePreferences[shopperProfileId] ?? [],
      user: {
        email: `${(match?.name ?? "shopper").toLowerCase().replace(/\s+/g, ".")}@stylecompanion.test`,
        id: profile.userId,
        name: match?.name ?? "Style guide",
        role: "SHOPPER",
        wardrobePhotos: wardrobePhotos.filter((photo) => photo.userId === profile.userId && photo.visibility === "PUBLIC_PROFILE")
      }
    };
  },
  async getShopperMatches(search: ShopperMatchSearchInput) {
    await delay();
    const terms = searchTerms([search.styleGoals, search.specialty, search.specialties].filter(Boolean).join(" "));
    const budgetMaxCents = search.budgetMaxCents;

    return matches.filter((match) => {
      const locationFits =
        (!search.city || match.city.toLowerCase().includes(search.city.toLowerCase())) &&
        (!search.state || match.state.toLowerCase() === search.state.toLowerCase());
      const budgetFits = !budgetMaxCents || match.hourlyRateCents <= budgetMaxCents;
      const termFits =
        terms.length === 0 ||
        terms.some((term) =>
          [match.headline, match.bio, ...match.specialties, ...(stylePreferences[match.id] ?? []).flatMap((preference) => preference.styleTags)]
            .join(" ")
            .toLowerCase()
            .includes(term)
        );
      const availabilityFits = !search.availableFrom || (availabilitySlots[match.id] ?? []).length > 0;

      return locationFits && budgetFits && termFits && availabilityFits;
    });
  },
  async getShopperStylePreferences(shopperProfileId: string) {
    await delay();
    return stylePreferences[shopperProfileId] ?? [];
  },
  async getWardrobePhotos(userId: string) {
    await delay();
    return wardrobePhotos.filter((photo) => photo.userId === userId);
  },
  async getWardrobePhotosForBooking(bookingId: string) {
    await delay();
    return wardrobePhotos.filter((photo) => photo.bookingId === bookingId && photo.visibility === "BOOKING_SHARED");
  },
  async updateShopperProfile(shopperProfileId: string, input: Partial<ShopperProfileInput>) {
    await delay();
    const current = shopperProfiles[shopperProfileId];

    if (!current) {
      throw new Error("Shopper profile not found.");
    }

    const next = {
      ...current,
      ...input
    };
    shopperProfiles[shopperProfileId] = next;
    return next;
  },
  async updateWardrobePhoto(photoId: string, input: WardrobePhotoUpdateInput) {
    await delay();
    const index = wardrobePhotos.findIndex((photo) => photo.id === photoId);

    if (index < 0) {
      throw new Error("Wardrobe photo not found.");
    }

    wardrobePhotos[index] = {
      ...wardrobePhotos[index],
      ...input
    };
    return wardrobePhotos[index];
  }
};
