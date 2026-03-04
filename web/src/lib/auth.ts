import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { dash } from "@better-auth/infra";
import { Pool } from "pg";

function resolveDatabaseUrl() {
  const rawUrl = process.env.DATABASE_URL ?? process.env.PSCALE_CONNECTION_URI;

  if (!rawUrl) {
    return null;
  }

  try {
    const parsed = new URL(rawUrl);

    if (parsed.searchParams.get("sslrootcert") === "system") {
      parsed.searchParams.delete("sslrootcert");
    }

    return parsed.toString();
  } catch {
    return rawUrl;
  }
}

const databaseUrl = resolveDatabaseUrl();

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL or PSCALE_CONNECTION_URI is required for Better Auth.",
  );
}

const authDatabasePool = new Pool({
  connectionString: databaseUrl,
});

function normalizeOrigin(value: string | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  const withProtocol =
    trimmed.startsWith("http://") || trimmed.startsWith("https://")
      ? trimmed
      : `https://${trimmed}`;

  try {
    return new URL(withProtocol).origin;
  } catch {
    return null;
  }
}

const deploymentOrigin =
  normalizeOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
  normalizeOrigin(process.env.VERCEL_URL);

const configuredOrigins = [
  normalizeOrigin(process.env.BETTER_AUTH_URL),
  normalizeOrigin(process.env.NEXT_PUBLIC_BETTER_AUTH_URL),
  deploymentOrigin,
  "http://localhost:3000",
].filter((origin): origin is string => Boolean(origin));

const baseUrl =
  normalizeOrigin(process.env.BETTER_AUTH_URL) ??
  normalizeOrigin(process.env.NEXT_PUBLIC_BETTER_AUTH_URL) ??
  deploymentOrigin ??
  "http://localhost:3000";

const betterAuthApiKey = process.env.BETTER_AUTH_API_KEY?.trim();

export const auth = betterAuth({
  appName: "Luchor",
  baseURL: baseUrl,
  trustedOrigins: configuredOrigins,
  database: authDatabasePool,
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    nextCookies(),
    dash({
      apiKey: betterAuthApiKey,
    }),
  ],
});
