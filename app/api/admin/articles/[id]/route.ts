import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

const ARTICLES_FILE = path.join(process.cwd(), "data", "articles.json")

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

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  if (!verifyAuth(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const articles = readArticles()
  const article = articles.find((a: any) => a.id === params.id)

  if (!article) {
    return NextResponse.json({ message: "Article not found" }, { status: 404 })
  }

  return NextResponse.json(article)
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  if (!verifyAuth(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const articleData = await request.json()
    const articles = readArticles()
    const articleIndex = articles.findIndex((a: any) => a.id === params.id)

    if (articleIndex === -1) {
      return NextResponse.json({ message: "Article not found" }, { status: 404 })
    }

    articles[articleIndex] = {
      ...articles[articleIndex],
      ...articleData,
      updatedAt: new Date().toISOString(),
    }

    writeArticles(articles)

    return NextResponse.json(articles[articleIndex])
  } catch (error) {
    return NextResponse.json({ message: "Error updating article" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  if (!verifyAuth(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const articles = readArticles()
    const filteredArticles = articles.filter((a: any) => a.id !== params.id)

    if (filteredArticles.length === articles.length) {
      return NextResponse.json({ message: "Article not found" }, { status: 404 })
    }

    writeArticles(filteredArticles)

    return NextResponse.json({ message: "Article deleted successfully" })
  } catch (error) {
    return NextResponse.json({ message: "Error deleting article" }, { status: 500 })
  }
}
