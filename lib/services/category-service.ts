import { PrismaClient } from '@prisma/client';
import { Category, CreateCategoryInput } from '../../types/database';

const prisma = new PrismaClient();

export { type Category };

export async function getCategories(options: { filter?: any, sort?: any }) {
    const categories = await prisma.category.findMany({
        // Can be expanded with filtering and sorting
    });
    return { categories, total: categories.length };
}

export async function getCategoryById(id: string) {
  return await prisma.category.findUnique({
    where: { id },
  });
}

export async function createCategory(data: Omit<Category, 'id'>) {
  return await prisma.category.create({
    data,
  });
}

export async function updateCategory(id: string, data: Partial<Omit<Category, 'id'>>) {
  return await prisma.category.update({
    where: { id },
    data,
  });
}
