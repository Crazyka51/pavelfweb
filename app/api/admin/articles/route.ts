import { type NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";
import { articleService } from "@/lib/article-service";
import { db } from "@/lib/database";
import { adminUsers } from "@/lib/schema";
import { eq } from "drizzle-orm";

export const GET = requireAuth(async (request: NextRequest, authResult: any) => {

  try {
    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const category = searchParams.get("category");
    const published = searchParams.get("published");
    const search = searchParams.get("search");

    const filters: any = {
      limit,
      offset: (page - 1) * limit,
    };

    if (category && category !== "all") {
      filters.category = category;
    }

    if (published !== null && published !== undefined) {
      filters.status = published === "true" ? "PUBLISHED" : "DRAFT";
    }

    if (search) {
      filters.search = search;
    }

    const articles = await articleService.getArticles(filters);
    const total = await articleService.getTotalArticleCount(filters); // Získání celkového počtu z DB

    return NextResponse.json({
      success: true,
      data: {
        articles,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Articles GET error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Chyba při načítání článků",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
});

export const POST = requireAuth(async (request: NextRequest, authResult: any) => {
  try {
    // Nyní máme autentizovaného uživatele v authResult
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

    // Validace povinných polí
    if (!articleData.title || !articleData.content) {
      return NextResponse.json(
        {
          success: false,
          error: "Název a obsah jsou povinné",
        },
        { status: 400 },
      );
    }

    // Ověření existence autora
    const author = await db.select().from(adminUsers).where(eq(adminUsers.id, authResult.userId));
    if (!author || author.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Uživatel (autor) nebyl nalezen.",
        },
        { status: 404 },
      );
    }

    // Příprava dat pro vytvoření článku
    const newArticleData = {
      title: articleData.title,
      slug: articleData.slug || articleData.title.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, '') + '-' + Date.now().toString().slice(-4),
      content: articleData.content,
      excerpt: articleData.excerpt || articleData.content.replace(/<[^>]*>/g, "").substring(0, 150) + "...",
      categoryId: articleData.categoryId,
      tags: articleData.tags || [],
      status: (articleData.status || (articleData.published ? "PUBLISHED" : "DRAFT")) as "DRAFT" | "PUBLISHED" | "ARCHIVED",
      imageUrl: articleData.imageUrl,
      publishedAt: articleData.status === "PUBLISHED" || articleData.published ? new Date() : null,
      isFeatured: articleData.isFeatured || false,
      authorId: authResult.userId,
      metaTitle: articleData.metaTitle,
      metaDescription: articleData.metaDescription,
    };


    const savedArticle = await articleService.createArticle(newArticleData);

    return NextResponse.json({
      success: true,
      message: "Článek byl úspěšně vytvořen",
      data: savedArticle,
    });
  } catch (error) {
    console.error("Articles POST error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Chyba při vytváření článku",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
});
