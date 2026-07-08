export type IntegrationMode = "mock" | "live";

export function getIntegrationMode(envName: string, defaultMode: IntegrationMode = "mock"): IntegrationMode {
  const value = process.env[envName]?.toLowerCase();

  if (value === "live" || value === "mock") {
    return value;
  }

  return defaultMode;
}

export function isAuthRequired() {
  return process.env.AUTH_REQUIRED === "true";
}

export function requireEnv(names: string[]) {
  const missing = names.filter((name) => !process.env[name]);

  if (missing.length > 0) {
    throw new Error(`Missing required integration environment variables: ${missing.join(", ")}`);
  }
}

export function productionBehaviorDisabled(provider: string) {
  return new Error(
    `${provider} live mode is configured, but live SDK calls are intentionally disabled in this MVP wrapper.`
  );
}
