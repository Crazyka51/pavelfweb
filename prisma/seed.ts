import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {

  // Vytvoř uživatele
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash('password123', salt)

  const user = await prisma.user.upsert({
    where: { email: 'pavel.fiser@example.com' },
    update: {},
    create: {
      email: 'pavel.fiser@example.com',
      name: 'Pavel Fišer',
      password: hashedPassword,
    },
  })

  // Vytvoř kategorie
  const aktuality = await prisma.category.upsert({
    where: { name: 'Aktuality' },
    update: {},
    create: { name: 'Aktuality' },
  })

  // Vytvoř články
  const articles = [
    {
      title: 'Rekonstrukce hřiště v Nuslích dokončena',
      slug: 'rekonstrukce-hriste-nusle',
      content: 'Oblíbené dětské hřiště v Nuslích prošlo rozsáhlou rekonstrukcí...',
      excerpt: 'Hřiště je opět bezpečné a moderní.',
    },
    {
      title: 'Nové kapacity v mateřských školách',
      slug: 'nova-kapacita-ms',
      content: 'Praha 4 otevřela novou třídu pro předškolní děti...',
      excerpt: 'Přibylo 30 nových míst pro děti.',
    },
    {
      title: 'Bezpečnostní prvky v okolí škol',
      slug: 'bezpecnost-skoly',
      content: 'Ve spolupráci s policií byly zavedeny nové bezpečnostní prvky...',
      excerpt: 'Větší bezpečí pro naše děti.',
    },
  ]

  for (const article of articles) {
    const newArticle = await prisma.article.create({
      data: {
        ...article,
        authorId: user.id,
        categoryId: aktuality.id,
        status: 'PUBLISHED',
        publishedAt: new Date(),
        tags: ['praha4', 'komunální-politika'],
        isFeatured: false,
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
