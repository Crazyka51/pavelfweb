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
  }
}
