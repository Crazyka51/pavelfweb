import { neon } from "@neondatabase/serverless";

// Konfigurace Neon klienta s potlačením browser warning
export function createNeonClient() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  return neon(process.env.DATABASE_URL, {
    disableWarningInBrowsers: true,
  });
}

// Export pro použití v server actions
export const sql = createNeonClient();
