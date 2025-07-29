# Standardizace databázových skriptů na Neon

Tento dokument obsahuje plán standardizace všech databázových skriptů na jednotný přístup s využitím Neon PostgreSQL klienta.

## Současný stav

Projekt Pavel Fišer CMS aktuálně používá dva různé databázové klienty:

1. **@neondatabase/serverless** - Moderní klient optimalizovaný pro serverless prostředí
2. **pg (node-postgres)** - Standardní PostgreSQL klient

A dva různé styly importů:
- CommonJS (`require()`)
- ES Modules (`import`)

## Plán standardizace

### 1. Výběr preferovaného databázového klienta

**Doporučení: Používat výhradně `@neondatabase/serverless`**

Důvody:
- Optimalizován pro serverless prostředí (Next.js app)
- Efektivnější pro Neon databázi
- Jednodušší použití s podporou SQL template strings
- Dobře funguje s Drizzle ORM

### 2. Výběr preferovaného stylu importů

**Doporučení: Používat ES Modules (`.mjs` soubory s `import` syntaxí)**

Důvody:
- Modernější přístup
- Lepší podpora TypeScript
- Kompatibilní s Next.js, který používá ES Modules
- Možnost přímého importu TypeScript souborů pomocí `tsx`

### 3. Seznam skriptů ke standardizaci

| Skript | Současný klient | Plánovaná akce |
|--------|----------------|----------------|
| `complete-setup.js` | @neondatabase/serverless | Odstranit ve prospěch .mjs verze |
| `complete-setup.mjs` | @neondatabase/serverless | Zachovat jako preferovaný |
| `test-db.js` | pg | Odstranit ve prospěch test-database.js |
| `test-database.js` | @neondatabase/serverless | Přejmenovat na test-db.mjs a konvertovat na ES Module |
| `setup-database.js` | @neondatabase/serverless | Přejmenovat na setup-database.mjs a konvertovat na ES Module |
| `setup-schema.mjs` | pg | Aktualizovat na použití @neondatabase/serverless |

### 4. Vzorový kód pro standardizaci

#### Konverze z CommonJS na ES Module

**Před:**
```javascript
require("dotenv").config({ path: ".env.local" })
const { neon } = require("@neondatabase/serverless")
const { drizzle } = require("drizzle-orm/neon-http")
const { eq } = require("drizzle-orm")
```

**Po:**
```javascript
import 'dotenv/config' // Automaticky načte .env.local
import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import { eq } from "drizzle-orm"
```

#### Konverze z pg na @neondatabase/serverless

**Před (s pg):**
```javascript
const { Client } = require('pg')
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})
await client.connect()
const result = await client.query('SELECT * FROM articles')
await client.end()
```

**Po (s @neondatabase/serverless):**
```javascript
import { neon } from "@neondatabase/serverless"
const sql = neon(process.env.DATABASE_URL)
const result = await sql`SELECT * FROM articles`
```

## Návrh konkrétních změn

### 1. Aktualizovat `setup-schema.mjs`

Konvertovat z `pg` na `@neondatabase/serverless`:
- Odstranit dvojí import dotenv
- Nahradit `pg` klienta Neon klientem
- Zjednodušit SQL dotazy s použitím template strings

### 2. Odstranit `test-db.js`

Tento skript je redundantní a používá standardní `pg` klienta. Vhodnější je používat `test-database.js` s `@neondatabase/serverless`.

### 3. Konvertovat `test-database.js` na ES Module

Přejmenovat na `test-db.mjs` a aktualizovat syntaxi importů.

### 4. Konvertovat `setup-database.js` na ES Module

Přejmenovat na `setup-database.mjs` a aktualizovat syntaxi importů.

### 5. Odstranit `complete-setup.js`

Ponechat pouze ES Module verzi `complete-setup.mjs`.

### 6. Aktualizovat scripty v `package.json`

Upravit definice skriptů tak, aby používaly pouze .mjs soubory:

```json
"scripts": {
  "db:setup": "node scripts/setup-database.mjs",
  "db:test": "node scripts/test-db.mjs",
  "db:init": "npx tsx scripts/complete-setup.mjs"
}
```

## Vzor: Test-DB s Neon klientem (ES Module)

```javascript
// test-db.mjs
import { neon } from '@neondatabase/serverless'
import 'dotenv/config'

async function testDatabase() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set')
    process.exit(1)
  }

  const sql = neon(process.env.DATABASE_URL)

  try {
    console.log('🔗 Testing database connection...')
    const healthCheck = await sql`SELECT 1 as health_check`
    console.log('✅ Database connection successful')
    
    console.log('📊 Testing tables...')
    
    // Test articles table
    const articleCount = await sql`SELECT COUNT(*) as count FROM articles`
    console.log(`   📝 Articles: ${articleCount[0].count} rows`)

    // Test newsletter subscribers
    const subscriberCount = await sql`SELECT COUNT(*) as count FROM newsletter_subscribers`
    console.log(`   📧 Newsletter subscribers: ${subscriberCount[0].count} rows`)
    
    console.log('✅ Database test completed successfully')
  } catch (error) {
    console.error('❌ Database test failed:')
    console.error(error.message)
    process.exit(1)
  }
}

testDatabase()
```

## Další kroky

1. Postupně implementovat výše uvedené změny
2. Otestovat každý skript po konverzi
3. Aktualizovat dokumentaci po dokončení standardizace
4. Informovat vývojářský tým o standardizovaném přístupu k databázi

Tento plán by měl vést k jednotnému přístupu k databázi v celém projektu, což zjednoduší údržbu a minimalizuje konflikty a potenciální problémy.

---

**Poznámka:** Pro automatické spuštění `.mjs` skriptů s TypeScript importy doporučujeme používat `tsx`:

```bash
npx tsx scripts/complete-setup.mjs
```

Tímto způsobem je možné přímo importovat TypeScript soubory jako např. `lib/schema.ts` bez nutnosti manuální transpilace.
