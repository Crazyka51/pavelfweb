# STANDARDIZACE DATABÁZOVÝCH MODELŮ - ZPRÁVA O PROVEDENÝCH ZMĚNÁCH

**Datum**: 23. srpna 2025  
**Autor**: GitHub Copilot  
**Projekt**: Pavel Fišer WEB

## Shrnutí změn

V rámci standardizace databázových modelů byly provedeny následující změny:

1. **Vytvoření migračního skriptu** pro přenos dat z legacy modelů do standardizovaných modelů
2. **Vytvoření databázových triggerů** pro zachování kompatibility během přechodného období
3. **Vytvoření dokumentace** ke standardizaci modelů
4. **Analýza kódu** pro identifikaci míst používajících legacy modely

## Detailní popis změn

### 1. Migrační skript (`scripts/migrate-legacy-models.ts`)

Byl vytvořen skript pro migraci dat z legacy modelů do standardizovaných modelů:

- **Články**: `articles` → `Article`
- **Kategorie**: Již používá standardizovaný model `Category`
- **Odběratelé newsletteru**: `newsletter_subscribers` → `NewsletterSubscriber`
- **Šablony newsletteru**: `newsletter_templates` → `NewsletterTemplate`
- **Kampaně newsletteru**: `newsletter_campaigns` → `NewsletterCampaign`

Skript zajišťuje bezpečnou migraci dat včetně všech vztahů mezi entitami.

### 2. Databázové triggery (`prisma/migrations/standardize_schema.sql`)

Pro zachování zpětné kompatibility během přechodného období byly vytvořeny databázové triggery, které zajišťují synchronizaci dat mezi standardizovanými a legacy modely:

- **Article → articles**: Synchronizace dat z `Article` do `articles`
- **NewsletterSubscriber → newsletter_subscribers**: Synchronizace dat z `NewsletterSubscriber` do `newsletter_subscribers`
- **NewsletterTemplate → newsletter_templates**: Synchronizace dat z `NewsletterTemplate` do `newsletter_templates`
- **NewsletterCampaign → newsletter_campaigns**: Synchronizace dat z `NewsletterCampaign` do `newsletter_campaigns`

Tyto triggery zajišťují, že i po přechodu na standardizované modely budou legacy modely stále aktuální, dokud nebude celá aplikace přepsána na používání standardizovaných modelů.

### 3. Dokumentace standardizace (`dokumentace/DATABASE_STANDARDIZACE.md`)

Byla vytvořena podrobná dokumentace procesu standardizace, která obsahuje:

- **Seznam standardizovaných modelů**
- **Postup migrace**
- **Pokyny pro vývojáře** ohledně používání standardizovaných modelů
- **Časový plán** dokončení standardizace

### 4. Analýza kódu

Byla provedena podrobná analýza kódu pro identifikaci míst, kde jsou používány legacy modely. Z analýzy vyplývá:

- **Komponenty administrace**: Používají převážně standardizované modely (`Article`, `Category`)
- **API endpointy**: Používají převážně standardizované modely
- **Služby**: Některé služby používají legacy modely, zejména `newsletter-service.ts`

## Aktuální stav standardizace

Standardizace je nyní ve fázi 1 - byly vytvořeny potřebné skripty a dokumentace. Následovat budou další fáze:

1. ✅ **Fáze 1**: Vytvoření migračních skriptů a triggerů (dokončeno)
2. ⏳ **Fáze 2**: Postupná úprava kódu (probíhá)
3. ⏱️ **Fáze 3**: Odstranění závislostí na legacy modelech (plánováno)
4. ⏱️ **Fáze 4**: Odstranění legacy modelů (plánováno)

## Doporučený postup pro vývojáře

1. **Spuštění migrace**: Před začátkem vývoje spustit migrační skript pomocí příkazu `npx ts-node scripts/migrate-legacy-models.ts`
2. **Aplikace triggerů**: Spustit SQL skript `prisma/migrations/standardize_schema.sql` v databázi
3. **Dodržování dokumentace**: Při vývoji se řídit pokyny v dokumentaci `DATABASE_STANDARDIZACE.md`

## Potenciální rizika

1. **Datová konzistence**: Během migrace může dojít k problémům s datovou konzistencí
2. **Komplikace při nasazení**: Triggery mohou způsobit komplikace při nasazení
3. **Dočasné zpomalení aplikace**: Triggery mohou způsobit mírné zpomalení aplikace

Všechna tato rizika jsou řešitelná a dočasná - po dokončení standardizace budou triggery odstraněny a aplikace bude využívat pouze standardizované modely.
