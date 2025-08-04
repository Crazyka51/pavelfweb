import { type NextRequest, NextResponse } from "next/server"
import { createSession, comparePasswords } from "@/lib/auth-utils-new"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  const { username, password } = await req.json()

  try {
    // Najdi uživatele podle jména (username se mapuje na name field)
    const user = await prisma.user.findFirst({
      where: {
        name: {
          contains: username,
          mode: 'insensitive'
        }
      }
    })

    if (!user) {
      return NextResponse.json({ message: "Nesprávné uživatelské jméno nebo heslo." }, { status: 401 })
    }

    // Ověř heslo pomocí comparePasswords
    const isValidPassword = await comparePasswords(password, user.password)
    
    if (!isValidPassword) {
      return NextResponse.json({ message: "Nesprávné uživatelské jméno nebo heslo." }, { status: 401 })
    }

    // Vytvoř session s daty z databáze
    await createSession(user.id, user.name || username, user.role)

    return NextResponse.json({ message: "Login successful" }, { status: 200 })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ message: "Server error during login." }, { status: 500 })
  }
}
