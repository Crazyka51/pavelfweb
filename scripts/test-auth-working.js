import { neon } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"

async function testAuth() {
  try {
    console.log("[v0] Spouštím test autentizace...")

    const sql = neon(process.env.DATABASE_URL)

    console.log("[v0] Databáze připojena úspěšně")

    const users = await sql`SELECT id, username, email, password_hash, is_active FROM admin_users LIMIT 5`
    console.log("[v0] Nalezeni admin uživatelé:", users.length)

    users.forEach((user) => {
      console.log(`[v0] User: ${user.username} (${user.email}) - Active: ${user.is_active}`)
      console.log(`[v0] Has password: ${user.password_hash ? "YES" : "NO"}`)
    })

    const pavel = users.find((u) => u.username === "pavel")
    if (pavel) {
      if (pavel.password_hash) {
        // Test hesla admin123
        const isValid = await bcrypt.compare("admin123", pavel.password_hash)
        console.log(`[v0] Heslo 'admin123' pro pavel: ${isValid ? "PLATNÉ" : "NEPLATNÉ"}`)

        if (!isValid) {
          // Zkusíme další běžná hesla
          const testPasswords = ["password", "pavel", "123456", "admin"]
          for (const pwd of testPasswords) {
            const valid = await bcrypt.compare(pwd, pavel.password_hash)
            if (valid) {
              console.log(`[v0] Nalezeno platné heslo: ${pwd}`)
              break
            }
          }
        }
      } else {
        console.log("[v0] Pavel nemá nastavené heslo!")
      }
    } else {
      console.log("[v0] Uživatel pavel nenalezen!")
    }
  } catch (error) {
    console.error("[v0] Chyba při testu:", error.message)
  }
}

testAuth()
