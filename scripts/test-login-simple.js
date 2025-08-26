const { neon } = require("@neondatabase/serverless")
const bcrypt = require("bcrypt")

async function testLogin() {
  try {
    console.log("[v0] Spouštím test přihlášení...")

    // Připojení k databázi
    const sql = neon(process.env.DATABASE_URL)
    console.log("[v0] Databáze připojena")

    // Najdeme uživatele pavel
    const users = await sql`
            SELECT username, email, password_hash, is_active 
            FROM admin_users 
            WHERE username = 'pavel'
        `

    if (users.length === 0) {
      console.log("[v0] ✗ Uživatel pavel nenalezen")
      return
    }

    const user = users[0]
    console.log("[v0] ✓ Uživatel nalezen:", user.username, user.email)

    // Testujeme heslo
    const testPassword = "admin123"
    const isValid = await bcrypt.compare(testPassword, user.password_hash)

    if (isValid) {
      console.log("[v0] ✓ Heslo je správné!")
      console.log("[v0] Můžete se přihlásit s:")
      console.log("[v0] Username: pavel")
      console.log("[v0] Password: admin123")
    } else {
      console.log("[v0] ✗ Heslo není správné")
    }
  } catch (error) {
    console.error("[v0] Chyba při testu:", error.message)
  }
}

testLogin()
