import type { Session, ShopperProfile } from "./types";

let currentSession: Session | null = null;

export function getCurrentSession() {
  return currentSession;
}

export function getAuthToken() {
  return currentSession?.token;
}

export function setCurrentSession(session: Session) {
  currentSession = session;
}

export function setCurrentShopperProfile(profile: ShopperProfile) {
  if (!currentSession) {
    return;
  }

  currentSession = {
    ...currentSession,
    user: {
      ...currentSession.user,
      shopperProfile: {
        id: profile.id,
        headline: profile.headline
      }
    }
  };
}
