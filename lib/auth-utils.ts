// Common auth utilities and types
export type { User, Session } from "lucia"

// Re-export client-side functions
export { signIn } from "./auth-client"

// Re-export server-side functions
export { validateRequest, signOut, verifyAuth } from "./auth-server"
