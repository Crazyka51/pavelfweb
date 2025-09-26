# Standardizace databáze

*Tento dokument nahrazuje několik dřívějších dokumentů o standardizaci databáze, které byly spojeny do jednoho.*

*Poslední aktualizace: 10. 09. 2025*

## Obsah
1. [Úvod](#úvod)
2. [Standardy databáze](#standardy-databáze)
3. [Použití Neon Database](#použití-neon-database)
4. [Drizzle ORM](#drizzle-orm)
5. [Provedené změny](#provedené-změny)

## Úvod

Tento dokument popisuje standardy, kterými se řídí práce s databází v projektu. Dokument nahrazuje tyto původní dokumenty:
- DATABASE_STANDARDIZACE.md
- NEON_DB_STANDARDIZACE.md
- DB_STANDARDIZACE_ZPRAVA.md
- PROVEDENE_ZMENY_DB_STANDARDIZACE.md
- README_DB_STANDARDIZACE.md

## Standardy databáze

### Obecné zásady
1. Používáme Neon Database (PostgreSQL)
2. Pro práci s databází využíváme Drizzle ORM
3. Všechny databázové schémata jsou definována v adresáři `/prisma`
4. SQL skripty pro migrace jsou uloženy v adresáři `/database`

### Konvence pojmenování
1. Názvy tabulek: množné číslo, snake_case (např. `users`, `articles`)
2. Názvy sloupců: snake_case (např. `first_name`, `created_at`)
3. Primární klíče: `id` (UUID nebo autoincrement integer)
4. Cizí klíče: název odkazované tabulky v jednotném čísle + `_id` (např. `user_id`)
5. Časová razítka: `created_at`, `updated_at`

## Použití Neon Database

Používáme Neon Database pro serverless PostgreSQL. Pro připojení používáme `@neondatabase/serverless` klienta.

Příklad použití:
\`\`\`javascript
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);
\`\`\`

## Drizzle ORM

Pro práci s databází používáme Drizzle ORM, který nabízí typově bezpečný přístup k databázi.

Příklad definice schématu:
\`\`\`typescript
import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});
\`\`\`

## Provedené změny

### Standardizace používání API pro připojení
- Odstraněny různé způsoby připojení k databázi
- Zaveden jednotný přístup přes `@neondatabase/serverless`

### Migrace z deprecated knihoven
- Odstraněna závislost na standardním `pg` klientovi
- Implementována podpora pro serverless prostředí

### Další úpravy
- Odstraněny duplicitní testovací skripty
- Sjednoceny názvy tabulek a sloupců podle konvencí
- Vytvořeny indexy pro optimalizaci dotazů

---
*Pro více informací kontaktujte vývojový tým.*
