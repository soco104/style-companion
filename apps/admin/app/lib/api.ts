import type { Booking, Review, SafetyReport, ShopperProfile, User } from "./types";

export type ApiResult<T> = {
  data: T;
  error?: string;
};

const apiUrl = (process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000").replace(/\/$/, "");
const requestTimeoutMs = 2500;

async function request<T>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
  try {
    const response = await fetch(`${apiUrl}${path}`, {
      ...init,
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...init?.headers
      },
      signal: AbortSignal.timeout(requestTimeoutMs)
    });

    if (!response.ok) {
      return {
        data: fallbackData<T>(),
        error: `API returned ${response.status} for ${path}.`
      };
    }

    return { data: (await response.json()) as T };
  } catch {
    return {
      data: fallbackData<T>(),
      error: `Could not reach the backend API at ${apiUrl} within ${requestTimeoutMs}ms.`
    };
  }
}

function fallbackData<T>(): T {
  return [] as T;
}

export function formatDateTime(value?: string | null) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function formatMoney(cents?: number | null, currency = "USD") {
  if (cents == null) {
    return "Not set";
  }

  return new Intl.NumberFormat("en", {
    currency,
    style: "currency"
  }).format(cents / 100);
}

export function getApiBaseUrl() {
  return apiUrl;
}

export const adminApi = {
  bookings: () => request<Booking[]>("/bookings?take=100"),
  health: () => request<{ status: string }>("/health"),
  moderateReview: (id: string, moderationStatus: string, moderationNotes?: string) =>
    request<Review>(`/reviews/${id}/moderation`, {
      body: JSON.stringify({ moderationNotes, moderationStatus }),
      method: "PATCH"
    }),
  reviews: () => request<Review[]>("/reviews?take=100"),
  safetyReports: () => request<SafetyReport[]>("/safety-reports?take=100"),
  shoppers: () => request<ShopperProfile[]>("/profiles/shopper?take=100"),
  updateSafetyReport: (id: string, status: string, resolutionNotes?: string) =>
    request<SafetyReport>(`/safety-reports/${id}`, {
      body: JSON.stringify({ resolutionNotes, status }),
      method: "PATCH"
    }),
  users: () => request<User[]>("/users?take=100")
};
