import { type NextRequest, NextResponse } from "next/server";
import { DataManager } from "@/lib/data-persistence";

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  color?: string
  icon?: string
  parentId?: string
  order: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  articleCount?: number
}

const categoryManager = new DataManager<Category>("categories.json");

// Helper function to verify admin token
function verifyAdminToken(request: NextRequest): boolean {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }

  const token = authHeader.substring(7);
  try {
    const decoded = Buffer.from(token, "base64").toString();
    const [username, timestamp] = decoded.split(":");
    const tokenAge = Date.now() - Number.parseInt(timestamp);
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    return tokenAge <= maxAge;
  } catch (error) {
    return false;
  }
}

// Helper function to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .trim();
}

// Helper function to get article count for categories
async function getArticleCountForCategories(): Promise<Record<string, number>> {
  try {
    const articleManager = new DataManager<any>("articles.json");
    const articles = await articleManager.read();

    const counts: Record<string, number> = {};
    articles.forEach((article) => {
      if (article.category) {
        counts[article.category] = (counts[article.category] || 0) + 1;
      }
    });

    return counts;
  } catch (error) {
    console.error("Error getting article counts:", error);
    return {};
  }
}

// GET - Get all categories
export async function GET(request: NextRequest) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ message: "Neautorizovaný přístup" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const includeArticleCount = searchParams.get("includeArticleCount") === "true";
    const activeOnly = searchParams.get("activeOnly") === "true";

    let categories = await categoryManager.read();

    // Filter active only if requested
    if (activeOnly) {
      categories = categories.filter((cat) => cat.isActive);
    }

    // Add article counts if requested
    if (includeArticleCount) {
      const articleCounts = await getArticleCountForCategories();
      categories = categories.map((cat) => ({
        ...cat,
        articleCount: articleCounts[cat.name] || 0,
      }));
    }

    // Sort by order, then by name
    categories.sort((a, b) => {
      if (a.order !== b.order) {
        return a.order - b.order;
      }
      return a.name.localeCompare(b.name, "cs");
    });

    return NextResponse.json({
      categories,
      total: categories.length,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      {
        message: "Chyba při načítání kategorií",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// POST - Create new category
export async function POST(request: NextRequest) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ message: "Neautorizovaný přístup" }, { status: 401 });
  }

  try {
    const { name, description, color, icon, parentId, order } = await request.json();

    if (!name || name.trim() === "") {
      return NextResponse.json({ message: "Název kategorie je povinný" }, { status: 400 });
    }

    const categories = await categoryManager.read();
    const slug = generateSlug(name);

    // Check if category with same name or slug already exists
    const existingCategory = categories.find(
      (cat) => cat.name.toLowerCase() === name.toLowerCase() || cat.slug === slug,
    );

    if (existingCategory) {
      return NextResponse.json({ message: "Kategorie s tímto názvem již existuje" }, { status: 400 });
    }

    // Validate parent category if provided
    if (parentId) {
      const parentCategory = categories.find((cat) => cat.id === parentId);
      if (!parentCategory) {
        return NextResponse.json({ message: "Nadřazená kategorie nebyla nalezena" }, { status: 400 });
      }
    }

    const newCategory: Category = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      slug,
      description: description?.trim(),
      color: color || "#3B82F6",
      icon: icon?.trim(),
      parentId: parentId || undefined,
      order: order || categories.length,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await categoryManager.create(newCategory);

    return NextResponse.json(
      {
        message: "Kategorie byla úspěšně vytvořena",
        category: newCategory,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      {
        message: "Chyba při vytváření kategorie",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// PUT - Update categories order
export async function PUT(request: NextRequest) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ message: "Neautorizovaný přístup" }, { status: 401 });
  }

  try {
    const { categories: categoryUpdates } = await request.json();

    if (!Array.isArray(categoryUpdates)) {
      return NextResponse.json({ message: "Neplatný formát dat" }, { status: 400 });
    }

    const categories = await categoryManager.read();

    // Update order for each category
    categoryUpdates.forEach((update) => {
      const category = categories.find((cat) => cat.id === update.id);
      if (category) {
        category.order = update.order;
        category.updatedAt = new Date().toISOString();
      }
    });

    await categoryManager.write(categories);

    return NextResponse.json({
      message: "Pořadí kategorií bylo aktualizováno",
      categories: categories.sort((a, b) => a.order - b.order),
    });
  } catch (error) {
    console.error("Error updating category order:", error);
    return NextResponse.json(
      {
        message: "Chyba při aktualizaci pořadí kategorií",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
