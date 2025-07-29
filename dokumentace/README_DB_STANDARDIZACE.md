# Standardizace databázových skriptů v projektu Pavel Fišer CMS

## Informace o plánované standardizaci

Vytvořil jsem plán standardizace všech databázových skriptů v projektu Pavel Fišer CMS. Pro jednotný přístup k databázi doporučuji používat:

1. **@neondatabase/serverless** - Moderní klient optimalizovaný pro serverless prostředí
2. **ES Modules** - Modernější přístup k importům s `.mjs` soubory 

## Vytvořené dokumenty

K dispozici jsou dva dokumenty, které detailně popisují standardizaci:

### 1. NEON_DB_STANDARDIZACE.md

Tento dokument obsahuje:
- Analýzu současného stavu
- Plán standardizace včetně výběru preferovaného klienta a stylu importů
- Seznam skriptů ke standardizaci s konkrétními akcemi
- Ukázky konverze kódu
- Návrh konkrétních změn pro každý skript
- Vzorovou implementaci s Neon klientem

**Cesta k dokumentu:** `c:\Users\matej\Desktop\fix\dokumentace\NEON_DB_STANDARDIZACE.md`

### 2. VZOROVY_SETUP_SCHEMA.mjs

Pro lepší představu jsem vytvořil vzorový přepsaný skript, který ukazuje, jak by měl vypadat `setup-schema.mjs` po konverzi z `pg` klienta na `@neondatabase/serverless`.

Tento vzorový soubor používá:
- ES Module importy
- Neon klienta místo standardního PostgreSQL klienta
- SQL template strings pro jednodušší dotazy

**Cesta k dokumentu:** `c:\Users\matej\Desktop\fix\dokumentace\VZOROVY_SETUP_SCHEMA.mjs`

## Doporučený další postup

1. Projděte si oba dokumenty a potvrďte navrhovaný směr standardizace
2. Postupně implementujte navrhované změny podle plánu v NEON_DB_STANDARDIZACE.md
3. Použijte VZOROVY_SETUP_SCHEMA.mjs jako vzor pro konverzi dalších skriptů

Pro spouštění .mjs skriptů s TypeScript importy doporučuji použít nástroj `tsx`:

```bash
npx tsx scripts/complete-setup.mjs
```

Tímto způsobem je možné přímo importovat TypeScript soubory bez nutnosti manuální transpilace.
