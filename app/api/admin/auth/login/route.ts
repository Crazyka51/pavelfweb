import { type NextRequest, NextResponse } from "next/server"
import { createSession, comparePasswords } from "@/lib/auth-utils-new"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  const { username, password } = await req.json()

  try {
    // Find user in database by username (using name field)
    // Handle both exact match and partial match (e.g., "Pavel" should match "Pavel Fišer")
    const user = await prisma.user.findFirst({
      where: { 
        OR: [
          { name: username },
          { name: { startsWith: username } }
        ]
      }
    })

    if (!user) {
      return NextResponse.json({ message: "Nesprávné uživatelské jméno nebo heslo." }, { status: 401 })
    }

    // Verify password using comparePasswords function
    const isPasswordValid = await comparePasswords(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json({ message: "Nesprávné uživatelské jméno nebo heslo." }, { status: 401 })
    }

    // Create session on successful authentication
    // Use default role "admin" since User model doesn't have role field
    await createSession(user.id, user.name || username, "admin")

    return NextResponse.json({ message: "Login successful" }, { status: 200 })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ message: "Server error." }, { status: 500 })
  }
}
