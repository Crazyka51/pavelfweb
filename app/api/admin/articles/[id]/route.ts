import { type NextRequest, NextResponse } from "next/server";
import { requireAuth, authenticateAdmin } from "@/lib/auth-utils";
import { articleService } from "@/lib/article-service";

export const PUT = requireAuth(async (request: NextRequest, { params }: { params: { id: string } }, authResult: any) => {
  try {
    if (authResult.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          error: "Nedostatečná oprávnění",
        },
        { status: 403 },
      );
    }

    const articleData = await request.json();
    // Nejprve počkáme na params
    const resolvedParams = await params;
    const articleId = resolvedParams.id;

    const updatedArticle = await articleService.updateArticle(articleId, articleData);

    if (!updatedArticle) {
      return NextResponse.json(
        {
          success: false,
          error: "Článek nebyl nalezen",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Článek byl úspěšně aktualizován",
      data: updatedArticle,
    });
  } catch (error) {
    console.error(`Articles PUT error:`, error);
    return NextResponse.json(
      {
        success: false,
        error: "Chyba při aktualizaci článku",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
});

export const GET = requireAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    // Nejprve počkáme na params
    const resolvedParams = await params;
    const article = await articleService.getArticleById(resolvedParams.id);
    if (!article) {
      return NextResponse.json({ success: false, error: "Article not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: article });
  } catch (error) {
    console.error(`Error fetching article:`, error);
    return NextResponse.json({ success: false, error: "Failed to fetch article" }, { status: 500 });
  }
});

export const DELETE = requireAuth(async (request: NextRequest, authResult: any, { params }: { params: { id: string } }) => {
  try {
    const authHeader = request.headers.get("Authorization");
    
    if (authResult.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }
    
    // Nejprve počkáme na params
    const resolvedParams = await params;
    const success = await articleService.deleteArticle(resolvedParams.id);
    if (!success) {
      return NextResponse.json({ success: false, error: "Article not found" }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, message: "Article deleted successfully" });
  } catch (error) {
    console.error(`Error deleting article:`, error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to delete article", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
});
