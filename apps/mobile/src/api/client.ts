import { backendClient } from "./backendClient";
import { mockClient } from "./mockClient";

const apiMode = process.env.EXPO_PUBLIC_API_MODE ?? "mock";

export const apiClient = apiMode === "backend" ? backendClient : mockClient;
