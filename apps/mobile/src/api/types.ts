import type {
  BookingInput,
  BookingSummary,
  AvailabilitySlot,
  AvailabilitySlotInput,
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

export type Session = {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role?: "CUSTOMER" | "SHOPPER" | "ADMIN";
    customerProfile?: { id: string } | null;
    shopperProfile?: { id: string; headline?: string } | null;
  };
};

export type CustomerProfile = CustomerProfileInput & {
  id: string;
};

export type ShopperProfile = ShopperProfileInput & {
  id: string;
  availability?: AvailabilitySlot[];
  pricingPackages?: ShopperPricingPackage[];
  specialties?: Array<{ id?: string; name: string }>;
  stylePreferences?: ShopperStylePreference[];
  user?: Session["user"] & {
    wardrobePhotos?: WardrobePhoto[];
  };
};

export type MobileApiClient = {
  addAvailabilitySlot(shopperProfileId: string, input: AvailabilitySlotInput): Promise<AvailabilitySlot>;
  createBooking(input: BookingInput): Promise<BookingSummary>;
  createCustomerProfile(input: CustomerProfileInput): Promise<CustomerProfile>;
  createPricingPackage(shopperProfileId: string, input: ShopperPricingPackageInput): Promise<ShopperPricingPackage>;
  createReview(bookingId: string, input: ReviewInput): Promise<{ id: string }>;
  createReviewResponse(reviewId: string, input: ReviewResponseInput): Promise<{ id: string }>;
  createSafetyReport(input: SafetyReportInput): Promise<{ id: string }>;
  createShopperProfile(input: ShopperProfileInput): Promise<ShopperProfile>;
  createShopperStylePreference(
    shopperProfileId: string,
    input: ShopperStylePreferenceInput
  ): Promise<ShopperStylePreference>;
  createStyleQuiz(input: StyleQuizInput): Promise<{ id: string }>;
  createWardrobePhoto(input: WardrobePhotoInput): Promise<WardrobePhoto>;
  deleteWardrobePhoto(photoId: string): Promise<WardrobePhoto>;
  devLogin(email: string): Promise<Session>;
  getAvailability(shopperProfileId: string, from: string, to: string): Promise<SchedulingAvailability>;
  getPricingPackages(shopperProfileId: string): Promise<ShopperPricingPackage[]>;
  getShopperProfile(shopperProfileId: string): Promise<ShopperProfile>;
  getCurrentShopperProfile(): Promise<ShopperProfile>;
  getShopperMatches(search: ShopperMatchSearchInput): Promise<ShopperMatch[]>;
  getShopperStylePreferences(shopperProfileId: string): Promise<ShopperStylePreference[]>;
  getWardrobePhotos(userId: string): Promise<WardrobePhoto[]>;
  getWardrobePhotosForBooking(bookingId: string): Promise<WardrobePhoto[]>;
  updateShopperProfile(shopperProfileId: string, input: Partial<ShopperProfileInput>): Promise<ShopperProfile>;
  updateWardrobePhoto(photoId: string, input: WardrobePhotoUpdateInput): Promise<WardrobePhoto>;
};
