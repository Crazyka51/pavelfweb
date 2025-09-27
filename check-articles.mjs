import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkArticles() {
  try {
    console.log('=== ČLÁNKY V DATABÁZI ===\n');
    
    const allArticles = await prisma.article.findMany({
      include: {
        author: true,
        category: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`Celkem článků: ${allArticles.length}`);
    console.log('\nSeznam článků:');
    allArticles.forEach((article, index) => {
      console.log(`${index + 1}. ${article.title}`);
      console.log(`   - Status: ${article.status}`);
      console.log(`   - Autor: ${article.author?.name || 'N/A'}`);
      console.log(`   - Kategorie: ${article.category?.name || 'N/A'}`);
      console.log(`   - Vytvořeno: ${article.createdAt.toLocaleString('cs-CZ')}\n`);
    });
    
    // Pouze publikované
    const publishedArticles = allArticles.filter(a => a.status === 'PUBLISHED');
    console.log(`Publikované články: ${publishedArticles.length}`);
    
  } catch (error) {
    console.error('Chyba:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkArticles();