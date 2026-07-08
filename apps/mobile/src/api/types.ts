import type {
  BookingInput,
  BookingSummary,
  CustomerProfileInput,
  ReviewInput,
  ReviewResponseInput,
  SafetyReportInput,
  ShopperMatch,
  ShopperProfileInput,
  StyleQuizInput
} from "@style-companion/shared";

export type Session = {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
};

export type CustomerProfile = CustomerProfileInput & {
  id: string;
};

export type ShopperProfile = ShopperProfileInput & {
  id: string;
};

export type MobileApiClient = {
  createBooking(input: BookingInput): Promise<BookingSummary>;
  createCustomerProfile(input: CustomerProfileInput): Promise<CustomerProfile>;
  createReview(bookingId: string, input: ReviewInput): Promise<{ id: string }>;
  createReviewResponse(reviewId: string, input: ReviewResponseInput): Promise<{ id: string }>;
  createSafetyReport(input: SafetyReportInput): Promise<{ id: string }>;
  createShopperProfile(input: ShopperProfileInput): Promise<ShopperProfile>;
  createStyleQuiz(input: StyleQuizInput): Promise<{ id: string }>;
  devLogin(email: string): Promise<Session>;
  getShopperMatches(customerProfileId: string): Promise<ShopperMatch[]>;
};
