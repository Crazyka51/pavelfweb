// Tento skript aktualizuje všechny existující kategorie a přidá jim slug vygenerovaný z jejich názvu
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Funkce pro generování slugu - stejná jako v category-service.ts
function generateSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Odstraní všechny znaky kromě písmen, čísel, mezer a pomlček
    .replace(/\s+/g, '-')     // Nahradí mezery pomlčkami
    .replace(/-+/g, '-');     // Nahradí vícenásobné pomlčky jednou pomlčkou
}

async function updateCategorySlugs() {
  try {
    console.log('Získávání všech kategorií...');
    const categories = await prisma.category.findMany();
    console.log(`Nalezeno ${categories.length} kategorií.`);

    // Provedeme aktualizaci pro každou kategorii
    for (const category of categories) {
      // Vygenerujeme slug z názvu
      const slug = generateSlug(category.name);
      
      // Pokud již kategorie má slug, který odpovídá vygenerovanému, přeskočíme ji
      if (category.slug === slug) {
        console.log(`Kategorie "${category.name}" již má správný slug: ${slug}`);
        continue;
      }
      
      // Zajistíme unikátnost slugu
      let finalSlug = slug;
      let counter = 1;
      let isUnique = false;
      
      while (!isUnique) {
        // Zkontrolujeme, zda již existuje kategorie s tímto slugem
        const existingCategory = await prisma.category.findFirst({
          where: {
            slug: finalSlug,
            id: { not: category.id } // Ignorujeme aktuální kategorii
          }
        });
        
        if (!existingCategory) {
          isUnique = true;
        } else {
          // Pokud slug již existuje, přidáme číslo na konec
          finalSlug = `${slug}-${counter}`;
          counter++;
        }
      }
      
      // Aktualizujeme kategorii s novým slugem
      await prisma.category.update({
        where: { id: category.id },
        data: { slug: finalSlug }
      });
      
      console.log(`Aktualizována kategorie "${category.name}" s novým slugem: ${finalSlug}`);
    }

    console.log('Aktualizace kategorií byla dokončena.');
  } catch (error) {
    console.error('Chyba při aktualizaci slugů kategorií:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Spuštění skriptu
updateCategorySlugs()
  .then(() => console.log('Skript byl úspěšně dokončen.'))
  .catch((error) => console.error('Chyba při spouštění skriptu:', error));
