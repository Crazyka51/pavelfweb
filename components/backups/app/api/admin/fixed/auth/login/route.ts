import { type NextRequest, NextResponse } from "next/server"
import { createSession } from "@/lib/auth-utils"

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
    // Create session with our auth utility
    // Používáme userId, username a role pro vytvoření tokenu
    const userId = "admin-user-id"; // V reálné aplikaci by se načetlo z databáze
    const role = "admin"; // V reálné aplikaci by se načetlo z databáze
    
    // Vytvoření session, které interně nastaví cookie
    await createSession(userId, username, role);

    return NextResponse.json({ message: "Login successful" }, { status: 200 })
  } else {
    return NextResponse.json({ message: "Nesprávné uživatelské jméno nebo heslo." }, { status: 401 })
  }
}
