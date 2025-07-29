# Provedené změny - Sjednocení databázových skriptů

Tento dokument shrnuje provedené změny při sjednocení databázových skriptů na jednotný přístup s @neondatabase/serverless a ES Modules.

## 1. Vytvořené nové soubory

Vytvořil jsem následující nové soubory s jednotným přístupem:

- **setup-schema.mjs.new** - Nová verze setup-schema.mjs s Neon klientem
- **test-db.mjs** - Nová verze testovacího skriptu s Neon klientem
- **setup-database.mjs** - Nová verze setup-database.js s Neon klientem

## 2. Aktualizované soubory

- **package.json** - Aktualizovány scripty pro použití nových .mjs souborů:
  ```json
  "scripts": {
    "db:setup": "node scripts/setup-database.mjs",
    "db:test": "node scripts/test-db.mjs",
    "db:init": "npx tsx scripts/complete-setup.mjs",
    "dev": "next dev",
    "lint": "next lint",
    "start": "next start"
  },
  ```

## 3. Soubory k nahrazení

Nové soubory jsou zatím vytvořeny s příponami .mjs nebo .new, aby nedošlo k přepsání stávajících souborů. Pro dokončení standardizace doporučuji:

1. Přejmenovat `setup-schema.mjs.new` na `setup-schema.mjs` (nahradit stávající soubor)
2. Odstranit již nepotřebné soubory:
   - `test-db.js` (nahrazen test-db.mjs)
   - `test-database.js` (nahrazen test-db.mjs)
   - `setup-database.js` (nahrazen setup-database.mjs)
   - `complete-setup.js` (ponechat pouze complete-setup.mjs)

## 4. Hlavní provedené změny v kódu

### Konverze importů na ES Modules:

```javascript
// Před
require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

// Po
import { neon } from '@neondatabase/serverless';
import 'dotenv/config';
```

### Konverze pg na @neondatabase/serverless:

```javascript
// Před (s pg)
const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
await client.connect();
const result = await client.query('SELECT * FROM articles');

// Po (s @neondatabase/serverless)
const sql = neon(connectionString);
const result = await sql`SELECT * FROM articles`;
```

### Úprava exportů pro ES Modules:

```javascript
// Před (CommonJS)
module.exports = {
  insertArticle,
  addSubscriber,
  getArticlesByCategory
};

// Po (ES Modules)
export {
  insertArticle,
  addSubscriber,
  getArticlesByCategory
};
```

### Úprava spouštění skriptů:

```javascript
// Před (CommonJS)
if (require.main === module) {
  setupDatabase();
}

// Po (ES Modules)
if (import.meta.url === import.meta.main) {
  setupDatabase();
}
```

## 5. Další doporučení

1. **Testování:** Otestujte všechny nové skripty, zda fungují správně
2. **Dokumentace:** Aktualizujte dokumentaci (DATABASE_SCRIPTS.md), aby odrážela nový sjednocený přístup
3. **Školení:** Informujte vývojáře o novém standardizovaném přístupu k databázi

## 6. Instalace balíčku tsx (pokud ještě není nainstalován)

Pro spouštění skriptů s TypeScript importy doporučuji nainstalovat tsx:

```bash
pnpm add -D tsx
# nebo
npm install --save-dev tsx
```

Potom můžete spouštět complete-setup.mjs s podporou TypeScript:

```bash
npx tsx scripts/complete-setup.mjs
```
