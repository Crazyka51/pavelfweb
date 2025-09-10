# Pavel Fišer - Webové stránky

Oficiální webové stránky Pavla Fišera.

## O projektu

Tento projekt obsahuje zdrojové kódy pro osobní webové stránky Pavla Fišera, zastupitele Prahy 4.

## Technologie

- **Frontend:** Next.js, React, Tailwind CSS
- **Backend:** Next.js API routes
- **Databáze:** Neon PostgreSQL, Drizzle ORM
- **Autentizace:** JWT, HTTP-only cookies
- **Integrace:** Facebook API, Newsletter systém

## Struktura projektu

- `/app` - Next.js aplikace, komponenty a API routes
- `/components` - Sdílené React komponenty
- `/data` - Statická data
- `/database` - SQL skripty a databázové utility
- `/dokumentace` - Dokumentace projektu
- `/hooks` - React hooks
- `/lib` - Knihovny a utility
- `/prisma` - Databázové schémata
- `/public` - Statické soubory
- `/scripts` - Utility skripty
- `/styles` - CSS styly

## Lokální vývoj

1. Naklonujte repozitář
   ```
   git clone [URL repozitáře]
   ```

2. Nainstalujte závislosti
   ```
   npm install
   ```
   nebo
   ```
   pnpm install
   ```

3. Nastavte prostředí (vytvoření `.env` souboru)
   ```
   cp .env.example .env
   ```

4. Spusťte vývojový server
   ```
   npm run dev
   ```
   nebo
   ```
   pnpm dev
   ```

5. Otevřete [http://localhost:3000](http://localhost:3000)

## Administrace

Administrační rozhraní je dostupné na adrese `/admin`. Pro přístup je potřeba se přihlásit s administrátorskými přihlašovacími údaji.

## Údržba projektu

Projekt prošel vyčištěním 10. září 2025, kdy byly odstraněny duplicitní a nepotřebné soubory. Podrobnosti o tomto procesu najdete v dokumentaci:

- [Zpráva o vyčištění projektu](/dokumentace/CLEANUP_REPORT.md)

## Kontakt

Pro dotazy týkající se webových stránek kontaktujte vývojový tým.

## Licence

Všechna práva vyhrazena.
