const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")

const prisma = new PrismaClient()

async function testAuth() {
  try {
    console.log("🔍 Testování databázového připojení...")

    // Test databázového připojení
    await prisma.$connect()
    console.log("✅ Databáze připojena")

    // Najdi uživatele pavel
    console.log("🔍 Hledám uživatele pavel...")
    const user = await prisma.adminUser.findUnique({
      where: { username: "pavel" },
    })

    if (!user) {
      console.log("❌ Uživatel pavel nenalezen")
      return
    }

    console.log("✅ Uživatel pavel nalezen:", {
      id: user.id,
      username: user.username,
      email: user.email,
      hasPassword: !!user.passwordHash,
      isActive: user.isActive,
    })

    // Test hesla
    if (user.passwordHash) {
      console.log('🔍 Testování hesla "admin123"...')
      const isValid = await bcrypt.compare("admin123", user.passwordHash)
      console.log(isValid ? "✅ Heslo je správné" : "❌ Heslo je nesprávné")
    } else {
      console.log("❌ Uživatel nemá nastavené heslo")
    }

    // Test environment variables
    console.log("🔍 Kontrola environment variables...")
    console.log("DATABASE_URL:", process.env.DATABASE_URL ? "✅ Nastaveno" : "❌ Chybí")
    console.log("JWT_SECRET:", process.env.JWT_SECRET ? "✅ Nastaveno" : "❌ Chybí")
    console.log("JWT_REFRESH_SECRET:", process.env.JWT_REFRESH_SECRET ? "✅ Nastaveno" : "❌ Chybí")
  } catch (error) {
    console.error("❌ Chyba při testování:", error.message)
  } finally {
    await prisma.$disconnect()
  }
}

testAuth()
