import { PrismaClient, Article, ArticleStatus } from '@prisma/client';

const prisma = new PrismaClient();

export { type Article };

export async function getArticleById(id: string) {
  return await prisma.article.findUnique({
    where: { id },
    include: {
      category: true,
      author: true,
    },
  });
}

// The data structure for creating a new article
type CreateArticleInput = {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  imageUrl?: string;
  status?: ArticleStatus;
  publishedAt?: string;
  isFeatured?: boolean;
  authorId: string;
  categoryId: string;
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
};

export async function createArticle(data: CreateArticleInput) {
  return await prisma.article.create({
    data: {
      ...data,
      publishedAt: data.publishedAt ? new Date(data.publishedAt) : undefined,
    },
  });
}

// The data structure for updating an article
type UpdateArticleInput = Partial<Omit<CreateArticleInput, 'authorId'>>;


export async function updateArticle(id: string, data: UpdateArticleInput) {
  return await prisma.article.update({
    where: { id },
    data: {
        ...data,
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : (data.publishedAt === null ? null : undefined),
    },
  });
}

export async function getArticles(options: { page?: number, limit?: number, filter?: any, sort?: any }) {
    // Basic implementation, can be expanded with pagination, filtering, sorting
    const articles = await prisma.article.findMany({
        include: {
            category: true,
            author: true,
        },
        orderBy: {
            updatedAt: 'desc'
        }
    });
    const total = await prisma.article.count();
    return { articles, total };
}

export async function getPublishedArticles(page: number = 1, limit: number = 10) {
  const skip = (page - 1) * limit;

  const [articles, total] = await prisma.$transaction([
    prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
      },
      include: {
        category: true,
        author: true,
      },
      orderBy: {
        publishedAt: 'desc',
      },
      skip: skip,
      take: limit,
    }),
    prisma.article.count({
      where: {
        status: 'PUBLISHED',
      },
    }),
  ]);

  const hasMore = skip + articles.length < total;

  return { articles, total, hasMore };
}
