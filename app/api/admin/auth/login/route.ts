
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

import { type NextRequest, NextResponse } from "next/server"
import { serialize } from "cookie"
import { SignJWT } from "jose"

export async function POST(req: NextRequest) {
  const { username, password } = await req.json()

  // Basic validation (replace with actual user lookup and password hashing in production)
  const ADMIN_USERNAME = "Pavel" // Hardcoded username
  const ADMIN_PASSWORD = process.env.ADMIN_PAVEL_PASSWORD // Get password from environment variable

  if (!ADMIN_PASSWORD) {
    console.error("ADMIN_PAVEL_PASSWORD environment variable is not set.")
    return new NextResponse(JSON.stringify({ message: "Server configuration error." }), { status: 500 })
  }

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    // Generate JWT token
    const token = await new SignJWT({ username: ADMIN_USERNAME })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("2h") // Token expires in 2 hours
      .sign(
        new TextEncoder().encode(process.env.JWT_SECRET || "your-very-long-and-complex-jwt-secret-key-for-production"),
      )

    // Set cookie
    const serialized = serialize("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 2, // 2 hours
      path: "/",
    })

    return new NextResponse(JSON.stringify({ message: "Login successful" }), {
      status: 200,
      headers: { "Set-Cookie": serialized },
    })
  } else {
    return new NextResponse(JSON.stringify({ message: "Nesprávné uživatelské jméno nebo heslo." }), { status: 401 })

  }
}
