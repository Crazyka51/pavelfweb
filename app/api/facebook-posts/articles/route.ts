import { NextRequest, NextResponse } from 'next/server';
import { articleService } from '@/lib/article-service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const published = searchParams.get('published') === 'true';
    const category = searchParams.get('category');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined;
    const search = searchParams.get('search');

    let articles;
    
    if (search) {
      // Použijeme getArticles s parametrem search místo searchArticles
      articles = await articleService.getArticles({
        status: published ? 'PUBLISHED' : undefined,
        search,
        limit,
        offset
      });
    } else {
      articles = await articleService.getArticles({
        status: published ? 'PUBLISHED' : undefined,
        category: category || undefined,
        limit,
        offset
      });
    }

    return NextResponse.json({
      success: true,
      data: articles,
      count: articles.length
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.content || !body.category) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: title, content, category' },
        { status: 400 }
      );
    }

    const articleData = {
      title: body.title,
      content: body.content,
      excerpt: body.excerpt || '',
      slug: body.slug || body.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
      categoryId: body.category,
      authorId: body.created_by || 'admin',
      tags: body.tags || [],
      status: body.published ? ('PUBLISHED' as const) : ('DRAFT' as const),
      imageUrl: body.image_url || null,
      publishedAt: body.published && body.published_at ? new Date(body.published_at) : null
    };

    const article = await articleService.createArticle(articleData);

    return NextResponse.json({
      success: true,
      data: article
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating article:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create article' },
      { status: 500 }
    );
  }
}
