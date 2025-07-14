import { NextResponse } from "next/server"
import { createSession } from "@/lib/auth-utils"

const ADMIN_PASSWORD = process.env.ADMIN_PAVEL_PASSWORD

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ message: "Uživatelské jméno a heslo jsou povinné." }, { status: 400 })
    }

    if (username === "pavel" && password === ADMIN_PASSWORD) {
      await createSession("pavel-id", "pavel", "admin")
      return NextResponse.json({ message: "Přihlášení úspěšné." }, { status: 200 })
    }

    return NextResponse.json({ message: "Neplatné uživatelské jméno nebo heslo." }, { status: 401 })
  } catch (error) {
    console.error("Login API error:", error)
    return NextResponse.json({ message: "Interní chyba serveru." }, { status: 500 })
  }
}
