import { type NextRequest, NextResponse } from "next/server"

const ADMIN_USERS = [
  {
    username: "pavel",
    password: "test123",
    displayName: "Pavel Fišer",
  },
  {
    username: "admin",
    password: "admin123",
    displayName: "Administrátor",
  },
]

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    // Find user
    const user = ADMIN_USERS.find((u) => u.username === username && u.password === password)

    if (!user) {
      return NextResponse.json({ message: "Neplatné přihlašovací údaje" }, { status: 401 })
    }

    // Generate simple token (in production use JWT)
    const token = Buffer.from(`${username}:${Date.now()}`).toString("base64")

    return NextResponse.json({
      token,
      user: {
        username: user.username,
        displayName: user.displayName,
      },
    })
  } catch (error) {
    return NextResponse.json({ message: "Chyba serveru" }, { status: 500 })
  }
}
