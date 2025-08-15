import { type NextRequest, NextResponse } from "next/server"
import { authenticateUser, createSession } from "@/lib/auth-utils"

export async function POST(request: NextRequest) {
  try {
    let body
    try {
      body = await request.json()
    } catch (error) {
      console.error("JSON parse error:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON in request body",
        },
        { status: 400 },
      )
    }

    const { emailOrUsername, password } = body

    if (!emailOrUsername || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Email/username and password are required",
        },
        { status: 400 },
      )
    }

    let user
    try {
      user = await authenticateUser(emailOrUsername, password)
    } catch (dbError) {
      console.error("Database authentication error:", dbError)
      return NextResponse.json(
        {
          success: false,
          error: "Database connection error",
        },
        { status: 500 },
      )
    }

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid credentials",
        },
        { status: 401 },
      )
    }

    let session
    try {
      session = await createSession(user)
    } catch (sessionError) {
      console.error("Session creation error:", sessionError)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create session",
        },
        { status: 500 },
      )
    }

    // Vytvoření response s access tokenem
    const response = NextResponse.json({
      success: true,
      accessToken: session.accessToken,
      user: session.user,
    })

    // Nastavení refresh tokenu jako HTTP-only cookie
    response.cookies.set("refreshToken", session.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60, // 30 dní
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Login API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}
