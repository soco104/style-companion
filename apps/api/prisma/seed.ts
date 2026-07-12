import {
  BookingStatus,
  ModerationStatus,
  PaymentProvider,
  PaymentStatus,
  PrismaClient,
  SafetyReportCategory,
  SafetyReportStatus,
  WardrobePhotoUploadedByRole,
  WardrobePhotoVisibility,
  UploadedMediaPurpose,
  UploadedMediaType,
  UserRole
} from "@prisma/client";

const prisma = new PrismaClient();

const daysFromNow = (days: number, hour: number) => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  date.setUTCHours(hour, 0, 0, 0);
  return date;
};

async function clearDatabase() {
  await prisma.reviewResponse.deleteMany();
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.chatThread.deleteMany();
  await prisma.uploadedMedia.deleteMany();
  await prisma.wardrobePhoto.deleteMany();
  await prisma.safetyReport.deleteMany();
  await prisma.bookingStatusHistory.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.shopperPricingPackage.deleteMany();
  await prisma.shopperStylePreference.deleteMany();
  await prisma.availabilitySlot.deleteMany();
  await prisma.shopperSpecialty.deleteMany();
  await prisma.styleQuizResponse.deleteMany();
  await prisma.customerProfile.deleteMany();
  await prisma.shopperProfile.deleteMany();
  await prisma.user.deleteMany();
}

