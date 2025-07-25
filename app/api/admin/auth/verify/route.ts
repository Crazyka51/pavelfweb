import { NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth-utils"

export async function GET(request: Request) {
  const authResult = await verifyAuth(request)

  if (authResult.isAuthenticated) {
    return NextResponse.json({ isAuthenticated: true, user: authResult.user })
  } else {
    return NextResponse.json({ isAuthenticated: false }, { status: 401 })
  }
}
