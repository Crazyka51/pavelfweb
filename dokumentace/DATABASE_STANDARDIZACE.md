# Standardizace databázových modelů

## Úvod

Tento dokument popisuje proces standardizace databázových modelů v aplikaci Pavel Fišer WEB. V současné době jsou v schématu databáze duplicitní modely (např. `Article` vs `articles`), což může vést k nejasnostem a problémům při údržbě kódu.

## Standardizované modely

Standardizované modely používají PascalCase (např. `Article`, `Category`) a jsou definovány v Prisma schématu. Tyto modely budou primárními a oficiálními modely pro všechny nové funkce a úpravy.

### Primární modely:

- `User` - uživatelé aplikace
- `Article` - články a příspěvky
- `Category` - kategorie článků
- `NewsletterSubscriber` - odběratelé newsletteru
- `NewsletterCampaign` - kampaně newsletteru
- `NewsletterTemplate` - šablony newsletteru

### Legacy modely (postupně vyřazované):

- `articles` - legacy model pro články
- `newsletter_subscribers` - legacy model pro odběratele newsletteru
- `newsletter_campaigns` - legacy model pro kampaně newsletteru
- `newsletter_templates` - legacy model pro šablony newsletteru

## Implementace migrace

Migrace je implementována v následujících krocích:

1. **Migrační skript** (`scripts/migrate-legacy-models.ts`) - přesouvá data z legacy modelů do standardizovaných modelů
2. **Databázové triggery** (`prisma/migrations/standardize_schema.sql`) - zajišťují synchronizaci mezi standardizovanými a legacy modely během přechodného období

## Použití standardizovaných modelů

Při vývoji nových funkcí dodržujte následující pravidla:

1. **Používejte standardizované modely** - pro všechny nové funkce používejte standardizované modely (PascalCase)
2. **Nepoužívejte přímo legacy modely** - nepřidávejte kód, který přímo pracuje s legacy modely
3. **Opravujte stávající kód** - při úpravě existujícího kódu přepište interakce s legacy modely na interakce se standardizovanými modely

### Příklad správného použití:

```typescript
// Správně - použití standardizovaného modelu Article
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function getArticles() {
  return await prisma.article.findMany({
    include: { author: true, category: true }
  });
}
```

### Příklad nesprávného použití:

```typescript
// Špatně - použití legacy modelu articles
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function getArticles() {
  return await prisma.articles.findMany();
}
```

## Časový plán standardizace

1. **Fáze 1** - Implementace migračního skriptu a triggerů pro synchronizaci (dokončeno)
2. **Fáze 2** - Postupná úprava kódu pro používání standardizovaných modelů (probíhá)
3. **Fáze 3** - Odstranění závislostí na legacy modelech (po dokončení fáze 2)
4. **Fáze 4** - Odstranění legacy modelů z databázového schématu (finální krok)

## Ověření funkčnosti

Po každém kroku standardizace je třeba ověřit:

1. **Funkčnost API** - všechny API endpointy musí fungovat bez chyb
2. **Funkčnost administrace** - všechny funkce administračního rozhraní musí být plně funkční
3. **Datovou integritu** - data musí být konzistentní mezi standardizovanými a legacy modely

V případě jakýchkoliv problémů kontaktujte vývojový tým.
