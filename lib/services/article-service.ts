import { PrismaClient } from '@prisma/client';
import { Article, ArticleStatus } from '../../types/database';

// Local types for this service
interface ServiceCreateArticleInput {
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
}

interface ServiceUpdateArticleInput extends Partial<Omit<ServiceCreateArticleInput, 'authorId'>> {}

const prisma = new PrismaClient();

export { type Article, type ArticleStatus };

export async function getArticleById(id: string) {
  return await prisma.article.findUnique({
    where: { id },
    include: {
      category: true,
      author: true,
    },
  });
}

export async function createArticle(data: ServiceCreateArticleInput) {
  return await prisma.article.create({
    data: {
      ...data,
      publishedAt: data.publishedAt ? new Date(data.publishedAt) : undefined,
    },
  });
}

export async function updateArticle(id: string, data: ServiceUpdateArticleInput) {
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
