import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function publishArticle() {
  try {
    // Najdeme článek s názvem "test"
    const article = await prisma.article.findFirst({
      where: {
        title: 'test'
      }
    });
    
    if (!article) {
      console.log('Článek "test" nebyl nalezen');
      return;
    }
    
    console.log(`Publikuji článek: ${article.title} (ID: ${article.id})`);
    
    // Publikujeme článek
    const updatedArticle = await prisma.article.update({
      where: {
        id: article.id
      },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date()
      }
    });
    
    console.log('Článek byl úspěšně publikován!');
    console.log(`Status: ${updatedArticle.status}`);
    console.log(`Publikováno: ${updatedArticle.publishedAt?.toLocaleString('cs-CZ')}`);
    
  } catch (error) {
    console.error('Chyba při publikování:', error);
  } finally {
    await prisma.$disconnect();
  }
}

publishArticle();