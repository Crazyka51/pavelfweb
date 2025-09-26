import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listAllCategories() {
  try {
    console.log('Získávání všech kategorií...');
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { articles: true }
        }
      }
    });
    
    console.log(`Nalezeno ${categories.length} kategorií:`);
    
    categories.forEach(category => {
      console.log(`ID: ${category.id}, Název: ${category.name}, Počet článků: ${category._count.articles}`);
      console.log(`  Vytvořeno: ${category.createdAt.toISOString()}, Aktualizováno: ${category.updatedAt.toISOString()}`);
      console.log('--------------------------');
    });
    
  } catch (error) {
    console.error('Chyba při získávání kategorií:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Spuštění skriptu
listAllCategories()
  .then(() => console.log('Skript byl úspěšně dokončen.'))
  .catch((error) => console.error('Chyba při spouštění skriptu:', error));
