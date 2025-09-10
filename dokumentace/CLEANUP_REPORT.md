# Vyčištění projektu

*Datum: 10. září 2025*

## Provedené změny

Byla provedena údržba projektu pro odstranění nepotřebných, duplicitních a dočasných souborů. Cílem bylo zlepšit přehlednost projektu, zjednodušit dokumentaci a snížit velikost repozitáře.

### 1. Odstraněné duplicitní dokumenty

Následující dokumentace týkající se standardizace databáze byly sloučeny do jednoho dokumentu `DATABASE_STANDARDIZATION.md`:
- DATABASE_STANDARDIZACE.md
- NEON_DB_STANDARDIZACE.md
- DB_STANDARDIZACE_ZPRAVA.md
- PROVEDENE_ZMENY_DB_STANDARDIZACE.md
- README_DB_STANDARDIZACE.md

### 2. Přesunuté testovací skripty

Testovací skripty byly přesunuty do záložního adresáře:
- test-api.mjs
- test-auth.mjs
- test-db.mjs
- test-newsletter.sh
- test-unsubscribe.sh
- testLogin.mjs
- debug-db.mjs

### 3. Odstraněné archivní a dočasné soubory

Tyto soubory již nebyly potřebné a byly přesunuty do zálohy:
- pavelfweb2.rar
- pavelfweb2.zip
- app/app.zip
- cookies.txt
- login_response.json
- historiechatu.txt

### 4. Odstraněné nepoužívané konfigurační soubory

- v0-user-next.config.mjs (byl prázdný)

### 5. Přesunuté duplicitní záložní komponenty

- components/backups

## Záloha odstraněných souborů

Všechny odstraněné soubory byly zálohované do adresáře:
`/workspaces/pavelfweb/_cleanup_backup_20250910090652`

Tento adresář je přidán do .gitignore, takže nebude součástí repozitáře.

## Další údržba

V budoucnu je doporučeno:

1. Pravidelně kontrolovat projekt na přítomnost dočasných a nepotřebných souborů
2. Udržovat dokumentaci aktuální a nefragmentovanou
3. Používat jednotnou organizaci kódu a souborů

Pro vyčištění projektu byl vytvořen skript `scripts/cleanup-project.sh`, který může být použit i v budoucnu.

## Dodatečné vyčištění adresáře scripts

Následující duplicitní a testovací skripty byly přesunuty do záložního adresáře:

### Testovací skripty
- test-auth-flow.js
- test-auth-working.js
- test-auth.js
- test-db.mjs
- test-login-fixed.js
- test-login-simple.js
- testAuth.mjs
- testLoginFlow.mjs

### Duplicitní admin skripty
- reset-admin.js
- reset-admin.ts

### Duplicitní SQL skripty
- set-pavel-password-with-prisma.sql
- simple-set-password.sql
- verify-pavel-login.sql

### Duplicitní skripty pro kategorie
- update-categories-with-fields.js
- update-categories.mjs
- update-category-slugs.js

Všechny tyto soubory byly zálohovány do adresáře: `/workspaces/pavelfweb/_cleanup_scripts_20250910091434`

