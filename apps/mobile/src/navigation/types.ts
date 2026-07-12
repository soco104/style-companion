import type {
  BookingSummary,
  ShopperMatch,
  ShopperMatchSearchInput,
  StyleQuizInput,
  WardrobePhotoInput
} from "@style-companion/shared";

export type StyleQuizDraft = Omit<StyleQuizInput, "customerProfileId">;

export type RootStackParamList = {
  Welcome: undefined;
  Auth: undefined;
  RoleSelection: { userId: string };
  CustomerStyleQuiz: { userId: string };
  CustomerProfile: { userId: string; quizDraft: StyleQuizDraft };
  ShopperProfileCreation: { userId: string };
  ShopperProfileEdit: { shopperProfileId: string; userId: string };
  ShopperMatchList: { customerProfileId: string; initialSearch?: ShopperMatchSearchInput };
  ShopperDetail: { customerProfileId: string; shopper: ShopperMatch };
  ShopperPublicPreview: { shopperProfileId?: string };
  BookingRequest: { customerProfileId: string; shopper: ShopperMatch };
  BookingStatus: { booking: BookingSummary; shopper: ShopperMatch; customerProfileId: string };
  ChatPlaceholder: { booking: BookingSummary; shopper: ShopperMatch };
  WardrobeGallery: {
    bookingId?: string;
    canAdd?: boolean;
    ownerRole: WardrobePhotoInput["uploadedByRole"];
    readOnly?: boolean;
    title?: string;
    userId?: string;
    visibility?: WardrobePhotoInput["visibility"];
  };
  WardrobePhotoForm: {
    bookingId?: string;
    ownerRole: WardrobePhotoInput["uploadedByRole"];
    userId: string;
    visibility?: WardrobePhotoInput["visibility"];
  };
  Review: { booking: BookingSummary; shopper: ShopperMatch; customerProfileId: string };
  Account: undefined;
};
