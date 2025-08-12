import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to generate slug from name
function slugify(name) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .trim();
}

async function updateCategories() {
  try {
    console.log('🔍 Načítám existující kategorie...');
    const categories = await prisma.category.findMany();
    console.log(`📊 Nalezeno ${categories.length} kategorií.`);

    // Aktualizace jednotlivých kategorií
    for (const category of categories) {
      // Pokud slug ještě není nastaven, vytvoříme ho z názvu
      if (!category.slug) {
        const slug = slugify(category.name);
        console.log(`🔄 Aktualizuji kategorii "${category.name}" - nastavuji slug: ${slug}`);
        
        await prisma.category.update({
          where: { id: category.id },
          data: { 
            slug,
            // Nastavení výchozích hodnot pro nové sloupce, pokud ještě nejsou nastaveny
            color: category.color || '#3B82F6',
            description: category.description || `Kategorie ${category.name}`,
            display_order: category.display_order || 0,
            is_active: category.is_active !== false // zachovat stávající hodnotu nebo nastavit na true
          }
        });
      } else {
        console.log(`✓ Kategorie "${category.name}" již má slug: ${category.slug}`);
      }
    }

    console.log('✅ Aktualizace kategorií byla úspěšně dokončena!');
  } catch (error) {
    console.error('❌ Chyba při aktualizaci kategorií:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Spuštění aktualizace
updateCategories();
