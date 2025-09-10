#!/bin/bash

# Skript pro vyčištění adresáře scripts
# Vytvořen: 10. září 2025

echo "🧹 Začínám čištění adresáře scripts..."
echo ""

# Přesunutí souborů do backup adresáře před odstraněním
BACKUP_DIR="/workspaces/pavelfweb/_cleanup_scripts_$(date +%Y%m%d%H%M%S)"
echo "📦 Vytváření zálohy v: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"

# Testovací soubory v adresáři scripts
test_scripts=(
  "test-auth-flow.js"
  "test-auth-working.js"
  "test-auth.js"
  "test-db.mjs"
  "test-login-fixed.js"
  "test-login-simple.js"
  "testAuth.mjs"
  "testLoginFlow.mjs"
)

echo "🧪 Archivování testovacích skriptů..."
for file in "${test_scripts[@]}"; do
  if [ -f "/workspaces/pavelfweb/scripts/$file" ]; then
    mkdir -p "$BACKUP_DIR/test_scripts"
    mv "/workspaces/pavelfweb/scripts/$file" "$BACKUP_DIR/test_scripts/"
    echo "  ✓ Přesunut $file"
  fi
done

# Duplicitní skripty pro reset admina
admin_scripts=(
  "reset-admin.js"
  "reset-admin.ts"
)

echo "🔄 Archivování duplicitních admin skriptů (ponecháván reset-admin.mjs)..."
for file in "${admin_scripts[@]}"; do
  if [ -f "/workspaces/pavelfweb/scripts/$file" ]; then
    mkdir -p "$BACKUP_DIR/admin_scripts"
    mv "/workspaces/pavelfweb/scripts/$file" "$BACKUP_DIR/admin_scripts/"
    echo "  ✓ Přesunut $file"
  fi
done

# Duplicitní SQL skripty pro nastavení hesla
sql_scripts=(
  "set-pavel-password-with-prisma.sql"
  "simple-set-password.sql"
  "verify-pavel-login.sql"
)

echo "💾 Archivování duplicitních SQL skriptů (ponecháván set-pavel-password-final-working.sql)..."
for file in "${sql_scripts[@]}"; do
  if [ -f "/workspaces/pavelfweb/scripts/$file" ]; then
    mkdir -p "$BACKUP_DIR/sql_scripts"
    mv "/workspaces/pavelfweb/scripts/$file" "$BACKUP_DIR/sql_scripts/"
    echo "  ✓ Přesunut $file"
  fi
done

# Duplicitní skripty pro aktualizaci kategorií
category_scripts=(
  "update-categories-with-fields.js"
  "update-categories.mjs"
  "update-category-slugs.js"
)

echo "📋 Archivování duplicitních skriptů pro kategorie (ponecháván update-categories-with-fields.ts)..."
for file in "${category_scripts[@]}"; do
  if [ -f "/workspaces/pavelfweb/scripts/$file" ]; then
    mkdir -p "$BACKUP_DIR/category_scripts"
    mv "/workspaces/pavelfweb/scripts/$file" "$BACKUP_DIR/category_scripts/"
    echo "  ✓ Přesunut $file"
  fi
done

echo ""
echo "🎉 Čištění adresáře scripts bylo dokončeno!"
echo "🔍 Záložní soubory najdete v adresáři: $BACKUP_DIR"
echo ""
echo "Shrnutí operací:"
echo "--------------------------------"
echo "🧪 Přesunuto $(ls -1 "$BACKUP_DIR/test_scripts" 2>/dev/null | wc -l) testovacích skriptů"
echo "🔄 Přesunuto $(ls -1 "$BACKUP_DIR/admin_scripts" 2>/dev/null | wc -l) duplicitních admin skriptů"
echo "💾 Přesunuto $(ls -1 "$BACKUP_DIR/sql_scripts" 2>/dev/null | wc -l) duplicitních SQL skriptů"
echo "📋 Přesunuto $(ls -1 "$BACKUP_DIR/category_scripts" 2>/dev/null | wc -l) duplicitních skriptů pro kategorie"

# Přidání řádku do .gitignore pro záložní adresáře
if [ -f "/workspaces/pavelfweb/.gitignore" ]; then
  if ! grep -q "_cleanup_scripts_" "/workspaces/pavelfweb/.gitignore"; then
    echo "_cleanup_scripts_*/" >> "/workspaces/pavelfweb/.gitignore"
    echo "✓ Přidán záznam do .gitignore pro ignorování záložních adresářů skriptů"
  fi
fi

# Aktualizace zprávy o vyčištění
cat >> "/workspaces/pavelfweb/dokumentace/CLEANUP_REPORT.md" << EOL

## Dodatečné vyčištění adresáře scripts

Následující duplicitní a testovací skripty byly přesunuty do záložního adresáře:

### Testovací skripty
$(for file in "${test_scripts[@]}"; do if [ -f "$BACKUP_DIR/test_scripts/$file" ]; then echo "- $file"; fi; done)

### Duplicitní admin skripty
$(for file in "${admin_scripts[@]}"; do if [ -f "$BACKUP_DIR/admin_scripts/$file" ]; then echo "- $file"; fi; done)

### Duplicitní SQL skripty
$(for file in "${sql_scripts[@]}"; do if [ -f "$BACKUP_DIR/sql_scripts/$file" ]; then echo "- $file"; fi; done)

### Duplicitní skripty pro kategorie
$(for file in "${category_scripts[@]}"; do if [ -f "$BACKUP_DIR/category_scripts/$file" ]; then echo "- $file"; fi; done)

Všechny tyto soubory byly zálohovány do adresáře: \`$BACKUP_DIR\`

EOL
