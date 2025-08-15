import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-utils"

export const GET = requireAuth(async (request: NextRequest, auth) => {
  return NextResponse.json({
    success: true,
    user: auth,
  })
})
