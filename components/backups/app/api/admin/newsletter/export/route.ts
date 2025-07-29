import { type NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"
import jwt from "jsonwebtoken"

const SUBSCRIBERS_FILE = path.join(process.cwd(), "data", "newsletter-subscribers.json")
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production"

interface Subscriber {
  id: string
  email: string
  subscribedAt: string
  isActive: boolean
  source: string
  firstName?: string
  lastName?: string
}

// Helper function to verify admin token
async function verifyAdminToken(request: NextRequest): Promise<boolean> {
  try {
    const authHeader = request.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return false
    }

    const token = authHeader.substring(7)
    jwt.verify(token, JWT_SECRET)
    return true
  } catch (error) {
    return false
  }
}

// Helper function to read subscribers
async function readSubscribers(): Promise<Subscriber[]> {
  try {
    const data = await fs.readFile(SUBSCRIBERS_FILE, "utf8")
    return JSON.parse(data)
  } catch (error) {
    console.error("Error reading subscribers file:", error)
    return []
  }
}

// GET - Export subscribers as CSV
export async function GET(request: NextRequest) {
  const isAdmin = await verifyAdminToken(request)
  if (!isAdmin) {
    return NextResponse.json({ message: "Neautorizovaný přístup" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get("format") || "csv"
    const activeOnly = searchParams.get("activeOnly") === "true"

    const subscribers = await readSubscribers()
    const exportData = activeOnly ? subscribers.filter((sub) => sub.isActive) : subscribers

    if (format === "csv") {
      // Generate CSV
      const csvHeaders = ["Email", "Jméno", "Příjmení", "Datum přihlášení", "Aktivní", "Zdroj"]
      const csvRows = exportData.map((sub) => [
        sub.email,
        sub.firstName || "",
        sub.lastName || "",
        new Date(sub.subscribedAt).toLocaleDateString("cs-CZ"),
        sub.isActive ? "Ano" : "Ne",
        sub.source === "web" ? "Webová stránka" : "Manuální",
      ])

      const csvContent = [csvHeaders, ...csvRows].map((row) => row.map((field) => `"${field}"`).join(",")).join("\n")

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="newsletter-subscribers-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      })
    } else if (format === "json") {
      // Generate JSON
      const jsonContent = JSON.stringify(exportData, null, 2)

      return new NextResponse(jsonContent, {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="newsletter-subscribers-${new Date().toISOString().split("T")[0]}.json"`,
        },
      })
    } else {
      return NextResponse.json({ message: "Nepodporovaný formát exportu" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error exporting subscribers:", error)
    return NextResponse.json({ message: "Chyba při exportu odběratelů" }, { status: 500 })
  }
}
