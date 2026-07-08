import type { Request } from "express";

import type { VerifiedFirebaseUser } from "./firebase-auth.types";

export type AuthenticatedRequest = Request & {
  auth?: VerifiedFirebaseUser;
};
