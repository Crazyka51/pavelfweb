# Standardizace přístupu k databázi - Neon PostgreSQL

## Přehled změn

V rámci standardizace přístupu k databázi jsme provedli následující změny:

1. **Unifikovaný klient** - Všechny databázové skripty nyní používají `@neondatabase/serverless` klienta
2. **Konzistentní způsob dotazování** - Použití template strings místo přímého SQL
3. **Lepší zpracování chyb** - Oddělené zpracování chyb pro každý příkaz
4. **ES Modules** - Přechod na import/export syntaxi a .mjs soubory

## Struktura databáze

Databáze obsahuje následující hlavní tabulky:

| Tabulka | Popis |
|---------|-------|
| `articles` | Články a aktuality |
| `categories` | Kategorie pro články |
| `settings` | Nastavení systému |
| `users` | Uživatelé systému (admin přístupy) |
| `users_sync` | Synchronizace uživatelských dat |
| `newsletter_subscribers` | Odběratelé newsletteru |
| `newsletter_templates` | Šablony pro newsletter |
| `newsletter_campaigns` | Kampaně a rozesílky newsletteru |

### Diagram vztahů

```
articles -------> categories
    |
    v
newsletter_campaigns --> newsletter_templates
    |
    v
newsletter_subscribers
```

### Důležité sloupce a konvence

- Primární klíče jsou obvykle typu `uuid` generované pomocí `gen_random_uuid()`
- Timestampy používají `created_at` a `updated_at` (snake_case v databázi)
- Pro boolean hodnoty se používá konvence `is_something` (např. `is_published`)
- Textové sloupce používají datový typ `text` místo `varchar` pro flexibilitu
5. **Pomocné funkce** - Nové funkce pro často používané operace (executeSafely, runSqlFile, tableExists)

## Jak používat standardizovaný přístup k databázi

### 1. Připojení k databázi

```javascript
import 'dotenv/config'
import { neon } from '@neondatabase/serverless'

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

// Vytvoření Neon klienta - není potřeba connect() a end()
const sql = neon(connectionString);
```

### 2. Dotazování pomocí template strings

```javascript
// Dotaz bez parametrů
const result = await sql`SELECT * FROM articles LIMIT 10`;

// Dotaz s parametry (automaticky ošetřeno proti SQL injection)
const title = 'Nový článek';
const content = 'Obsah článku...';
const result = await sql`
  INSERT INTO articles (title, content) 
  VALUES (${title}, ${content}) 
  RETURNING *
`;
```

### 3. Spouštění SQL souboru

Pro spuštění SQL souboru můžete použít tuto helper funkci, která rozdělí obsah souboru na jednotlivé příkazy:

```javascript
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function runSqlFile(filePath) {
  try {
    const fullPath = path.join(__dirname, '..', filePath);
    console.log(`📄 Načítání SQL souboru: ${filePath}...`);
    
    if (!fs.existsSync(fullPath)) {
      console.warn(`⚠️ SQL soubor nenalezen: ${filePath}`);
      return false;
    }
    
    const sqlContent = fs.readFileSync(fullPath, 'utf8');
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    console.log(`📝 Provádění ${statements.length} SQL příkazů...`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        console.log(`   ${i + 1}/${statements.length}: ${statement.substring(0, 50)}...`);
        await sql`${statement}`;
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`   ⚠️ Přeskočeno (již existuje): ${error.message}`);
        } else {
          throw error;
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Chyba při spouštění SQL souboru: ${error.message}`);
    return false;
  }
}
```

### 4. Bezpečné spouštění jednotlivých SQL příkazů

```javascript
async function executeSafely(description, statement) {
  console.log(`🔹 ${description}...`);
  try {
    await sql`${statement}`;
    console.log(`   ✅ Hotovo`);
    return true;
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log(`   ⚠️ Přeskočeno (již existuje): ${error.message}`);
      return true;
    } else {
      console.error(`   ❌ Chyba: ${error.message}`);
      return false;
    }
  }
}

