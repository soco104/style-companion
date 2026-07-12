import { Module } from "@nestjs/common";

import { AuthModule } from "./auth/auth.module";
import { BookingsModule } from "./bookings/bookings.module";
import { ChatModule } from "./chat/chat.module";
import { CustomerProfilesModule } from "./customer-profiles/customer-profiles.module";
import { HealthModule } from "./health/health.module";
import { IntegrationsModule } from "./integrations/integrations.module";
import { MatchingModule } from "./matching/matching.module";
import { PaymentsModule } from "./payments/payments.module";
import { PrismaModule } from "./prisma/prisma.module";
import { ReviewsModule } from "./reviews/reviews.module";
import { SafetyReportsModule } from "./safety-reports/safety-reports.module";
import { SchedulingModule } from "./scheduling/scheduling.module";
import { ShopperPricingPackagesModule } from "./shopper-pricing-packages/shopper-pricing-packages.module";
import { ShopperProfilesModule } from "./shopper-profiles/shopper-profiles.module";
import { ShopperStylePreferencesModule } from "./shopper-style-preferences/shopper-style-preferences.module";
import { StyleQuizModule } from "./style-quiz/style-quiz.module";
import { UsersModule } from "./users/users.module";
import { WardrobePhotosModule } from "./wardrobe-photos/wardrobe-photos.module";

@Module({
  imports: [
    PrismaModule,
    IntegrationsModule,
    HealthModule,
    AuthModule,
    UsersModule,
    CustomerProfilesModule,
    ShopperProfilesModule,
    StyleQuizModule,
    MatchingModule,
    BookingsModule,
    ReviewsModule,
    PaymentsModule,
    ChatModule,
    SafetyReportsModule,
    ShopperPricingPackagesModule,
    ShopperStylePreferencesModule,
    WardrobePhotosModule,
    SchedulingModule
  ]
})
export class AppModule {}
