import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { SignJWT, jwtVerify } from "jose"

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key-for-development"
const key = new TextEncoder().encode(JWT_SECRET)

export interface Session {
  user: {
    id: string
    username: string
    role: string
  }
  expires: string
}

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(key)
}

export async function decrypt(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ["HS256"],
  })
  return payload
}

export async function validateRequest(): Promise<{ user: any; session: any } | { user: null; session: null }> {
  const sessionCookie = cookies().get("session")?.value

  if (!sessionCookie) {
    return { user: null, session: null }
  }

  try {
    const payload = await decrypt(sessionCookie)

    if (!payload || (typeof payload.exp === "number" && payload.exp * 1000 < Date.now())) {
      return { user: null, session: null }
    }

    return {
      user: {
        id: payload.userId,
        username: payload.username,
        role: payload.role,
      },
      session: {
        id: sessionCookie,
        expires: new Date(payload.exp * 1000).toISOString(),
      },
    }
  } catch (error) {
    console.error("Session validation error:", error)
    return { user: null, session: null }
  }
}

export async function signOut(): Promise<void> {
  cookies().set("session", "", { expires: new Date(0) })
  redirect("/admin")
}

export async function createSession(username: string, role = "admin"): Promise<void> {
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  const session = await encrypt({
    userId: "admin-user",
    username,
    role,
    exp: Math.floor(expires.getTime() / 1000),
  })

  cookies().set("session", session, {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  })
}
