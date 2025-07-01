import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production"

// Přihlašovací údaje - v produkci by měly být v databázi s hashovanými hesly
const ADMIN_CREDENTIALS = {
  pavel: "test123",
  admin: "admin123",
}

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    console.log("🔐 Login attempt:", {
      username,
      hasPassword: !!password,
      timestamp: new Date().toISOString(),
    })

    // Validace vstupních dat
    if (!username || !password) {
      console.log("❌ Missing credentials")
      return NextResponse.json({ error: "Uživatelské jméno a heslo jsou povinné" }, { status: 400 })
    }

    // Kontrola přihlašovacích údajů
    const expectedPassword = ADMIN_CREDENTIALS[username as keyof typeof ADMIN_CREDENTIALS]
    if (!expectedPassword || expectedPassword !== password) {
      console.log("❌ Invalid credentials for user:", username)
      return NextResponse.json({ error: "Neplatné přihlašovací údaje" }, { status: 401 })
    }

    // Vytvoření JWT tokenu
    const tokenPayload = {
      username,
      role: "admin",
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hodin
    }

    const token = jwt.sign(tokenPayload, JWT_SECRET)

    console.log("✅ Login successful for user:", username)

    // Vytvoření response s HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      message: "Přihlášení úspěšné",
      user: {
        username,
        role: "admin",
        displayName: username === "pavel" ? "Pavel Fišer" : "Administrátor",
      },
    })

    // Nastavení HTTP-only cookie
    response.cookies.set("admin-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60, // 24 hodin
      path: "/",
    })

    return response
  } catch (error) {
    console.error("💥 Login error:", error)
    return NextResponse.json({ error: "Chyba při přihlašování" }, { status: 500 })
  }
}
