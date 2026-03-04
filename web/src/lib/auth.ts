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

const configuredOrigins = [
  process.env.BETTER_AUTH_URL,
  process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
  "http://localhost:3000",
].filter((origin): origin is string => Boolean(origin));

export const auth = betterAuth({
  appName: "Luchor",
  baseURL:
    process.env.BETTER_AUTH_URL ??
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL ??
    "http://localhost:3000",
  trustedOrigins: configuredOrigins,
  database: authDatabasePool,
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    nextCookies(),
    dash({
      apiKey: process.env.BETTER_AUTH_API_KEY,
    }),
  ],
});
