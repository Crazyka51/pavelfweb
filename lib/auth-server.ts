import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import type { User, Session } from "lucia" // Assuming Lucia types

// Placeholder for Lucia setup if not already present
// In a real app, you'd have a lucia.ts file like:
// import { Lucia } from "lucia";
// import { NeonHTTPAdapter } from "@lucia-auth/adapter-neon";
// import { sql } from "./database";
// const adapter = new NeonHTTPAdapter(sql, {
//   user: "users",
//   session: "user_sessions",
// });
// export const lucia = new Lucia(adapter, {
//   sessionCookie: {
//     expires: false,
//     attributes: {
//       secure: process.env.NODE_ENV === "production",
//     },
//   },
//   getUserAttributes: (attributes) => {
//     return {
//       username: attributes.username,
//       email: attributes.email,
//     };
//   },
// });
// declare module "lucia" {
//   interface Register {
//     Lucia: typeof lucia;
//     DatabaseUserAttributes: DatabaseUserAttributes;
//   }
// }
// interface DatabaseUserAttributes {
//   username: string;
//   email: string;
// }

// Mock Lucia for demonstration if not fully set up
const lucia = {
  sessionCookie: { name: "session" },
  validateSession: async (
    sessionId: string | null,
  ): Promise<{ user: User; session: Session } | { user: null; session: null }> => {
    if (!sessionId) {
      return { user: null, session: null }
    }
    // Simulate session validation
    if (sessionId === "valid_session_id") {
      return {
        user: { userId: "user123", username: "admin", email: "admin@example.com" } as User,
        session: {
          sessionId: "valid_session_id",
          userId: "user123",
          expiresAt: new Date(Date.now() + 3600000),
          fresh: false,
        } as Session,
      }
    }
    return { user: null, session: null }
  },
  createSession: async (userId: string) => {
    // Simulate session creation
    return { sessionId: "valid_session_id", userId, expiresAt: new Date(Date.now() + 3600000) } as Session
  },
  invalidateSession: async (sessionId: string) => {
    // Simulate session invalidation
    console.log(`Session ${sessionId} invalidated.`)
  },
  createSessionCookie: (sessionId: string) => ({
    name: "session",
    value: sessionId,
    attributes: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax" as const,
      path: "/",
    }
  })
}

export async function validateRequest(): Promise<{ user: User; session: Session } | { user: null; session: null }> {
  const sessionId = cookies().get(lucia.sessionCookie.name)?.value ?? null
  if (!sessionId) {
    return { user: null, session: null }
  }

  const { session, user } = await lucia.validateSession(sessionId)
  try {
    if (session && session.fresh) {
      const sessionCookie = lucia.createSessionCookie(session.sessionId)
      cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
    }
    if (!session) {
      const sessionCookie = lucia.createSessionCookie("")
      cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
    }
  } catch (e) {
    // next.js throws error when attempting to set cookie when rendering page
  }
  return { user, session }
}

export async function signOut(): Promise<void> {
  const { session } = await validateRequest()
  if (!session) {
    return
  }

  await lucia.invalidateSession(session.sessionId)

  const sessionCookie = lucia.createSessionCookie("")
  cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
  return redirect("/admin/login")
}

export async function verifyAuth() {
  const { user, session } = await validateRequest()
  if (!user || !session) {
    throw new Error("Unauthorized")
  }
  return { user, session }
}