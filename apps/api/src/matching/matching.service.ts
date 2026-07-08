import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";
import { MatchQueryDto } from "./dto/match-query.dto";

@Injectable()
export class MatchingService {
  constructor(private readonly prisma: PrismaService) {}

  async findShoppers(query: MatchQueryDto) {
    const customerContext = await this.getCustomerContext(query);
    const where: Prisma.ShopperProfileWhereInput = {
      isActive: true
    };

    const shoppers = await this.prisma.shopperProfile.findMany({
      include: {
        availability: true,
        specialties: true,
        user: true
      },
      where
    });

    return shoppers
      .map((shopper) => scoreShopperMatch(shopper, customerContext))
      .sort((left, right) => {
        if (right.matchScore !== left.matchScore) {
          return right.matchScore - left.matchScore;
        }

        if (right.averageRating !== left.averageRating) {
          return right.averageRating - left.averageRating;
        }

        if (right.reviewCount !== left.reviewCount) {
          return right.reviewCount - left.reviewCount;
        }

        return left.name.localeCompare(right.name);
      })
      .slice(0, query.take);
  }

  private async getCustomerContext(query: MatchQueryDto): Promise<CustomerMatchContext> {
    if (!query.customerProfileId) {
      return contextFromQuery(query);
    }

    const customerProfile = await this.prisma.customerProfile.findUnique({
      include: {
        styleQuizResponses: {
          orderBy: { createdAt: "desc" },
          take: 1
        }
      },
      where: { id: query.customerProfileId }
    });

    const latestQuiz = customerProfile?.styleQuizResponses[0];

    return {
      budgetMaxCents: query.budgetMaxCents ?? latestQuiz?.budgetMaxCents ?? undefined,
      city: query.city ?? customerProfile?.city ?? undefined,
      requestedSpecialties: parseTerms(query.specialties ?? query.specialty),
      state: query.state ?? customerProfile?.state ?? undefined,
      styleGoalTerms: [
        ...parseTerms(query.styleGoals),
        ...extractTerms(latestQuiz?.styleGoals),
        ...(latestQuiz?.preferredOccasions ?? []),
        ...(latestQuiz?.additionalNotes ? parseTerms(latestQuiz.additionalNotes) : [])
      ]
    };
  }
}

type ShopperForMatching = Prisma.ShopperProfileGetPayload<{
  include: {
    availability: true;
    specialties: true;
    user: true;
  };
}>;

type CustomerMatchContext = {
  budgetMaxCents?: number;
  city?: string;
  requestedSpecialties: string[];
  state?: string;
  styleGoalTerms: string[];
};

type ScorePart = {
  explanation: string;
  score: number;
};

const weights = {
  availability: 0.2,
  budget: 0.1,
  distance: 0.3,
  rating: 0.15,
  specialty: 0.25
};

export function scoreShopperMatch(shopper: ShopperForMatching, context: CustomerMatchContext) {
  const distance = scoreDistance(shopper, context);
  const specialty = scoreSpecialty(shopper, context);
  const availability = scoreAvailability(shopper);
  const rating = scoreRating(shopper);
  const budget = scoreBudget(shopper, context);

  const matchScore = Math.round(
    100 *
      (distance.score * weights.distance +
        specialty.score * weights.specialty +
        availability.score * weights.availability +
        rating.score * weights.rating +
        budget.score * weights.budget)
  );

  return {
    averageRating: rating.rating,
    bio: shopper.bio ?? "",
    city: shopper.city,
    explanation: [
      `Distance: ${distance.explanation}`,
      `Specialty: ${specialty.explanation}`,
      `Availability: ${availability.explanation}`,
      `Rating: ${rating.explanation}`,
      `Budget: ${budget.explanation}`
    ],
    headline: shopper.headline,
    hourlyRateCents: shopper.hourlyRateCents,
    id: shopper.id,
    matchScore,
    name: shopper.user.name,
    reviewCount: shopper.reviewCount,
    specialties: shopper.specialties.map((item) => item.name),
    state: shopper.state
  };
}

function contextFromQuery(query: MatchQueryDto): CustomerMatchContext {
  return {
    budgetMaxCents: query.budgetMaxCents,
    city: query.city,
    requestedSpecialties: parseTerms(query.specialties ?? query.specialty),
    state: query.state,
    styleGoalTerms: parseTerms(query.styleGoals)
  };
}

