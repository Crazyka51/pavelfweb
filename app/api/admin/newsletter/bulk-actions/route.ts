import { type NextRequest, NextResponse } from "next/server"
import { DataManager } from "@/lib/data-persistence"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production"

interface Subscriber {
  id: string
  email: string
  subscribedAt: string
  isActive: boolean
  source: string
  preferences?: {
    frequency: "daily" | "weekly" | "monthly"
    categories: string[]
  }
}

interface BulkRequest {
  operation: "activate" | "deactivate" | "delete" | "update_preferences" | "change_source"
  items: string[]
  preferences?: {
    frequency: "daily" | "weekly" | "monthly"
    categories: string[]
  }
  source?: string
}

const subscribersManager = new DataManager<Subscriber>("newsletter-subscribers")

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    try {
      jwt.verify(token, JWT_SECRET)
    } catch (error) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body: BulkRequest = await request.json()
    const { operation, items, preferences, source } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items selected" }, { status: 400 })
    }

    const subscribers = await subscribersManager.read()
    const targetSubscribers = subscribers.filter((sub: any) => items.includes(sub.email))

    if (targetSubscribers.length === 0) {
      return NextResponse.json({ error: "No matching subscribers found" }, { status: 404 })
    }

    let successCount = 0
    let failedCount = 0
    const errors: string[] = []

    for (const subscriber of targetSubscribers) {
      try {
        switch (operation) {
          case "activate":
            await subscribersManager.update(subscriber.id, {
              ...subscriber,
              isActive: true,
            })
            successCount++
            break

          case "deactivate":
            await subscribersManager.update(subscriber.id, {
              ...subscriber,
              isActive: false,
            })
            successCount++
            break

          case "delete":
            await subscribersManager.delete(subscriber.id)
            successCount++
            break

          case "update_preferences":
            if (!preferences) {
              errors.push(`Preference nejsou specifikovány pro: ${subscriber.email}`)
              failedCount++
              continue
            }
            await subscribersManager.update(subscriber.id, {
              ...subscriber,
              preferences,
            })
            successCount++
            break

          case "change_source":
            if (!source) {
              errors.push(`Zdroj není specifikován pro: ${subscriber.email}`)
              failedCount++
              continue
            }
            await subscribersManager.update(subscriber.id, {
              ...subscriber,
              source,
            })
            successCount++
            break

          default:
            errors.push(`Neznámá operace: ${operation}`)
            failedCount++
        }
      } catch (error) {
        failedCount++
        errors.push(
          `Chyba u odběratele "${subscriber.email}": ${error instanceof Error ? error.message : "Neznámá chyba"}`,
        )
      }
    }

    return NextResponse.json({
      success: successCount,
      failed: failedCount,
      errors,
      message: `Zpracováno ${successCount} odběratelů, ${failedCount} chyb`,
    })
  } catch (error) {
    console.error("Bulk newsletter operation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