async function main() {
  await clearDatabase();

  const admin = await prisma.user.create({
    data: {
      email: "admin@stylecompanion.test",
      name: "Avery Admin",
      role: UserRole.ADMIN
    }
  });

  const customerUser = await prisma.user.create({
    data: {
      email: "customer@stylecompanion.test",
      name: "Maya Customer",
      phone: "+15550101010",
      role: UserRole.CUSTOMER,
      customerProfile: {
        create: {
          city: "Nashville",
          state: "TN",
          bio: "Refreshing a work wardrobe after a career change.",
          pronouns: "she/her"
        }
      }
    },
    include: {
      customerProfile: true
    }
  });

  const shopperUser = await prisma.user.create({
    data: {
      email: "shopper@stylecompanion.test",
      name: "Jordan Style",
      phone: "+15550202020",
      role: UserRole.SHOPPER,
      shopperProfile: {
        create: {
          headline: "Practical wardrobe edits for busy professionals",
          bio: "I help clients build flexible outfits they can recreate on their own.",
          city: "Nashville",
          state: "TN",
          hourlyRateCents: 8500,
          serviceRadiusMiles: 20,
          averageRating: 5,
          reviewCount: 1
        }
      }
    },
    include: {
      shopperProfile: true
    }
  });

  const shopperUserTwo = await prisma.user.create({
    data: {
      email: "shopper2@stylecompanion.test",
      name: "Riley Wardrobe",
      phone: "+15550303030",
      role: UserRole.SHOPPER,
      shopperProfile: {
        create: {
          headline: "Warm, practical styling for everyday closets",
          bio: "I focus on low-pressure wardrobe audits and realistic outfit formulas.",
          city: "Nashville",
          state: "TN",
          hourlyRateCents: 7000,
          serviceRadiusMiles: 12,
          averageRating: 4.75,
          reviewCount: 2
        }
      }
    },
    include: {
      shopperProfile: true
    }
  });

  const customerProfile = customerUser.customerProfile;
  const shopperProfile = shopperUser.shopperProfile;
  const shopperProfileTwo = shopperUserTwo.shopperProfile;

  if (!customerProfile || !shopperProfile || !shopperProfileTwo) {
    throw new Error("Seed profiles were not created.");
  }

  await prisma.shopperSpecialty.createMany({
    data: [
      { shopperProfileId: shopperProfile.id, name: "Workwear" },
      { shopperProfileId: shopperProfile.id, name: "Capsule Wardrobes" },
      { shopperProfileId: shopperProfile.id, name: "In-Person Shopping" }
    ]
  });

  await prisma.shopperSpecialty.createMany({
    data: [
      { shopperProfileId: shopperProfileTwo.id, name: "Closet Edits" },
      { shopperProfileId: shopperProfileTwo.id, name: "Budget Shopping" }
    ]
  });

  const closetRefreshPackage = await prisma.shopperPricingPackage.create({
    data: {
      shopperProfileId: shopperProfile.id,
      title: "Closet Refresh",
      sessionCount: 2,
      pricePerSessionCents: 8500,
      totalPriceCents: 17000,
      description: "Two focused sessions for editing, outfit planning, and a targeted shopping list.",
      isActive: true
    }
  });

  await prisma.shopperPricingPackage.createMany({
    data: [
      {
        shopperProfileId: shopperProfile.id,
        title: "Single Shopping Session",
        sessionCount: 1,
        pricePerSessionCents: 9500,
        totalPriceCents: 9500,
        description: "A single guided shopping session for a specific event or wardrobe gap.",
        isActive: true
      },
      {
        shopperProfileId: shopperProfile.id,
        title: "Retired Intro Package",
        sessionCount: 1,
        pricePerSessionCents: 6500,
        totalPriceCents: 6500,
        description: "Inactive sample package used for validation testing.",
        isActive: false
      },
      {
        shopperProfileId: shopperProfileTwo.id,
        title: "Wardrobe Audit",
        sessionCount: 1,
        pricePerSessionCents: 7000,
        totalPriceCents: 7000,
        description: "A practical closet review with outfit notes and donation guidance.",
        isActive: true
      }
    ]
  });

  await prisma.shopperStylePreference.createMany({
    data: [
      {
        shopperProfileId: shopperProfile.id,
        styleTags: ["tailored", "capsule", "workwear"],
        preferredBrands: ["Madewell", "Everlane", "Quince"],
        avoidedStyles: ["dry clean only", "uncomfortable heels"],
        notes: "Best for customers who want polished outfits with repeatable formulas."
      },
      {
        shopperProfileId: shopperProfileTwo.id,
        styleTags: ["casual", "size-inclusive", "budget-conscious"],
        preferredBrands: ["Target", "Old Navy", "Nordstrom Rack"],
        avoidedStyles: ["high maintenance fabrics"],
        notes: "Best for customers who want approachable outfit building from pieces they already own."
      }
    ]
  });

  await prisma.availabilitySlot.createMany({
    data: [
      {
        shopperProfileId: shopperProfile.id,
        startsAt: daysFromNow(3, 15),
        endsAt: daysFromNow(3, 18),
        timezone: "America/Chicago"
      },
      {
        shopperProfileId: shopperProfile.id,
        startsAt: daysFromNow(5, 16),
        endsAt: daysFromNow(5, 19),
        timezone: "America/Chicago"
      },
      {
        shopperProfileId: shopperProfileTwo.id,
        startsAt: daysFromNow(4, 14),
        endsAt: daysFromNow(4, 17),
        timezone: "America/Chicago"
      },
      {
        shopperProfileId: shopperProfileTwo.id,
        startsAt: daysFromNow(-7, 15),
        endsAt: daysFromNow(-7, 17),
        timezone: "America/Chicago",
        isRecurring: true,
        recurrenceRule: "FREQ=WEEKLY;BYDAY=MO,WE;INTERVAL=1"
      }
    ]
  });

  await prisma.styleQuizResponse.create({
    data: {
      customerProfileId: customerProfile.id,
      styleGoals: {
        priorities: ["polished work outfits", "easy weekend staples"],
        avoid: ["dry clean only", "high heels"]
      },
      preferredOccasions: ["work", "casual weekends"],
      budgetMinCents: 25000,
      budgetMaxCents: 60000,
      colorPreferences: ["navy", "cream", "olive"],
      fitConcerns: "Petite sizing and comfortable waistbands",
      sizingNotes: "Usually XS/S tops and petite trousers",
      additionalNotes: "Prefers stores with easy returns."
    }
  });

  const booking = await prisma.booking.create({
    data: {
      customerProfileId: customerProfile.id,
      shopperProfileId: shopperProfile.id,
      pricingPackageId: closetRefreshPackage.id,
      status: BookingStatus.COMPLETED,
      scheduledStartAt: daysFromNow(-7, 16),
      scheduledEndAt: daysFromNow(-7, 18),
      timezone: "America/Chicago",
      locationName: "Green Hills Mall",
      city: "Nashville",
      state: "TN",
      postalCode: "37215",
      goal: "Build polished work outfits that mix and match.",
      budgetCents: 60000,
      customerNotes: "Looking for office outfits that mix and match.",
      shopperNotes: "Client liked structured jackets and soft knits.",
      totalPriceCents: 17000,
      completedAt: daysFromNow(-7, 18)
    }
  });

  await prisma.bookingStatusHistory.createMany({
    data: [
      {
        bookingId: booking.id,
        status: BookingStatus.REQUESTED,
        changedByUserId: customerUser.id,
        reason: "Initial local development booking request"
      },
      {
        bookingId: booking.id,
        status: BookingStatus.ACCEPTED,
        changedByUserId: shopperUser.id,
        reason: "Shopper accepted the request"
      },
      {
        bookingId: booking.id,
        status: BookingStatus.COMPLETED,
        changedByUserId: shopperUser.id,
        reason: "Session completed"
      }
    ]
  });

  await prisma.payment.create({
    data: {
      bookingId: booking.id,
      customerProfileId: customerProfile.id,
      amountCents: 17000,
      status: PaymentStatus.PAID,
      provider: PaymentProvider.STRIPE,
      providerPaymentIntentId: "pi_dev_style_companion_seed",
      paidAt: daysFromNow(-7, 18)
    }
  });

  const review = await prisma.review.create({
    data: {
      bookingId: booking.id,
      customerProfileId: customerProfile.id,
      shopperProfileId: shopperProfile.id,
      rating: 5,
      body: "Jordan made shopping feel calm and taught me how to build outfits from each piece.",
      moderationStatus: ModerationStatus.APPROVED,
      moderationNotes: "Local development seed review.",
      moderatedAt: daysFromNow(-6, 12),
      moderatedByUserId: admin.id,
      publishedAt: daysFromNow(-6, 13)
    }
  });

  await prisma.reviewResponse.create({
    data: {
      reviewId: review.id,
      shopperProfileId: shopperProfile.id,
      body: "Thanks, Maya. I loved helping you build a flexible work capsule.",
      moderationStatus: ModerationStatus.APPROVED,
      moderatedAt: daysFromNow(-6, 14),
      moderatedByUserId: admin.id,
      publishedAt: daysFromNow(-6, 15)
    }
  });

  await prisma.chatThread.create({
    data: {
      bookingId: booking.id,
      customerProfileId: customerProfile.id,
      shopperProfileId: shopperProfile.id,
      lastMessageAt: daysFromNow(-7, 19)
    }
  });

  await prisma.uploadedMedia.createMany({
    data: [
      {
        uploadedByUserId: shopperUser.id,
        shopperProfileId: shopperProfile.id,
        url: "https://example.test/media/jordan-portfolio-1.jpg",
        storageKey: "dev/shopper-portfolio/jordan-1.jpg",
        mediaType: UploadedMediaType.IMAGE,
        purpose: UploadedMediaPurpose.PROFILE,
        caption: "Sample capsule wardrobe board",
        moderationStatus: ModerationStatus.APPROVED
      },
      {
        uploadedByUserId: customerUser.id,
        bookingId: booking.id,
        url: "https://example.test/media/maya-reference-1.jpg",
        storageKey: "dev/booking-reference/maya-1.jpg",
        mediaType: UploadedMediaType.IMAGE,
        purpose: UploadedMediaPurpose.BOOKING_REFERENCE,
        caption: "Reference outfit for the shopping session",
        moderationStatus: ModerationStatus.PENDING
      }
    ]
  });

  await prisma.wardrobePhoto.createMany({
    data: [
      {
        userId: customerUser.id,
        bookingId: booking.id,
        url: "https://example.test/media/wardrobe/maya-navy-blazer.jpg",
        storageKey: "dev/wardrobe/maya-navy-blazer.jpg",
        title: "Navy blazer",
        caption: "Current work blazer to build outfits around.",
        category: "outerwear",
        visibility: WardrobePhotoVisibility.BOOKING_SHARED,
        uploadedByRole: WardrobePhotoUploadedByRole.CUSTOMER,
        tags: ["blazer", "workwear", "navy"],
        metadata: {
          originalFilename: "navy-blazer.jpg",
          source: "seed-placeholder"
        },
        moderationStatus: ModerationStatus.APPROVED
      },
      {
        userId: customerUser.id,
        url: "https://example.test/media/wardrobe/maya-green-dress.jpg",
        storageKey: "dev/wardrobe/maya-green-dress.jpg",
        title: "Green dress",
        caption: "Comfortable dress that needs styling ideas.",
        category: "dresses",
        visibility: WardrobePhotoVisibility.PRIVATE,
        uploadedByRole: WardrobePhotoUploadedByRole.CUSTOMER,
        tags: ["dress", "olive"],
        metadata: {
          originalFilename: "green-dress.jpg",
          source: "seed-placeholder"
        },
        moderationStatus: ModerationStatus.PENDING
      },
      {
        userId: shopperUser.id,
        url: "https://example.test/media/wardrobe/jordan-capsule-board.jpg",
        storageKey: "dev/wardrobe/jordan-capsule-board.jpg",
        title: "Capsule board",
        caption: "Example outfit board for public shopper profile.",
        category: "portfolio",
        visibility: WardrobePhotoVisibility.PUBLIC_PROFILE,
        uploadedByRole: WardrobePhotoUploadedByRole.SHOPPER,
        tags: ["portfolio", "capsule", "workwear"],
        metadata: {
          originalFilename: "capsule-board.jpg",
          source: "seed-placeholder"
        },
        moderationStatus: ModerationStatus.APPROVED
      }
    ]
  });

  await prisma.safetyReport.create({
    data: {
      reporterUserId: customerUser.id,
      reportedUserId: shopperUser.id,
      bookingId: booking.id,
      assignedAdminId: admin.id,
      category: SafetyReportCategory.OTHER,
      description: "Resolved sample report for local development workflows.",
      status: SafetyReportStatus.RESOLVED,
      resolutionNotes: "Seed data only; no action required.",
      resolvedAt: daysFromNow(-5, 12)
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