function scoreDistance(shopper: ShopperForMatching, context: CustomerMatchContext): ScorePart {
  if (!context.city && !context.state) {
    return { explanation: "no customer location provided; neutral location score", score: 0.5 };
  }

  const sameCity = equalsIgnoreCase(shopper.city, context.city);
  const sameState = equalsIgnoreCase(shopper.state, context.state);

  if (sameCity && sameState) {
    return {
      explanation: `${shopper.city}, ${shopper.state} matches the customer location and is within a ${shopper.serviceRadiusMiles}-mile service radius`,
      score: 1
    };
  }

  if (sameState) {
    const score = shopper.serviceRadiusMiles >= 20 ? 0.6 : 0.3;
    return {
      explanation: `${shopper.city}, ${shopper.state} is in the same state; service radius is ${shopper.serviceRadiusMiles} miles`,
      score
    };
  }

  return {
    explanation: `${shopper.city}, ${shopper.state} does not match the customer location`,
    score: 0
  };
}

function scoreSpecialty(shopper: ShopperForMatching, context: CustomerMatchContext): ScorePart {
  const desiredTerms = normalizeTerms([...context.requestedSpecialties, ...context.styleGoalTerms]);

  if (desiredTerms.length === 0) {
    return { explanation: "no specialties or style goals provided; neutral specialty score", score: 0.5 };
  }

  const shopperText = normalizeTerms([
    shopper.headline,
    shopper.bio ?? "",
    ...shopper.specialties.map((specialty) => specialty.name)
  ]);

  const matched = desiredTerms.filter((term) =>
    shopperText.some((shopperTerm) => shopperTerm.includes(term) || term.includes(shopperTerm))
  );

  if (matched.length === 0) {
    return {
      explanation: "no requested specialties or style goals matched this shopper profile",
      score: 0
    };
  }

  const score = Math.min(1, matched.length / Math.max(1, desiredTerms.length));

  return {
    explanation: `matched ${unique(matched).join(", ")}`,
    score
  };
}

function scoreAvailability(shopper: ShopperForMatching): ScorePart {
  const now = new Date();
  const hasFutureSlot = shopper.availability.some((slot) => slot.startsAt >= now);
  const hasRecurringSlot = shopper.availability.some((slot) => slot.isRecurring);

  if (hasFutureSlot) {
    return { explanation: "has upcoming availability", score: 1 };
  }

  if (hasRecurringSlot) {
    return { explanation: "has recurring availability but no dated upcoming slot", score: 0.7 };
  }

  return { explanation: "no availability slots listed", score: 0 };
}

function scoreRating(shopper: ShopperForMatching): ScorePart & { rating: number } {
  const rating = shopper.averageRating == null ? 0 : Number(shopper.averageRating);

  if (rating === 0) {
    return { explanation: "no rating yet", rating, score: 0.6 };
  }

  return {
    explanation: `${rating.toFixed(1)} average rating from ${shopper.reviewCount} reviews`,
    rating,
    score: Math.max(0, Math.min(1, rating / 5))
  };
}

function scoreBudget(shopper: ShopperForMatching, context: CustomerMatchContext): ScorePart {
  if (!context.budgetMaxCents) {
    return { explanation: "no customer budget provided; neutral budget score", score: 0.5 };
  }

  const estimatedTwoHourSession = shopper.hourlyRateCents * 2;

  if (estimatedTwoHourSession <= context.budgetMaxCents) {
    return {
      explanation: `estimated two-hour session fits budget (${estimatedTwoHourSession} <= ${context.budgetMaxCents})`,
      score: 1
    };
  }

  if (shopper.hourlyRateCents <= context.budgetMaxCents) {
    return {
      explanation: "hourly rate fits budget, but estimated two-hour session is above budget",
      score: 0.5
    };
  }

  return {
    explanation: "hourly rate is above customer budget",
    score: 0
  };
}

function equalsIgnoreCase(left?: string, right?: string) {
  return Boolean(left && right && left.toLowerCase() === right.toLowerCase());
}

function extractTerms(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap(extractTerms);
  }

  if (value && typeof value === "object") {
    return Object.values(value).flatMap(extractTerms);
  }

  return typeof value === "string" ? parseTerms(value) : [];
}

function normalizeTerms(values: string[]) {
  return unique(
    values
      .flatMap(parseTerms)
      .map((value) => value.toLowerCase())
      .filter((value) => value.length >= 3)
  );
}

function parseTerms(value?: string | string[]) {
  if (!value) {
    return [];
  }

  const values = Array.isArray(value) ? value : value.split(/[,;|]/);

  return values
    .flatMap((item) => item.split(/\s+/))
    .map((item) => item.trim())
    .filter(Boolean);
}

function unique(values: string[]) {
  return Array.from(new Set(values));
}
