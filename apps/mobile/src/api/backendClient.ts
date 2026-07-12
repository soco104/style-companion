import type {
  BookingInput,
  AvailabilitySlot,
  AvailabilitySlotInput,
  CustomerProfileInput,
  ReviewInput,
  ReviewResponseInput,
  SafetyReportInput,
  SchedulingAvailability,
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
import { getAuthToken } from "./sessionStore";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAuthToken();
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
  addAvailabilitySlot(shopperProfileId: string, input: AvailabilitySlotInput): Promise<AvailabilitySlot> {
    return request(`/profiles/shopper/${shopperProfileId}/availability`, {
      body: JSON.stringify(input),
      method: "POST"
    });
  },
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
  createPricingPackage(shopperProfileId: string, input: ShopperPricingPackageInput): Promise<ShopperPricingPackage> {
    return request(`/profiles/shopper/${shopperProfileId}/pricing-packages`, {
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
  createShopperStylePreference(
    shopperProfileId: string,
    input: ShopperStylePreferenceInput
  ): Promise<ShopperStylePreference> {
    return request(`/profiles/shopper/${shopperProfileId}/style-preferences`, {
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
  createWardrobePhoto(input: WardrobePhotoInput): Promise<WardrobePhoto> {
    return request("/wardrobe-photos", {
      body: JSON.stringify(input),
      method: "POST"
    });
  },
  deleteWardrobePhoto(photoId: string): Promise<WardrobePhoto> {
    return request(`/wardrobe-photos/${photoId}`, {
      method: "DELETE"
    });
  },
  devLogin(email: string): Promise<Session> {
    return request("/auth/dev-login", {
      body: JSON.stringify({ email }),
      method: "POST"
    });
  },
  getAvailability(shopperProfileId: string, from: string, to: string): Promise<SchedulingAvailability> {
    const params = new URLSearchParams({ from, shopperProfileId, to });
    return request(`/scheduling/availability?${params.toString()}`);
  },
  getPricingPackages(shopperProfileId: string): Promise<ShopperPricingPackage[]> {
    return request(`/profiles/shopper/${shopperProfileId}/pricing-packages`);
  },
  getCurrentShopperProfile(): Promise<ShopperProfile> {
    return request("/profiles/shopper/me");
  },
  getShopperProfile(shopperProfileId: string): Promise<ShopperProfile> {
    return request(`/profiles/shopper/${shopperProfileId}`);
  },
  getShopperMatches(search: ShopperMatchSearchInput) {
    const params = new URLSearchParams();

    Object.entries(search).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        params.set(key, String(value));
      }
    });

    return request(`/shoppers/matches?${params.toString()}`);
  },
  getShopperStylePreferences(shopperProfileId: string): Promise<ShopperStylePreference[]> {
    return request(`/profiles/shopper/${shopperProfileId}/style-preferences`);
  },
  getWardrobePhotos(userId: string): Promise<WardrobePhoto[]> {
    return request(`/wardrobe-photos/users/${userId}`);
  },
  getWardrobePhotosForBooking(bookingId: string): Promise<WardrobePhoto[]> {
    return request(`/wardrobe-photos/bookings/${bookingId}`);
  },
  updateShopperProfile(shopperProfileId: string, input: Partial<ShopperProfileInput>): Promise<ShopperProfile> {
    return request(`/profiles/shopper/${shopperProfileId}`, {
      body: JSON.stringify(input),
      method: "PATCH"
    });
  },
  updateWardrobePhoto(photoId: string, input: WardrobePhotoUpdateInput): Promise<WardrobePhoto> {
    return request(`/wardrobe-photos/${photoId}`, {
      body: JSON.stringify(input),
      method: "PATCH"
    });
  }
};
