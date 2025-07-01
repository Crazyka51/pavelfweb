import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ valid: false, message: "Chybí autorizační token" }, { status: 401 })
    }

    const token = authHeader.substring(7)

    // Simple token validation (in production use proper JWT verification)
    try {
      const decoded = Buffer.from(token, "base64").toString()
      const [username, timestamp] = decoded.split(":")

      // Check if token is not older than 24 hours
      const tokenAge = Date.now() - Number.parseInt(timestamp)
      const maxAge = 24 * 60 * 60 * 1000 // 24 hours

      if (tokenAge > maxAge) {
        return NextResponse.json({ valid: false, message: "Token vypršel" }, { status: 401 })
      }

      return NextResponse.json({
        valid: true,
        user: {
          username,
          displayName: username === "pavel" ? "Pavel Fišer" : "Administrátor",
        },
      })
    } catch (error) {
      return NextResponse.json({ valid: false, message: "Neplatný token" }, { status: 401 })
    }
  } catch (error) {
    return NextResponse.json({ valid: false, message: "Chyba serveru" }, { status: 500 })
  }
}
