const { neon } = require("@neondatabase/serverless")
const bcrypt = require("bcryptjs")

async function testLogin() {
  try {
    console.log("[v0] Začínám test přihlášení...")

    const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL

    if (!databaseUrl) {
      console.log(
        "[v0] Dostupné env variables:",
        Object.keys(process.env).filter((key) => key.includes("DATABASE") || key.includes("POSTGRES")),
      )
      throw new Error("Žádná databázová URL není dostupná")
    }

    console.log("[v0] Připojuji k databázi...")
    const sql = neon(databaseUrl)

    // Test připojení
    const result = await sql`SELECT NOW() as current_time`
    console.log("[v0] Databáze připojena:", result[0].current_time)

    // Najdi uživatele pavel
    const users = await sql`
      SELECT id, username, email, password_hash, is_active 
      FROM admin_users 
      WHERE username = 'pavel'
    `

    if (users.length === 0) {
      console.log("[v0] Uživatel pavel nenalezen")
      return
    }

    const user = users[0]
    console.log("[v0] Nalezen uživatel:", {
      id: user.id,
      username: user.username,
      email: user.email,
      is_active: user.is_active,
      has_password: !!user.password_hash,
    })

    // Test hesla
    if (user.password_hash) {
      const isValidPassword = await bcrypt.compare("admin123", user.password_hash)
      console.log('[v0] Test hesla "admin123":', isValidPassword ? "ÚSPĚCH" : "NEÚSPĚCH")
    } else {
      console.log("[v0] Uživatel nemá nastavené heslo")
    }
  } catch (error) {
    console.error("[v0] Chyba při testu:", error.message)
  }
}

testLogin()
