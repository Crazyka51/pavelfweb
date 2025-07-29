# Práce s databází - Neon PostgreSQL

## Úvod

Tento dokument poskytuje základní informace o práci s databází v projektu. Používáme Neon PostgreSQL jako serverless databázi a přistupujeme k ní pomocí klienta `@neondatabase/serverless`.

## Instalace závislostí

Pro práci s databází je potřeba nainstalovat tyto závislosti:

```bash
# Základní závislosti
pnpm add @neondatabase/serverless dotenv bcrypt

# Vývojové závislosti
pnpm add -D tsx
```

## Nastavení proměnných prostředí

V souboru `.env` nebo `.env.local` je potřeba nastavit následující proměnné:

```
DATABASE_URL=postgres://user:password@host:port/database

# Volitelné pro vytvoření admin uživatele
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=bezpecne_heslo
```

## Dostupné skripty

### Testování připojení k databázi
```bash
pnpm run db:test
```
Tento skript otestuje připojení k databázi a vypíše základní informace o databázi, včetně seznamu tabulek.

### Vytvoření databázového schématu
```bash
pnpm run db:schema
```
Vytvoří kompletní databázové schéma podle definic v kódu.

### Vytvoření tabulky users_sync
```bash
pnpm run db:users-sync
```
Vytvoří tabulku pro synchronizaci uživatelských dat, která může chybět v některých instalacích.

### Sjednocení názvů sloupců
```bash
pnpm run db:unify
```
Sjednotí názvy sloupců v databázi, konkrétně přejmenuje `published` na `is_published` pro konzistentní pojmenování.

### Zálohování databáze
```bash
pnpm run db:backup
```
Vytvoří zálohu všech tabulek v databázi do JSON souborů v adresáři `data/backups`.

### Kompletní nastavení databáze
```bash
pnpm run db:setup-all
```
Spustí postupně všechny potřebné skripty pro inicializaci a nastavení databáze.

## Ukázkové použití v kódu

### Připojení k databázi
```typescript
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();
const sql = neon(process.env.DATABASE_URL);
```

### Jednoduché dotazy
```typescript
// Získání všech článků
const articles = await sql`SELECT * FROM articles WHERE is_published = true`;

// Vložení nového článku
const newArticle = await sql`
  INSERT INTO articles (title, content, is_published) 
  VALUES (${title}, ${content}, ${true}) 
  RETURNING *
`;
```

### Bezpečné provádění SQL příkazů
```typescript
async function executeSafely(statement, description) {
  try {
    await sql.raw(statement);
    console.log(`✅ ${description} - Úspěch`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} - Chyba:`, error);
    return false;
  }
}

// Použití
await executeSafely(`
  CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL
  )
`, 'Vytváření tabulky kategorií');
```

## Řešení problémů

### Chyba: "syntax error at or near "$1""
Tato chyba se objevuje při nesprávném použití parametrizovaných dotazů. Pro dynamické SQL příkazy použijte `sql.raw()`:

```typescript
// Nesprávně
await sql`${dynamicSql}`;

// Správně
await sql.raw(dynamicSql);
```

### Chyba: "Cannot find module 'bcrypt'"
Nainstalujte chybějící závislost:

```bash
pnpm add bcrypt
```

### Chyba připojení k databázi
1. Zkontrolujte správnost URL v proměnné `DATABASE_URL`
2. Ověřte, zda jsou přihlašovací údaje správné
3. Zkontrolujte, zda je databáze přístupná (firewall, VPN)

## Další zdroje

- [Dokumentace Neon PostgreSQL](https://neon.tech/docs)
- [Oficiální dokumentace k @neondatabase/serverless](https://www.npmjs.com/package/@neondatabase/serverless)
- [Kompletní dokumentace v DATABASE_STANDARDIZATION.md](./dokumentace/DATABASE_STANDARDIZATION.md)
