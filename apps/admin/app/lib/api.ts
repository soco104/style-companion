import type {
  ApiDiagnosticCheck,
  ApiDiagnosticRun,
  Booking,
  Review,
  SafetyReport,
  ShopperMatchSummary,
  ShopperProfile,
  User
} from "./types";

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

async function diagnosticRequest<T>(path: string, init?: RequestInit) {
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
    const data = response.headers.get("content-type")?.includes("application/json")
      ? ((await response.json()) as T)
      : undefined;

    return {
      data,
      ok: response.ok,
      status: response.status
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown API error.",
      ok: false,
      status: 0
    };
  }
}

function diagnosticCheck(input: ApiDiagnosticCheck) {
  return input;
}

async function runApiDiagnostics(): Promise<ApiDiagnosticRun> {
  const checks: ApiDiagnosticCheck[] = [];

  const health = await diagnosticRequest<{ status: string }>("/health");
  checks.push(
    diagnosticCheck({
      detail: health.ok ? `Health returned ${health.data?.status ?? "unknown"}.` : `Health failed with status ${health.status}.`,
      endpoint: "GET /health",
      expected: "API responds with status ok.",
      name: "Backend health",
      status: health.ok && health.data?.status === "ok" ? "PASS" : "FAIL"
    })
  );

  const styleMatches = await diagnosticRequest<ShopperMatchSummary[]>(
    "/shoppers/matches?city=Nashville&state=TN&styleGoals=boho,modern,thrift-friendly&specialties=Budget%20styling&budgetMaxCents=20000&take=5"
  );
  const firstStyleMatch = styleMatches.data?.[0];
  checks.push(
    diagnosticCheck({
      detail: styleMatches.ok
        ? `${styleMatches.data?.length ?? 0} matches returned. Top match: ${firstStyleMatch?.name ?? "none"}.`
        : `Search failed with status ${styleMatches.status}.`,
      endpoint: "GET /shoppers/matches?...styleGoals=boho,modern,thrift-friendly",
      expected: "Buyer search returns ranked shopper matches.",
      name: "Buyer search returns matches",
      status: styleMatches.ok && (styleMatches.data?.length ?? 0) > 0 ? "PASS" : "FAIL"
    })
  );
  checks.push(
    diagnosticCheck({
      detail: firstStyleMatch?.explanation?.join(" ") ?? "No match explanation returned.",
      endpoint: "GET /shoppers/matches",
      expected: "Match explanation includes weighted style-fit scoring.",
      name: "Weighted style explanation",
      status: firstStyleMatch?.explanation?.some((item) => item.toLowerCase().includes("style fit")) ? "PASS" : "FAIL"
    })
  );

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const nextWeek = new Date(tomorrow);
  nextWeek.setDate(nextWeek.getDate() + 7);
  const availabilityMatches = await diagnosticRequest<ShopperMatchSummary[]>(
    `/shoppers/matches?availableFrom=${encodeURIComponent(tomorrow.toISOString())}&availableTo=${encodeURIComponent(
      nextWeek.toISOString()
    )}&take=5`
  );
  checks.push(
    diagnosticCheck({
      detail: availabilityMatches.ok
        ? `${availabilityMatches.data?.length ?? 0} matches returned for the next-week availability window.`
        : `Availability search failed with status ${availabilityMatches.status}.`,
      endpoint: "GET /shoppers/matches?availableFrom=...&availableTo=...",
      expected: "Availability-filtered search succeeds and returns an array.",
      name: "Availability search filter",
      status: availabilityMatches.ok && Array.isArray(availabilityMatches.data) ? "PASS" : "FAIL"
    })
  );

  const login = await diagnosticRequest<{ token: string; user: User }>("/auth/dev-login", {
    body: JSON.stringify({ email: "shopper@stylecompanion.test" }),
    method: "POST"
  });
  const token = login.data?.token;
  const me: { data?: ShopperProfile; ok: boolean; status: number } = token
    ? await diagnosticRequest<ShopperProfile>("/profiles/shopper/me", {
        headers: { Authorization: `Bearer ${token}` }
      })
    : { ok: false, status: 0 };
  checks.push(
    diagnosticCheck({
      detail: me.ok
        ? `Loaded shopper profile ${(me.data as ShopperProfile | undefined)?.headline ?? "without headline"}.`
        : `Could not load current shopper profile. Login status ${login.status}; profile status ${me.status}.`,
      endpoint: "GET /profiles/shopper/me",
      expected: "Authenticated shopper can load their configured profile.",
      name: "Current shopper profile",
      status: me.ok ? "PASS" : "FAIL"
    })
  );

  const passed = checks.filter((check) => check.status === "PASS").length;
  const failed = checks.filter((check) => check.status === "FAIL").length;
  const warned = checks.filter((check) => check.status === "WARN").length;

  return {
    apiUrl,
    checks,
    failed,
    generatedAt: new Date().toISOString(),
    passed,
    warned
  };
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

type ProfileFeeWaiverInput = {
  feeWaivedByUserId?: string;
  feeWaiverReason?: string;
  feesWaived: boolean;
};

export const adminApi = {
  apiTests: runApiDiagnostics,
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
  updateCustomerFeeWaiver: (id: string, input: ProfileFeeWaiverInput) =>
    request(`/profiles/customer/${id}/fee-waiver`, {
      body: JSON.stringify(input),
      method: "PATCH"
    }),
  updateShopperFeeWaiver: (id: string, input: ProfileFeeWaiverInput) =>
    request(`/profiles/shopper/${id}/fee-waiver`, {
      body: JSON.stringify(input),
      method: "PATCH"
    }),
  updateSafetyReport: (id: string, status: string, resolutionNotes?: string) =>
    request<SafetyReport>(`/safety-reports/${id}`, {
      body: JSON.stringify({ resolutionNotes, status }),
      method: "PATCH"
    }),
  users: () => request<User[]>("/users?take=100")
};
