import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { serialize } from "cookie"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    // Získání hesla pro uživatele 'Pavel' z proměnných prostředí
    const ADMIN_PAVEL_PASSWORD = process.env.ADMIN_PAVEL_PASSWORD

    // Získání JWT Secret z proměnných prostředí
    const JWT_SECRET = process.env.JWT_SECRET

    if (!ADMIN_PAVEL_PASSWORD || !JWT_SECRET) {
      console.error("Missing ADMIN_PAVEL_PASSWORD or JWT_SECRET environment variable.")
      return NextResponse.json({ success: false, error: "Konfigurace serveru není kompletní." }, { status: 500 })
    }

    // Ověření uživatelského jména a hesla
    // V produkčním prostředí byste zde měli ověřovat hašované heslo z databáze
    if (username === "Pavel" && password === ADMIN_PAVEL_PASSWORD) {
      // Generování JWT tokenu
      const token = jwt.sign(
        { userId: "pavel_admin_id", username: "Pavel", role: "admin" },
        JWT_SECRET,
        { expiresIn: "1h" }, // Token vyprší za 1 hodinu
      )

      // Nastavení tokenu jako HTTP-only cookie
      const cookie = serialize("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Pouze HTTPS v produkci
        sameSite: "strict",
        maxAge: 60 * 60, // 1 hodina
        path: "/",
      })

      return NextResponse.json(
        { success: true, message: "Přihlášení úspěšné" },
        {
          status: 200,
          headers: { "Set-Cookie": cookie },
        },
      )
    } else {
      return NextResponse.json({ success: false, error: "Neplatné uživatelské jméno nebo heslo." }, { status: 401 })
    }
  } catch (error) {
    console.error("Login API error:", error)
    return NextResponse.json({ success: false, error: "Interní chyba serveru." }, { status: 500 })
  }
}