// Použití
await executeSafely('Vytváření tabulky users', `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT
  )
`);
```

## Seznam upravených skriptů

1. `scripts/setup-schema.mjs` - Vytvoření schématu databáze
2. `scripts/test-db.js` -> `scripts/test-db.mjs` - Test připojení k databázi
3. `scripts/setup-database.js` -> `scripts/setup-database.mjs` - Nastavení základního schématu

## Příklady použití pro různé operace

### Vytvoření/aktualizace tabulky

```javascript
await executeSafely('Vytváření tabulky articles', `
  CREATE TABLE IF NOT EXISTS articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    category TEXT,
    image_url TEXT,
    is_published BOOLEAN DEFAULT TRUE
  )
`);
```

### Vytvoření indexu

```javascript
await executeSafely('Vytváření indexu', `
  CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category)
`);
```

### Vložení dat

```javascript
const email = 'admin@example.com';
const hashedPassword = await bcrypt.hash('heslo123', 10);

const result = await sql`
  INSERT INTO users_sync (email, hashed_password, is_admin, name)
  VALUES (${email}, ${hashedPassword}, ${true}, ${'Administrator'})
  ON CONFLICT (email) DO NOTHING
`;
```

### Kontrola existence tabulky

```javascript
async function tableExists(tableName) {
  const result = await sql`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_name = ${tableName}
      AND table_schema = 'public'
    ) AS exists
  `;
  return result[0].exists;
}

// Použití
if (await tableExists('users_sync')) {
  console.log('Tabulka users_sync existuje');
} else {
  console.log('Tabulka users_sync neexistuje');
}
```

## Shrnutí výhod nového přístupu

1. **Bezpečnost** - Parametry SQL dotazů jsou automaticky escapované
2. **Jednotnost** - Všechny skripty používají stejný přístup
3. **Modularita** - Opakující se operace jsou v pomocných funkcích
4. **Lepší zpracování chyb** - Skripty lépe reagují na chybové stavy
5. **Moderní syntaxe** - Použití ES Modules a template strings

## Celkový přehled standardizace

### 🧱 Standardizace připojení k databázi
- Přechod na @neondatabase/serverless pro moderní, škálovatelné připojení
- Modularizace pomocí helper funkcí pro bezpečnější práci se SQL
- Odstranění nutnosti manuálně volat connect() a end() - Neon klient to řeší automaticky

## Řešení častých problémů

### Chyba "syntax error at or near "$1"" při použití `sql\`${statement}\``

Při použití SQL dotazu uvnitř template stringu může docházet k chybě "syntax error at or near "$1"", protože Neon klient interpretuje ${...} uvnitř template stringu nesprávně. Existují dva způsoby řešení:

#### 1. Použití raw SQL dotazu pomocí sql.raw()

```javascript
// Namísto:
await sql`${statement}`;

// Použijte:
await sql.raw(statement);
```

#### 2. Přímé vložení SQL dotazu bez parametrizace (jen pro statické dotazy)

```javascript
// Statické dotazy bez uživatelského vstupu lze zapsat přímo:
await sql`CREATE TABLE IF NOT EXISTS articles (id SERIAL PRIMARY KEY, title TEXT NOT NULL)`;

// Pro dynamické dotazy použijte parametrizaci:
const tableName = 'articles';
const columnName = 'title';
await sql`CREATE INDEX IF NOT EXISTS idx_${tableName}_${columnName} ON ${sql(tableName)}(${sql(columnName)})`;
```

#### 3. Úprava funkce executeSafely

