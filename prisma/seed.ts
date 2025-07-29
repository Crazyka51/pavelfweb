import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log(`Start seeding ...`)

  // Create a default user
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);

  const user = await prisma.user.upsert({
    where: { email: 'pavel.fiser@example.com' },
    update: {},
    create: {
      email: 'pavel.fiser@example.com',
      name: 'Pavel Fišer',
      password: hashedPassword,
    },
  })
  console.log(`Created user 'Pavel Fišer' with id: ${user.id}`)

  // Create default categories
  const categories = [
    { name: 'Aktuality' },
    { name: 'Městská politika' },
    { name: 'Doprava' },
    { name: 'Životní prostředí' },
    { name: 'Kultura' },
    { name: 'Sport' },
  ];

  for (const category of categories) {
    const newCategory = await prisma.category.upsert({
        where: { name: category.name },
        update: {},
        create: category,
    });
    console.log(`Created category '${newCategory.name}' with id: ${newCategory.id}`)
  }

  console.log(`Seeding finished.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
