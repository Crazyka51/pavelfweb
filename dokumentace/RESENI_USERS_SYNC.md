# Řešení problému s tabulkou users_sync

Tento dokument popisuje řešení problému s neexistující tabulkou `users_sync` a chybějícím sloupcem `published` v databázi.

## Identifikovaný problém

Při spouštění databázových skriptů docházelo k chybě:

```
NeonDbError: relation "users_sync" does not exist
```

Tato chyba vznikala, protože některé skripty předpokládaly existenci tabulky `users_sync` se sloupcem `published`, která ve skutečnosti v databázi neexistuje.

## Provedené úpravy

1. **Vytvořen skript pro bezpečné přidání tabulky `users_sync`**
   - Soubor: `database/add-published-to-users-sync.sql`
   - Skript bezpečně kontroluje existenci tabulky pomocí `information_schema`
   - Pokud tabulka neexistuje, vytvoří ji včetně všech potřebných sloupců
   - Pokud existuje, zkontroluje a případně přidá chybějící sloupec `published`

2. **Vytvořen skript pro vložení vzorových dat**
   - Soubor: `database/insert-sample-users-sync.sql`
   - Vkládá tři vzorové záznamy do tabulky `users_sync`
   - Používá `ON CONFLICT DO NOTHING` pro prevenci duplicit

3. **Aktualizovány npm skripty v `package.json`**
   - Skript `db:fix-users-sync` nyní:
     - Vytvoří nebo upraví tabulku `users_sync`
     - Vloží vzorová data
   - Přidán nový skript `db:setup-all`, který:
     - Vytvoří/upraví tabulku `users_sync`
     - Sjednotí názvy sloupců (`published` vs `is_published`) v tabulce `articles`
     - Spustí základní setup databáze

## Struktura vytvořené tabulky `users_sync`

```sql
CREATE TABLE users_sync (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    raw_json JSONB,
    published BOOLEAN DEFAULT false
);
```

## Vzorová data

Do tabulky jsou vloženy tři základní záznamy:

1. Pavel Fišer (`pavel.fiser@praha4.cz`) - role admin, published=true
2. Admin Webu (`admin@example.com`) - role editor, published=true
3. Testovací Uživatel (`test@example.com`) - role user, published=false

## Jak používat vytvořené skripty

Pro kompletní řešení problému stačí spustit jeden příkaz:

```bash
npm run db:setup-all
```

Tento příkaz postupně:
1. Vytvoří/upraví tabulku `users_sync` a vloží do ní vzorová data
2. Sjednotí názvy sloupců v tabulce `articles` (řeší problém s `published` vs `is_published`)
3. Provede základní setup databáze

## Poznámky k řešení

- Tabulka `users_sync` nebyla v původním schématu (`schema.sql`), proto jsme ji museli vytvořit zvlášť
- Přidali jsme sloupec `published` přesně podle požadavků
- Skript je navržen tak, aby byl idempotentní - lze ho spustit opakovaně bez nežádoucích vedlejších účinků
- Používáme `information_schema` pro bezpečnou kontrolu existence tabulek a sloupců (místo použití `regclass`, které způsobovalo chyby)
