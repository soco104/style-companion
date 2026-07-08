export type VerifiedFirebaseUser = {
  uid: string;
  email?: string;
  phoneNumber?: string;
  name?: string;
  claims: Record<string, unknown>;
  provider: "firebase";
};
