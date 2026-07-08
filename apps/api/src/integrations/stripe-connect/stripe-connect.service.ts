import { Injectable } from "@nestjs/common";

import { getIntegrationMode, productionBehaviorDisabled, requireEnv } from "../common/integration-config";

export type StripeConnectAccountRequest = {
  shopperProfileId: string;
  email: string;
  country?: string;
};

export type StripeConnectAccount = {
  provider: "stripe";
  accountId: string;
  livemode: boolean;
};

export type StripeAccountLink = {
  provider: "stripe";
  url: string;
  expiresAt: string;
};

@Injectable()
export class StripeConnectService {
  private readonly mode = getIntegrationMode("STRIPE_CONNECT_MODE");

  async createExpressAccount(request: StripeConnectAccountRequest): Promise<StripeConnectAccount> {
    if (this.mode === "mock") {
      return {
        accountId: `acct_mock_${request.shopperProfileId}`,
        livemode: false,
        provider: "stripe"
      };
    }

    requireEnv(["STRIPE_SECRET_KEY"]);
    throw productionBehaviorDisabled("Stripe Connect");
  }

  async createAccountOnboardingLink(accountId: string): Promise<StripeAccountLink> {
    if (this.mode === "mock") {
      return {
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        provider: "stripe",
        url: `https://mock.stripe.local/connect/onboard/${accountId}`
      };
    }

    requireEnv(["STRIPE_SECRET_KEY", "STRIPE_CONNECT_REFRESH_URL", "STRIPE_CONNECT_RETURN_URL"]);
    throw productionBehaviorDisabled("Stripe Connect");
  }

  getStatus() {
    return {
      mode: this.mode,
      provider: "stripe-connect",
      productionEnabled: false
    };
  }
}
