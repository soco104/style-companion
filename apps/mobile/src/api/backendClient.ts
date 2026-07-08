import type {
  BookingInput,
  CustomerProfileInput,
  ReviewInput,
  ReviewResponseInput,
  SafetyReportInput,
  ShopperProfileInput,
  StyleQuizInput
} from "@style-companion/shared";

import type { CustomerProfile, MobileApiClient, Session, ShopperProfile } from "./types";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...init?.headers
    },
    ...init
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const backendClient: MobileApiClient = {
  createBooking(input: BookingInput) {
    return request("/bookings", {
      body: JSON.stringify(input),
      method: "POST"
    });
  },
  createCustomerProfile(input: CustomerProfileInput): Promise<CustomerProfile> {
    return request("/profiles/customer", {
      body: JSON.stringify(input),
      method: "POST"
    });
  },
  createReview(bookingId: string, input: ReviewInput) {
    return request(`/bookings/${bookingId}/reviews`, {
      body: JSON.stringify(input),
      method: "POST"
    });
  },
  createReviewResponse(reviewId: string, input: ReviewResponseInput) {
    return request(`/reviews/${reviewId}/response`, {
      body: JSON.stringify(input),
      method: "POST"
    });
  },
  createSafetyReport(input: SafetyReportInput) {
    return request("/safety-reports", {
      body: JSON.stringify(input),
      method: "POST"
    });
  },
  createShopperProfile(input: ShopperProfileInput): Promise<ShopperProfile> {
    return request("/profiles/shopper", {
      body: JSON.stringify(input),
      method: "POST"
    });
  },
  createStyleQuiz(input: StyleQuizInput) {
    return request("/style-quiz", {
      body: JSON.stringify(input),
      method: "POST"
    });
  },
  devLogin(email: string): Promise<Session> {
    return request("/auth/dev-login", {
      body: JSON.stringify({ email }),
      method: "POST"
    });
  },
  getShopperMatches() {
    return request("/shoppers/matches");
  }
};