```javascript
async function executeSafely(description, statement) {
  console.log(`🔹 ${description}...`);
  try {
    // Použití sql.raw místo sql`${statement}`
    await sql.raw(statement);
    console.log(`   ✅ Hotovo`);
    return true;
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log(`   ⚠️ Přeskočeno (již existuje): ${error.message}`);
      return true;
    } else {
      console.error(`   ❌ Chyba: ${error.message}`);
      return false;
    }
  }
}

### 🔍 Validace schématu & opravy
- Ošetřená kontrola existence tabulek/sloupců pomocí specializovaných funkcí
- Skript `create-users-sync-table.mjs` se stará o inicializaci chybějící tabulky
- Přidána možnost vytvořit admin uživatele přes proměnné prostředí (.env)
- Preventivní detekce a řešení problémů s databázovým schématem

### 📐 Sjednocení názvů sloupců
- Detekce rozdílu mezi `published` vs. `is_published`
- Skript `unify-published-column-names.mjs` zajistil jednotnost napříč databází
- Ostatní skripty byly upraveny pro kompatibilitu s jednotným názvoslovím

### 📦 Změny v package.json
- Nové npm skripty pro jednotlivé operace (`db:test`, `db:schema`, `db:users-sync`, `db:unify`)
- `db:setup-all` jako hlavní orchestrátor nastavení celé databáze
- Modernizace skriptů a nahrazení zastaralých inline příkazů

### 📚 Dokumentace
- Vytvořen soubor `DATABASE_STANDARDIZATION.md` pro interní technický přehled
- Aktualizován `README.md` pro vývojáře i onboarding
- Příklady použití pro všechny běžné databázové operace

### 🧬 Kódová základna – database.ts
- Nové helper funkce pro kontrolu existence tabulek a sloupců
- Modernizace pro čistší práci s Neon PostgreSQL
- Centralizovaný přístup k databázi pro celý projekt

## Instalace a závislosti

Pro správný běh skriptů je potřeba nainstalovat následující závislosti:

```bash
# Instalace základních závislostí
pnpm add @neondatabase/serverless dotenv bcrypt

# Instalace pomocných nástrojů pro vývoj
pnpm add tsx --save-dev
```

### Potřebné závislosti

1. **@neondatabase/serverless** - Hlavní klient pro připojení k Neon PostgreSQL
2. **dotenv** - Pro načtení proměnných prostředí
3. **bcrypt** - Pro hashování hesel při vytváření uživatelů
4. **tsx** (dev) - Pro spouštění TypeScript souborů bez nutnosti kompilace

Tyto závislosti jsou již přidány do `package.json`, takže většinou stačí jen spustit `pnpm install` nebo `npm install`.

## Příklady použití

### Připojení k databázi

```typescript
// lib/database.ts
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

export const sql = neon(process.env.DATABASE_URL);
```

### Jednoduchý dotaz

```typescript
// příklad použití v service vrstvě
import { sql } from '../lib/database';

export async function getAllArticles() {
  try {
    const articles = await sql`
      SELECT * FROM articles 
      WHERE is_published = true 
      ORDER BY created_at DESC
    `;
    return articles;
  } catch (error) {
    console.error('Chyba při načítání článků:', error);
    return [];
  }
}
```

### Parametrizované dotazy

```typescript
// bezpečné použití parametrů
async function getArticleById(id) {
  return await sql`SELECT * FROM articles WHERE id = ${id}`;
}

// práce s více parametry
async function searchArticles({ category, searchTerm, limit = 10 }) {
  return await sql`
    SELECT * FROM articles 
    WHERE 
      category = ${category} AND
      (title ILIKE ${'%' + searchTerm + '%'} OR 
       content ILIKE ${'%' + searchTerm + '%'})
    LIMIT ${limit}
  `;
}
```

### Vkládání dat

```typescript
// vložení nového článku
async function createArticle(articleData) {
  const { title, content, category_id, is_published } = articleData;
  
  return await sql`
    INSERT INTO articles (title, content, category_id, is_published, created_at, updated_at)
    VALUES (
      ${title}, 
      ${content}, 
      ${category_id}, 
      ${is_published},
      NOW(),
      NOW()
    )
    RETURNING *
  `;
}
```

### Transakce

```typescript
// použití transakcí pro více souvisejících operací
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

