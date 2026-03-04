import "dotenv/config";

import { betterAuth } from "better-auth";
import { getMigrations } from "better-auth/db/migration";
import { nextCookies } from "better-auth/next-js";
import { Pool } from "pg";

function resolveDatabaseUrl() {
  const rawUrl =
    process.env.BETTER_AUTH_MIGRATION_DATABASE_URL ??
    process.env.DATABASE_URL ??
    process.env.PSCALE_CONNECTION_URI;

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
const printOnly = process.argv.includes("--print-only");

if (!databaseUrl) {
  console.error(
    "DATABASE_URL, PSCALE_CONNECTION_URI, or BETTER_AUTH_MIGRATION_DATABASE_URL is required to run Better Auth migrations.",
  );
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
});

const auth = betterAuth({
  appName: "Luchor",
  baseURL:
    process.env.BETTER_AUTH_URL ??
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL ??
    "http://localhost:3000",
  trustedOrigins: [
    process.env.BETTER_AUTH_URL,
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
    "http://localhost:3000",
  ].filter((origin) => Boolean(origin)),
  database: pool,
  emailAndPassword: {
    enabled: true,
  },
  plugins: [nextCookies()],
});

try {
  const migrations = await getMigrations(auth.options);
  const sql = await migrations.compileMigrations();

  if (sql.trim()) {
    console.log("Better Auth migration SQL:");
    console.log(sql);
  } else {
    console.log("No Better Auth migrations required.");
  }

  if (printOnly) {
    console.log("Print-only mode: no migration statements were executed.");
    process.exit(0);
  }

  await migrations.runMigrations();
  console.log("Better Auth migrations completed.");
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Better Auth migration failed: ${message}`);
  process.exit(1);
} finally {
  await pool.end();
}
