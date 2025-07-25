import { neon } from "@neondatabase/serverless"
import type { NeonQueryFunction } from "@neondatabase/serverless"

// Ensure DATABASE_URL is set in your environment variables
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in environment variables.")
}

// Create a singleton instance of the Neon SQL client
// This prevents multiple connections in serverless environments
let sql: NeonQueryFunction<false, false>

if (process.env.NODE_ENV === "production") {
  sql = neon(process.env.DATABASE_URL)
} else {
  // In development, use a global variable to preserve the client across hot reloads
  if (!(global as any)._neonSql) {
    ;(global as any)._neonSql = neon(process.env.DATABASE_URL)
  }
  sql = (global as any)._neonSql
}

export { sql }

// Example usage (optional, for demonstration)
export async function testDatabaseConnection() {
  try {
    const result = await sql`SELECT 1+1 AS result;`
    console.log("Database connection successful:", result[0].result)
    return true
  } catch (error) {
    console.error("Database connection failed:", error)
    return false
  }
}
