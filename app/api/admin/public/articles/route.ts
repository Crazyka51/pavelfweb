<<<<<<< HEAD
import { articleService } from "@/lib/article-service";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const page = Number.parseInt(url.searchParams.get("page") || "1", 10);
    const limit = Number.parseInt(url.searchParams.get("limit") || "10", 10);

    const articles = await articleService.getArticles({ 
      isPublished: true,
      limit
    });

    // For pagination, total and hasMore can be added if supported by service
    return new Response(
      JSON.stringify({ articles, page, limit }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error fetching public articles:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch articles" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
=======
import { type NextRequest, NextResponse } from "next/server"
import { getPublishedArticles } from "@/lib/services/article-service"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = Number.parseInt(searchParams.get("page") || "1", 10)
    const limit = Number.parseInt(searchParams.get("limit") || "10", 10)

    const { articles, total, hasMore } = await getPublishedArticles(page, limit)

    return NextResponse.json({ articles, total, hasMore }, { status: 200 })
  } catch (error) {
    console.error("Error fetching public articles:", error)
    // Return an empty array and false for hasMore on error to prevent client crashes
    return NextResponse.json(
      { articles: [], total: 0, hasMore: false, message: "Failed to load articles." },
      { status: 500 },
    )
>>>>>>> e2ce699b71320c848c521e54fad10a96370f4230
  }
}