async function createArticleWithTags(articleData, tags) {
  const client = neon(process.env.DATABASE_URL);
  
  try {
    // začátek transakce
    await client.query('BEGIN');
    
    // vložení článku
    const articleResult = await client.query(
      'INSERT INTO articles (title, content) VALUES ($1, $2) RETURNING id',
      [articleData.title, articleData.content]
    );
    
    const articleId = articleResult[0].id;
    
    // vložení tagů
    for (const tag of tags) {
      await client.query(
        'INSERT INTO article_tags (article_id, tag_name) VALUES ($1, $2)',
        [articleId, tag]
      );
    }
    
    // potvrzení transakce
    await client.query('COMMIT');
    
    return articleId;
  } catch (error) {
    // vrácení změn při chybě
    await client.query('ROLLBACK');
    throw error;
  }
}
```

## Časté chyby a řešení

### Chyba při spuštění skriptu: "Error: Cannot find module 'bcrypt'"

**Řešení:** Nainstalujte chybějící závislost:
```bash
pnpm add bcrypt
# nebo
npm install bcrypt
```

### Chyba při provádění SQL dotazů: "syntax error at or near "$1""

Tato chyba se objevuje při nesprávném použití parametrizovaných dotazů. V Neon klientu je potřeba použít speciální funkci `sql` pro template strings.

**Nesprávně:**
```typescript
const query = `CREATE TABLE IF NOT EXISTS ${tableName} (id SERIAL PRIMARY KEY)`;
await client.query(query);
```

**Správně:**
```typescript
import { sql } from '@neondatabase/serverless';

const query = sql.raw(`CREATE TABLE IF NOT EXISTS ${tableName} (id SERIAL PRIMARY KEY)`);
await client.query(query);
```

### Chyba připojení: "Could not connect to database"

1. Zkontrolujte, zda máte správný DATABASE_URL v souboru .env
2. Ověřte, že databáze je přístupná (firewall, VPN)
3. Zkontrolujte, zda přihlašovací údaje jsou správné

**Tip:** Pro testování připojení můžete použít jednoduchý skript:

```typescript
// test-connection.mjs
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    const result = await sql`SELECT 1 as connection_test`;
    console.log("Připojení úspěšné:", result);
  } catch (error) {
    console.error("Chyba připojení:", error);
  }
}

testConnection();
```

### Nastavení proměnných prostředí

Pro správnou funkci skriptů je potřeba nastavit proměnné prostředí v souboru `.env` nebo `.env.local`:

```
DATABASE_URL=postgres://user:password@host:port/database

# Volitelné pro vytvoření admin uživatele
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=bezpecne_heslo
```

## Proces migrace a správa databázového schématu

### Standardní postup při změně schématu

1. **Úprava schématu v kódu**:
   - Aktualizujte soubor `lib/schema.ts` s novými definicemi tabulek nebo sloupců
   - Ujistěte se, že všechny entity mají správné názvy (camelCase v kódu, snake_case v DB)

2. **Vytvoření migračního skriptu**:
   - Vytvořte nový skript v adresáři `scripts/` s příponou `.mjs`
   - Použijte standardní strukturu s importy, main funkcí a error handlingem

3. **Testování migrace lokálně**:
   - Spusťte skript pomocí `pnpm tsx scripts/nazev-skriptu.mjs`
   - Ověřte, že změny byly správně aplikovány

4. **Nasazení do produkce**:
   - Před produkčním nasazením vždy vytvořte zálohu dat
   - Spusťte migraci v produkčním prostředí
   - Zkontrolujte, že aplikace funguje správně s novým schématem

### Šablona migračního skriptu

Při vytváření nových migračních skriptů používejte následující šablonu:

```typescript
// scripts/migrate-xyz.mjs
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function executeSafely(query, description) {
  try {
    const result = await query;
    console.log(`✅ ${description}: Úspěch`);
    return result;
  } catch (error) {
    console.error(`❌ ${description}: Chyba`, error);
    return null;
  }
}

