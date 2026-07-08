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
  customerProfile?: { id: string; city?: string | null; state?: string | null } | null;
  shopperProfile?: { id: string; headline: string; city: string; state: string } | null;
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
  createdAt: string;
  user: User;
  specialties: Array<{ id: string; name: string }>;
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
