import { createAuthClient } from "better-auth/react";
import { dashClient } from "@better-auth/infra/client";

export const authClient = createAuthClient({
  // Always use same-origin in browser to avoid cross-origin misconfiguration in production.
  baseURL:
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? "http://localhost:3000",
  plugins: [dashClient()],
});
