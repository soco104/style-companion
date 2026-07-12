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
  userId?: string;
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

export type ShopperMatchSearchInput = {
  customerProfileId?: string;
  city?: string;
  state?: string;
  specialty?: string;
  specialties?: string;
  styleGoals?: string;
  budgetMaxCents?: number;
  availableFrom?: string;
  availableTo?: string;
  take?: number;
};

export type ShopperPricingPackage = {
  id: string;
  shopperProfileId: string;
  title: string;
  sessionCount: number;
  pricePerSessionCents: number;
  totalPriceCents: number;
  description?: string;
  isActive: boolean;
};

export type ShopperPricingPackageInput = {
  ownerUserId?: string;
  title: string;
  sessionCount: number;
  pricePerSessionCents: number;
  totalPriceCents: number;
  description?: string;
  isActive?: boolean;
};

export type ShopperStylePreference = {
  id: string;
  shopperProfileId: string;
  styleTags: string[];
  preferredBrands: string[];
  avoidedStyles: string[];
  notes?: string;
};

export type ShopperStylePreferenceInput = {
  ownerUserId?: string;
  styleTags: string[];
  preferredBrands?: string[];
  avoidedStyles?: string[];
  notes?: string;
};

export type AvailabilitySlot = {
  id: string;
  shopperProfileId?: string;
  startsAt: string;
  endsAt: string;
  timezone: string;
  isRecurring?: boolean;
  recurrenceRule?: string | null;
  sourceSlotId?: string;
};

export type AvailabilitySlotInput = {
  shopperProfileId: string;
  ownerUserId?: string;
  startsAt: string;
  endsAt: string;
  timezone: string;
  isRecurring?: boolean;
  recurrenceRule?: string;
};

export type SchedulingAvailability = {
  shopperProfileId: string;
  from: string;
  to: string;
  slots: AvailabilitySlot[];
  availableSlots: AvailabilitySlot[];
  acceptedBookings: Array<{
    bookingId: string;
    startsAt: string;
    endsAt: string;
  }>;
};

export type WardrobePhoto = {
  id: string;
  userId: string;
  bookingId?: string | null;
  url: string;
  storageKey: string;
  title?: string;
  caption?: string;
  category: string;
  visibility: "PRIVATE" | "BOOKING_SHARED" | "PUBLIC_PROFILE";
  uploadedByRole: "CUSTOMER" | "SHOPPER" | "ADMIN";
  tags: string[];
  metadata?: Record<string, unknown>;
};

export type WardrobePhotoInput = {
  userId?: string;
  uploadedByUserId?: string;
  bookingId?: string;
  url: string;
  storageKey: string;
  title?: string;
  caption?: string;
  category: string;
  visibility?: "PRIVATE" | "BOOKING_SHARED" | "PUBLIC_PROFILE";
  uploadedByRole: "CUSTOMER" | "SHOPPER" | "ADMIN";
  tags?: string[];
  metadata?: Record<string, unknown>;
};

export type WardrobePhotoUpdateInput = Partial<
  Pick<WardrobePhotoInput, "caption" | "category" | "metadata" | "tags" | "title" | "visibility">
> & {
  uploadedByUserId?: string;
};

export type BookingInput = {
  customerProfileId: string;
  shopperProfileId: string;
  pricingPackageId?: string;
  scheduledStartAt?: string;
  scheduledEndAt?: string;
  scheduledStart?: string;
  scheduledEnd?: string;
  timezone: string;
  locationName?: string;
  city: string;
  state: string;
  postalCode?: string;
  goal: string;
  budgetCents?: number;
  customerNotes?: string;
  totalPriceCents?: number;
  currency?: string;
};

export type BookingSummary = {
  id: string;
  status: BookingStatus;
  shopperName: string;
  scheduledStartAt: string;
  locationName?: string;
  pricingPackageId?: string;
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
