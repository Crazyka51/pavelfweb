import { NextResponse } from "next/server"

export async function POST() {
  try {
    const response = NextResponse.json({
      success: true,
      message: "Odhlášení úspěšné",
    })

    // Smazání HTTP-only cookie
    response.cookies.set("session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
      path: "/",
    })

    return response
  } catch (error) {
    return NextResponse.json({ error: "Chyba při odhlašování" }, { status: 500 })
  }
}
