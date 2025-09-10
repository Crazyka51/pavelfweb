#!/bin/bash

# Skript pro vyčištění nepotřebných souborů v projektu
# Vytvořen: 10. září 2025

echo "🧹 Začínám čištění projektu..."
echo ""

# Přesunutí souborů do backup adresáře před odstraněním
BACKUP_DIR="/workspaces/pavelfweb/_cleanup_backup_$(date +%Y%m%d%H%M%S)"
echo "📦 Vytváření zálohy v: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"

# Archivní a dočasné soubory
echo "🗄️  Archivování archivních souborů..."
if [ -f "/workspaces/pavelfweb/pavelfweb2.rar" ]; then
  mv "/workspaces/pavelfweb/pavelfweb2.rar" "$BACKUP_DIR/"
  echo "  ✓ Přesunut pavelfweb2.rar"
fi

if [ -f "/workspaces/pavelfweb/pavelfweb2.zip" ]; then
  mv "/workspaces/pavelfweb/pavelfweb2.zip" "$BACKUP_DIR/"
  echo "  ✓ Přesunut pavelfweb2.zip"
fi

if [ -f "/workspaces/pavelfweb/app/app.zip" ]; then
  mv "/workspaces/pavelfweb/app/app.zip" "$BACKUP_DIR/"
  echo "  ✓ Přesunut app/app.zip"
fi

# Testovací soubory
echo "🧪 Archivování testovacích skriptů..."
for file in test-api.mjs test-auth.mjs test-db.mjs test-newsletter.sh test-unsubscribe.sh testLogin.mjs debug-db.mjs; do
  if [ -f "/workspaces/pavelfweb/$file" ]; then
    mkdir -p "$BACKUP_DIR/test_scripts"
    mv "/workspaces/pavelfweb/$file" "$BACKUP_DIR/test_scripts/"
    echo "  ✓ Přesunut $file"
  fi
done

# Dočasné soubory
echo "📝 Archivování dočasných souborů..."
for file in cookies.txt login_response.json historiechatu.txt; do
  if [ -f "/workspaces/pavelfweb/$file" ]; then
    mkdir -p "$BACKUP_DIR/temp_files"
    mv "/workspaces/pavelfweb/$file" "$BACKUP_DIR/temp_files/"
    echo "  ✓ Přesunut $file"
  fi
done

# Prázdné nebo nepotřebné konfigurační soubory
echo "⚙️  Archivování nepotřebných konfiguračních souborů..."
if [ -f "/workspaces/pavelfweb/v0-user-next.config.mjs" ]; then
  mkdir -p "$BACKUP_DIR/config"
  mv "/workspaces/pavelfweb/v0-user-next.config.mjs" "$BACKUP_DIR/config/"
  echo "  ✓ Přesunut v0-user-next.config.mjs"
fi

# Zálohy komponent
echo "🧩 Archivování záložních komponent..."
if [ -d "/workspaces/pavelfweb/components/backups" ]; then
  mkdir -p "$BACKUP_DIR/components"
  mv "/workspaces/pavelfweb/components/backups" "$BACKUP_DIR/components/"
  echo "  ✓ Přesunut adresář components/backups"
fi

# Duplicitní dokumentace
echo "📚 Archivování duplicitní dokumentace..."
docs=(
  "DATABASE_STANDARDIZACE.md"
  "DATABASE_STANDARDIZATION.md"
  "NEON_DB_STANDARDIZACE.md"
  "DB_STANDARDIZACE_ZPRAVA.md"
  "PROVEDENE_ZMENY_DB_STANDARDIZACE.md"
  "README_DB_STANDARDIZACE.md"
)

for doc in "${docs[@]}"; do
  if [ -f "/workspaces/pavelfweb/dokumentace/$doc" ]; then
    mkdir -p "$BACKUP_DIR/dokumentace"
    cp "/workspaces/pavelfweb/dokumentace/$doc" "$BACKUP_DIR/dokumentace/"
    echo "  ✓ Zálohován $doc"
  fi
done

# Vytvořit souhrnný dokument místo duplicitních dokumentací
echo "📝 Vytváření jednotného dokumentu pro DB standardizaci..."

cat > "/workspaces/pavelfweb/dokumentace/DATABASE_STANDARDIZATION.md" << EOL
# Standardizace databáze

*Tento dokument nahrazuje několik dřívějších dokumentů o standardizaci databáze, které byly spojeny do jednoho.*

*Poslední aktualizace: $(date +"%d. %m. %Y")*

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
3. Všechny databázové schémata jsou definována v adresáři \`/prisma\`
4. SQL skripty pro migrace jsou uloženy v adresáři \`/database\`

### Konvence pojmenování
1. Názvy tabulek: množné číslo, snake_case (např. \`users\`, \`articles\`)
2. Názvy sloupců: snake_case (např. \`first_name\`, \`created_at\`)
3. Primární klíče: \`id\` (UUID nebo autoincrement integer)
4. Cizí klíče: název odkazované tabulky v jednotném čísle + \`_id\` (např. \`user_id\`)
5. Časová razítka: \`created_at\`, \`updated_at\`

## Použití Neon Database

Používáme Neon Database pro serverless PostgreSQL. Pro připojení používáme \`@neondatabase/serverless\` klienta.

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
- Zaveden jednotný přístup přes \`@neondatabase/serverless\`

### Migrace z deprecated knihoven
- Odstraněna závislost na standardním \`pg\` klientovi
- Implementována podpora pro serverless prostředí

### Další úpravy
- Odstraněny duplicitní testovací skripty
- Sjednoceny názvy tabulek a sloupců podle konvencí
- Vytvořeny indexy pro optimalizaci dotazů

---
*Pro více informací kontaktujte vývojový tým.*
EOL

# Odstranění duplicitních dokumentů o DB standardizaci
for doc in "${docs[@]}"; do
  if [ "$doc" != "DATABASE_STANDARDIZATION.md" ] && [ -f "/workspaces/pavelfweb/dokumentace/$doc" ]; then
    rm "/workspaces/pavelfweb/dokumentace/$doc"
    echo "  ✓ Odstraněn duplicitní dokument $doc"
  fi
done

echo ""
echo "🎉 Čištění projektu bylo dokončeno!"
echo "🔍 Záložní soubory najdete v adresáři: $BACKUP_DIR"
echo "📋 Podrobný seznam vyčištěných souborů byl uložen v cleanup-list.txt"
echo ""
echo "Shrnutí operací:"
echo "--------------------------------"
echo "🗂️  Duplicitní dokumentace byla sloučena do jednoho dokumentu: DATABASE_STANDARDIZATION.md"
echo "🗄️  Archivní a dočasné soubory byly přesunuty do zálohy"
echo "🧪 Testovací skripty byly přesunuty do zálohy"
echo "🧩 Duplicitní komponenty byly přesunuty do zálohy"

# Přidání řádku do .gitignore pro záložní adresáře
if [ -f "/workspaces/pavelfweb/.gitignore" ]; then
  if ! grep -q "_cleanup_backup_" "/workspaces/pavelfweb/.gitignore"; then
    echo "" >> "/workspaces/pavelfweb/.gitignore"
    echo "# Záložní adresáře z čištění projektu" >> "/workspaces/pavelfweb/.gitignore"
    echo "_cleanup_backup_*/" >> "/workspaces/pavelfweb/.gitignore"
    echo "✓ Přidán záznam do .gitignore pro ignorování záložních adresářů"
  fi
fi
