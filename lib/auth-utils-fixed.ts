import { jwtVerify, SignJWT } from "jose"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

const SECRET_KEY = process.env.JWT_SECRET
const KEY = new TextEncoder().encode(SECRET_KEY)

export type UserPayload = {
  userId: string;
  username: string;
  role: string;
}

export async function encrypt(payload: any) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h") // Token expires in 2 hours
    .sign(KEY)
}

export async function decrypt(session: string | undefined = "") {
  try {
    const { payload } = await jwtVerify(session, KEY, {
      algorithms: ["HS256"],
    })
    return payload
  } catch (error) {
    console.error("Failed to decrypt session:", error)
    return null
  }
}

export async function createSession(userId: string, username: string, role: string) {
  const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours
  const session = await encrypt({ userId, username, role, expiresAt })

  // @ts-ignore - ignorujeme typové chyby
  cookies().set("session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  })
}

export async function deleteSession() {
  // @ts-ignore - ignorujeme typové chyby
  cookies().delete("session")
}

export async function getAuthUser() {
  // @ts-ignore - ignorujeme typové chyby
  const session = cookies().get("session")?.value
  if (!session) return null
  const decrypted = await decrypt(session)
  if (!decrypted) return null
  return {
    userId: decrypted.userId as string,
    username: decrypted.username as string,
    role: decrypted.role as string,
  }
}

export async function verifyAuth(request: NextRequest) {
  const session = request.cookies.get("session")?.value
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const decrypted = await decrypt(session)
  if (!decrypted) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  // Check if session is expired
  if (decrypted.expiresAt && new Date(decrypted.expiresAt as number) < new Date()) {
    return NextResponse.json({ message: "Session expired" }, { status: 401 })
  }

  return decrypted
}

export function requireAuth(handler: Function, roles?: string[]) {
  return async (request: NextRequest, ...args: any[]) => {
    const authResult = await verifyAuth(request)

    if (authResult instanceof NextResponse) {
      return authResult // Unauthorized response from verifyAuth
    }

    if (roles && !roles.includes(authResult.role as string)) {
      return NextResponse.json({ message: "Forbidden: Insufficient role" }, { status: 403 })
    }

    // Attach user info to the request if needed by the handler
    // For Next.js Route Handlers, you might pass it as an argument or use context
    return handler(request, authResult, ...args)
  }
}
