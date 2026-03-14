import 'dotenv/config'
import { drizzle } from 'drizzle-orm/node-postgres'
import * as schema from './db/schema'

function resolveDatabaseUrl() {
  const rawUrl = process.env.DATABASE_URL ?? process.env.PSCALE_CONNECTION_URI

  if (!rawUrl) {
    return null
  }

  try {
    const parsed = new URL(rawUrl)

    if (parsed.searchParams.get("sslrootcert") === "system") {
      parsed.searchParams.delete("sslrootcert")
    }

    return parsed.toString()
  } catch {
    return rawUrl
  }
}

const databaseUrl = resolveDatabaseUrl()

if (!databaseUrl) {
  throw new Error("DATABASE_URL or PSCALE_CONNECTION_URI is required for DB connection.")
}

const db = drizzle(databaseUrl, { schema })

export default db
