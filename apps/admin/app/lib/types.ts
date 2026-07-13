export type UserRole = "CUSTOMER" | "SHOPPER" | "ADMIN";

export type BookingStatus = "REQUESTED" | "ACCEPTED" | "DECLINED" | "CANCELLED" | "COMPLETED" | "DISPUTED";

export type ModerationStatus = "PENDING" | "APPROVED" | "REJECTED" | "FLAGGED" | "HIDDEN";

export type SafetyReportStatus = "OPEN" | "IN_REVIEW" | "RESOLVED" | "DISMISSED";

export type User = {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  role: UserRole;
  createdAt: string;
  customerProfile?: {
    id: string;
    city?: string | null;
    state?: string | null;
    feesWaived?: boolean;
    feeWaiverReason?: string | null;
    feeWaivedAt?: string | null;
  } | null;
  shopperProfile?: {
    id: string;
    headline: string;
    city: string;
    state: string;
    feesWaived?: boolean;
    feeWaiverReason?: string | null;
    feeWaivedAt?: string | null;
  } | null;
};

export type ShopperProfile = {
  id: string;
  headline: string;
  bio?: string | null;
  city: string;
  state: string;
  serviceRadiusMiles: number;
  hourlyRateCents: number;
  currency: string;
  isActive: boolean;
  averageRating?: string | number | null;
  reviewCount: number;
  feesWaived: boolean;
  feeWaiverReason?: string | null;
  feeWaivedAt?: string | null;
  feeWaivedByUserId?: string | null;
  createdAt: string;
  user: User;
  specialties: Array<{ id: string; name: string }>;
};

export type ShopperPricingPackage = {
  id: string;
  title: string;
  sessionCount: number;
  pricePerSessionCents: number;
  totalPriceCents: number;
  description?: string | null;
  isActive: boolean;
};

export type Booking = {
  id: string;
  status: BookingStatus;
  scheduledStartAt: string;
  scheduledEndAt: string;
  city: string;
  state: string;
  goal: string;
  budgetCents?: number | null;
  pricingPackage?: ShopperPricingPackage | null;
  pricingPackageId?: string | null;
  totalPriceCents: number;
  currency: string;
  customerProfile: { id: string; user: User };
  shopperProfile: { id: string; headline: string; user: User };
};

export type Review = {
  id: string;
  rating: number;
  body: string;
  moderationStatus: ModerationStatus;
  moderationNotes?: string | null;
  publishedAt?: string | null;
  createdAt: string;
  customerProfile: { id: string; user: User };
  shopperProfile: { id: string; headline: string; user: User };
  response?: { id: string; body: string; moderationStatus: ModerationStatus } | null;
};

export type SafetyReport = {
  id: string;
  category: string;
  description: string;
  status: SafetyReportStatus;
  resolutionNotes?: string | null;
  createdAt: string;
  resolvedAt?: string | null;
  reporterUser: User;
  reportedUser?: User | null;
  assignedAdmin?: User | null;
  booking?: { id: string; status: BookingStatus } | null;
};

export type ApiDiagnosticStatus = "PASS" | "FAIL" | "WARN";

export type ApiDiagnosticCheck = {
  detail: string;
  endpoint: string;
  expected: string;
  name: string;
  status: ApiDiagnosticStatus;
};

export type ApiDiagnosticRun = {
  apiUrl: string;
  checks: ApiDiagnosticCheck[];
  failed: number;
  generatedAt: string;
  passed: number;
  warned: number;
};

export type ShopperMatchSummary = {
  id: string;
  name: string;
  matchScore: number;
  city: string;
  state: string;
  explanation: string[];
};
