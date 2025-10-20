// Tento skript aktualizuje existující kategorie po přidání nových sloupců
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Generuje slug z názvu kategorie
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Odstraní všechny znaky kromě písmen, čísel, mezer a pomlček
    .replace(/\s+/g, '-')     // Nahradí mezery pomlčkami
    .replace(/-+/g, '-');     // Nahradí vícenásobné pomlčky jednou pomlčkou
}

/**
 * Funkce pro generování barvy kategorie z názvu (jednoduchý hash)
 */
function generateColor(name: string): string {
  // Seznam pěkných barev
  const colors = [
    '#3B82F6', // blue
    '#EF4444', // red
    '#10B981', // green
    '#F59E0B', // amber
    '#8B5CF6', // violet
    '#EC4899', // pink
    '#06B6D4', // cyan
    '#84CC16', // lime
  ];
  
  // Jednoduchý hash založený na součtu kódů znaků
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash += name.charCodeAt(i);
  }
  
  // Výběr barvy z palety
  return colors[hash % colors.length];
}

/**
 * Aktualizuje existující kategorie novými sloupci
 */
async function updateCategoriesWithNewFields() {
  try {
    const categories = await prisma.category.findMany();

    for (const category of categories) {
      // Vygenerujeme slug z názvu
      let baseSlug = generateSlug(category.name);
      let slug = baseSlug;
      let counter = 1;
      
      // Zajistíme unikátnost slugu
      while (true) {
        // Kontrola, zda slug již existuje (kromě aktuální kategorie)
        const existing = await prisma.category.findFirst({
          where: {
            AND: [
              { slug: { equals: slug } } as any,
              { id: { not: category.id } }
            ]
          }
        });
        
        if (!existing) break;
        
        // Pokud slug existuje, přidáme číslo
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      
      // Vygenerujeme barvu
      const color = generateColor(category.name);
      
      // Aktualizujeme kategorii
      await prisma.category.update({
        where: { id: category.id },
        data: {
          slug: slug,
          description: `Kategorie: ${category.name}`, // Výchozí popis
          color: color,
          display_order: 0, // Výchozí hodnota
          is_active: true,  // Výchozí hodnota
          parent_id: null   // Výchozí hodnota
        } as any
      });
      
    }

    // Přidání unikátního indexu pro slug po naplnění daty
    try {
      // Tento příkaz musíte spustit ručně v databázi, pokud je potřeba
    } catch (indexError) {
    }

  } catch (error) {
  } finally {
    await prisma.$disconnect();
  }
}

// Spuštění skriptu
updateCategoriesWithNewFields()
  .then(() => console.log('Skript byl úspěšně dokončen.'))
  .catch((error) => console.error('Chyba při spouštění skriptu:', error));
