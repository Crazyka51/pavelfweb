import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

const ARTICLES_FILE = path.join(process.cwd(), "data", "articles.json")

// Ensure data directory exists
const dataDir = path.join(process.cwd(), "data")
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

// Initialize articles file if it doesn't exist
if (!fs.existsSync(ARTICLES_FILE)) {
  const initialArticles = [
    {
      id: "1",
      title: "Vítejte v novém CMS systému",
      content:
        "<p>Tento článek byl vytvořen automaticky při inicializaci systému.</p><p>Můžete ho upravit nebo smazat a vytvořit své vlastní články.</p>",
      excerpt: "Úvodní článek pro demonstraci CMS systému",
      category: "Aktuality",
      tags: ["cms", "úvod"],
      published: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      imageUrl: "",
    },
  ]
  fs.writeFileSync(ARTICLES_FILE, JSON.stringify(initialArticles, null, 2))
}

function readArticles() {
  try {
    const data = fs.readFileSync(ARTICLES_FILE, "utf8")
    return JSON.parse(data)
  } catch (error) {
    return []
  }
}

function writeArticles(articles: any[]) {
  fs.writeFileSync(ARTICLES_FILE, JSON.stringify(articles, null, 2))
}

function verifyAuth(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false
  }

  const token = authHeader.substring(7)
  try {
    const decoded = Buffer.from(token, "base64").toString()
    const [username, timestamp] = decoded.split(":")
    const tokenAge = Date.now() - Number.parseInt(timestamp)
    const maxAge = 24 * 60 * 60 * 1000 // 24 hours

    return tokenAge <= maxAge
  } catch (error) {
    return false
  }
}

export async function GET(request: NextRequest) {
  if (!verifyAuth(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const articles = readArticles()
  return NextResponse.json(articles)
}

export async function POST(request: NextRequest) {
  if (!verifyAuth(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const articleData = await request.json()
    const articles = readArticles()

    const newArticle = {
      id: Date.now().toString(),
      ...articleData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    articles.push(newArticle)
    writeArticles(articles)

    return NextResponse.json(newArticle, { status: 201 })
  } catch (error) {
    return NextResponse.json({ message: "Error creating article" }, { status: 500 })
  }
}
