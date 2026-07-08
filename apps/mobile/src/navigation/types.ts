import type { BookingSummary, ShopperMatch, StyleQuizInput } from "@style-companion/shared";

export type StyleQuizDraft = Omit<StyleQuizInput, "customerProfileId">;

export type RootStackParamList = {
  Welcome: undefined;
  Auth: undefined;
  RoleSelection: { userId: string };
  CustomerStyleQuiz: { userId: string };
  CustomerProfile: { userId: string; quizDraft: StyleQuizDraft };
  ShopperProfileCreation: { userId: string };
  ShopperMatchList: { customerProfileId: string };
  ShopperDetail: { customerProfileId: string; shopper: ShopperMatch };
  BookingRequest: { customerProfileId: string; shopper: ShopperMatch };
  BookingStatus: { booking: BookingSummary; shopper: ShopperMatch; customerProfileId: string };
  ChatPlaceholder: { booking: BookingSummary; shopper: ShopperMatch };
  Review: { booking: BookingSummary; shopper: ShopperMatch; customerProfileId: string };
  Account: undefined;
};
