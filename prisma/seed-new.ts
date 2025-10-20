import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import { articles } from '../data/articles-new.json'

const prisma = new PrismaClient()

async function main() {

  // Create test user
  const hashedPassword = await bcrypt.hash('password123', 10)
  const user = await prisma.user.create({
    data: {
      name: 'Pavel Fišer',
      email: 'pavel.fiser@example.com',
      password: hashedPassword,
    },
  })

  // Create admin user
  await prisma.admin_users.create({
    data: {
      username: 'pavel.fiser',
      password_hash: hashedPassword,
      email: 'pavel.fiser@example.com',
      role: 'admin',
    },
  })

  // Create categories
  const categories = [
    {
      name: 'Aktuality',
      description: 'Aktuality a novinky',
      color: '#FF0000',
    },
    {
      name: 'Blog',
      description: 'Blogové příspěvky',
      color: '#00FF00',
    },
  ]

  const categoryMap = new Map<string, string>()

  for (const category of categories) {
    const newCategory = await prisma.category.create({
      data: {
        ...category,
        slug: category.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, '-'),
      },
    })
    categoryMap.set(category.name, newCategory.id)
  }

  // Create articles
  for (const article of articles) {
    const categoryId = categoryMap.get('Aktuality')!
    const newArticle = await prisma.article.create({
      data: {
        title: article.title,
        content: article.content,
        excerpt: article.excerpt,
        slug: article.slug,
        status: "PUBLISHED",
        publishedAt: new Date(),
        authorId: user.id,
        categoryId,
        tags: article.tags || [],
        imageUrl: article.imageUrl,
      },
    })
  }

}

main()
  .catch((e) => {
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
