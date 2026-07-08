export type ServiceStatus = {
  name: string;
  status: "ok";
};

export type UserRole = "CUSTOMER" | "SHOPPER" | "ADMIN";

export type BookingStatus =
  | "REQUESTED"
  | "ACCEPTED"
  | "DECLINED"
  | "CANCELLED"
  | "COMPLETED"
  | "DISPUTED";

export type CustomerProfileInput = {
  userId: string;
  city?: string;
  state?: string;
  bio?: string;
  pronouns?: string;
};

export type ShopperProfileInput = {
  userId: string;
  headline: string;
  bio?: string;
  city: string;
  state: string;
  serviceRadiusMiles?: number;
  hourlyRateCents: number;
  currency?: string;
  isActive?: boolean;
};

export type StyleQuizInput = {
  customerProfileId: string;
  styleGoals: Record<string, unknown>;
  preferredOccasions: string[];
  budgetMinCents?: number;
  budgetMaxCents?: number;
  colorPreferences: string[];
  fitConcerns?: string;
  sizingNotes?: string;
  additionalNotes?: string;
};

export type ShopperMatch = {
  id: string;
  name: string;
  headline: string;
  bio: string;
  city: string;
  state: string;
  hourlyRateCents: number;
  averageRating: number;
  explanation: string[];
  matchScore: number;
  reviewCount: number;
  specialties: string[];
};

export type BookingInput = {
  customerProfileId: string;
  shopperProfileId: string;
  scheduledStartAt: string;
  scheduledEndAt: string;
  timezone: string;
  locationName?: string;
  city: string;
  state: string;
  postalCode?: string;
  goal: string;
  budgetCents?: number;
  customerNotes?: string;
  totalPriceCents: number;
  currency?: string;
};

export type BookingSummary = {
  id: string;
  status: BookingStatus;
  shopperName: string;
  scheduledStartAt: string;
  locationName?: string;
  totalPriceCents: number;
};

export type ReviewInput = {
  customerProfileId: string;
  shopperProfileId: string;
  rating: number;
  body: string;
};

export type ReviewResponseInput = {
  shopperProfileId: string;
  body: string;
};

export type SafetyReportInput = {
  reporterUserId: string;
  reportedUserId?: string;
  bookingId?: string;
  category:
    | "INAPPROPRIATE_BEHAVIOR"
    | "NO_SHOW"
    | "PAYMENT_ISSUE"
    | "SAFETY_CONCERN"
    | "OTHER";
  description: string;
};