async function main() {
  console.log('🚀 Zahájení migrace...');
  
  // Příklad migračního příkazu
  await executeSafely(
    sql.raw(`ALTER TABLE tabulka ADD COLUMN novy_sloupec TEXT`),
    'Přidání nového sloupce'
  );
  
  console.log('✨ Migrace dokončena');
}

main().catch((error) => {
  console.error('❌ Kritická chyba:', error);
  process.exit(1);
});
```

## Zálohování a obnova dat

### Vytvoření zálohy dat

Pro vytvoření zálohy dat z Neon PostgreSQL můžete použít následující skript:

```typescript
// scripts/backup-data.mjs
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);
const BACKUP_FOLDER = path.join(process.cwd(), 'data', 'backups');

async function backupTable(tableName) {
  try {
    const data = await sql.raw(`SELECT * FROM ${tableName}`);
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const fileName = `${tableName}-${timestamp}.json`;
    const filePath = path.join(BACKUP_FOLDER, fileName);
    
    await fs.mkdir(BACKUP_FOLDER, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    
    console.log(`✅ Záloha tabulky ${tableName} uložena do: ${filePath}`);
    return filePath;
  } catch (error) {
    console.error(`❌ Chyba při zálohování tabulky ${tableName}:`, error);
    return null;
  }
}

async function main() {
  console.log('🚀 Zahájení zálohování...');
  
  // Seznam tabulek k zálohování
  const tables = [
    'articles',
    'categories',
    'settings',
    'users',
    'newsletter_subscribers',
    'newsletter_templates',
    'newsletter_campaigns'
  ];
  
  for (const table of tables) {
    await backupTable(table);
  }
  
  console.log('✨ Zálohování dokončeno');
}

main().catch((error) => {
  console.error('❌ Kritická chyba:', error);
  process.exit(1);
});
```

### Obnova dat ze zálohy

```typescript
// scripts/restore-data.mjs
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';

dotenv.config();

const client = neon(process.env.DATABASE_URL);

async function restoreTable(filePath, tableName) {
  try {
    // Načtení dat ze záložního souboru
    const fileContent = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(fileContent);
    
    if (!data.length) {
      console.log(`ℹ️ Žádná data k obnovení pro tabulku ${tableName}`);
      return;
    }
    
    // Získání názvů sloupců z prvního objektu
    const columns = Object.keys(data[0]);
    
    // Začátek transakce
    await client.query('BEGIN');
    
    // Vymazání existujících dat
    await client.query(`TRUNCATE TABLE ${tableName} CASCADE`);
    
    // Vložení dat po řádcích
    for (const row of data) {
      const values = columns.map(col => row[col]);
      const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
      
      await client.query(
        `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`,
        values
      );
    }
    
    // Potvrzení transakce
    await client.query('COMMIT');
    
    console.log(`✅ Obnovena data pro tabulku ${tableName} (${data.length} záznamů)`);
  } catch (error) {
    // Vrácení změn při chybě
    await client.query('ROLLBACK');
    console.error(`❌ Chyba při obnovování tabulky ${tableName}:`, error);
  }
}

async function main() {
  // Cesta k záloze a název tabulky
  const backupFile = process.argv[2];
  const tableName = process.argv[3];
  
  if (!backupFile || !tableName) {
    console.error('❌ Chybí cesta k záloze nebo název tabulky.');
    console.log('Použití: pnpm tsx scripts/restore-data.mjs cesta/k/souboru.json nazev_tabulky');
    process.exit(1);
  }
  
  console.log(`🚀 Zahájení obnovy tabulky ${tableName} ze souboru ${backupFile}...`);
  await restoreTable(backupFile, tableName);
  console.log('✨ Obnova dokončena');
}

main().catch((error) => {
  console.error('❌ Kritická chyba:', error);
  process.exit(1);
});
```
