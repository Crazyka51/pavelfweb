# Dokumentace databázových skriptů

Tento dokument obsahuje analýzu databázových skriptů v projektu Pavel Fišer CMS.

## Přehled skriptů pro práci s Neon databází

### 1. `complete-setup.js` a `complete-setup.mjs`

Tyto skripty vytváří kompletní databázové schéma a vkládají počáteční data do databáze. Existují ve dvou verzích:

- `complete-setup.js` - CommonJS verze
- `complete-setup.mjs` - ES Module verze

**Hlavní funkce:**
- Vytvoření tabulek pomocí přímých SQL dotazů
- Vložení výchozích dat pro kategorie, články, newsletter, šablony a nastavení
- Kontrola existence záznamů před jejich vložením (prevence duplicit)

**Použité technologie:**
- `@neondatabase/serverless` - Klient pro Neon PostgreSQL
- `drizzle-orm` - ORM pro typově bezpečnou práci s databází
- `dotenv` - Načítání proměnných prostředí z `.env.local`

### 2. `setup-database.js`

Základní nastavení databáze, jednodušší než complete-setup.

**Hlavní funkce:**
- Testování připojení k databázi
- Vytvoření základní struktury databáze

**Použité technologie:**
- `@neondatabase/serverless`
- `dotenv`

### 3. `setup-schema.mjs`

Nastavuje databázové schéma pomocí standardního PostgreSQL klienta.

**Hlavní funkce:**
- Vytvoření schématu pomocí PostgreSQL klienta

**Použité technologie:**
- `pg` (node-postgres)
- `dotenv`

### 4. `test-db.js` a `test-database.js`

Testovací skripty pro ověření připojení k databázi.

**Hlavní funkce:**
- Otestování připojení k Neon PostgreSQL
- Výpis základních informací o připojení

**Použité technologie:**
- `pg` v případě `test-db.js`
- `@neondatabase/serverless` v případě `test-database.js`
- `dotenv`

## Technologie a knihovny

### Databázové knihovny

- **@neondatabase/serverless** - Hlavní knihovna pro připojení k Neon PostgreSQL, optimalizovaná pro serverless prostředí
- **pg (node-postgres)** - PostgreSQL klient pro Node.js
- **drizzle-orm** - ORM knihovna pro typově bezpečnou práci s databází

### Konfigurace prostředí

- **dotenv** - Pro načítání proměnných prostředí z .env souborů
  - Projekt používá `.env.local` pro lokální vývoj
  - V package.json je dotenv uvedena dvakrát (v dependencies i devDependencies) s verzí "^17.0.1"

### Další související knihovny

- **bcryptjs** - Pro hashování hesel
- **jose** a **jsonwebtoken** - Pro práci s JWT tokeny (autentizace)

## Typy skriptů a styly kódu

### CommonJS moduly (.js)

```javascript
// Příklad z complete-setup.js
require("dotenv").config({ path: ".env.local" })
const { neon } = require("@neondatabase/serverless")
const { drizzle } = require("drizzle-orm/neon-http")
```

### ES Modules (.mjs)

```javascript
// Příklad z complete-setup.mjs
import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import { sql } from "drizzle-orm"
import * as schema from "../lib/schema.ts"
import 'dotenv/config'
```

### TypeScript import v JS souborech

V `complete-setup.mjs` se používá přímý import TypeScript souboru:

```javascript
import * as schema from "../lib/schema.ts" // Umožní automatické načítání TypeScript souboru při použití tsx
```

## Specifické vzory a přístupy

### Různé přístupy k připojení DB

- **Neon klient:**
  ```javascript
  const sql = neon(process.env.DATABASE_URL)
  const db = drizzle(sql)
  ```

- **PostgreSQL klient:**
  ```javascript
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  })
  ```

### SSL konfigurace pro Neon DB

```javascript
// Nastavení SSL pro připojení k Neon DB
ssl: {
  rejectUnauthorized: false // V Neonu je SSL nutné, ale bez ověřování
}
```

### Zpracování chyb

- Kontrola existence proměnné `DATABASE_URL`:
  ```javascript
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL environment variable is not set.")
    process.exit(1)
  }
  ```

- Try/catch bloky pro zachycení chyb při operacích s databází:
  ```javascript
  try {
    // Databázové operace
  } catch (error) {
    console.error("Error during complete database setup:", error)
    process.exit(1)
  } finally {
    // Případné ukončení spojení
  }
  ```

### Scripty v package.json

```json
"scripts": {
  "db:setup": "node scripts/setup-database.js",
  "db:test": "node scripts/test-database.js",
  "test:db": "node scripts/test-db.js"
}
```

## Problémy a nekonzistence

### 1. Duplicita skriptů

- Existují dva skripty pro testování databáze: `test-db.js` a `test-database.js`
- Existují dvě verze complete-setup: `.js` a `.mjs`

### 2. Nekonzistentní použití importů

- V některých skriptech se používá CommonJS `require()`:
  ```javascript
  const { neon } = require("@neondatabase/serverless")
  ```

- Jinde se používají ES Modules `import`:
  ```javascript
  import { neon } from "@neondatabase/serverless"
  ```

- V `setup-schema.mjs` se dokonce používají oba způsoby:
  ```javascript
  import 'dotenv/config'
  require('dotenv').config();
  ```

### 3. Duplicitní závislosti v package.json

- `dotenv` je uvedena dvakrát (v dependencies i devDependencies) se stejnou verzí:
  ```json
  "dependencies": {
    "dotenv": "^17.0.1"
  },
  "devDependencies": {
    "dotenv": "^17.0.1"
  }
  ```

### 4. Mix přístupů k databázi

- Některé skripty používají Drizzle ORM pro dotazy:
  ```javascript
  await db.insert(categories).values(cat)
  ```

- Jiné používají přímé SQL dotazy:
  ```javascript
  await db.execute(`CREATE TABLE IF NOT EXISTS articles (...)`)
  ```

## Závěr

Databázové skripty v projektu Pavel Fišer CMS poskytují komplexní řešení pro nastavení a správu databázové vrstvy. Z analýzy je zřejmé, že na kódu pracovalo více vývojářů s různými styly a přístupy, což vysvětluje nekonzistenci v použitých technikách a duplikaci některých skriptů.

Nejvhodnějším skriptem pro kompletní nastavení databáze je `complete-setup.js` nebo jeho modernější ES Modules verze `complete-setup.mjs`, která navíc podporuje přímý import TypeScript souborů pomocí `tsx` nástroje.
