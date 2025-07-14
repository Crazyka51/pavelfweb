# Copilot Instructions for Pavel Fišer CMS

## Struktura projektu (root + hlavní složky)

```
ROOT
├── .env, .env.local, .env.development.local
├── .eslintrc.json, .prettierrc, .npmrc, .gitignore
├── package.json, pnpm-lock.yaml, tsconfig.json, tsconfig.tsbuildinfo
├── next.config.mjs, postcss.config.js, postcss.config.mjs, tailwind.config.js
├── vercel.json
├── cookies.txt, components.json, test-newsletter.sh, test-unsubscribe.sh
├── app/
│   ├── globals.css, layout.tsx, page.tsx
│   ├── 404/, admin/, aktuality/, api/, components/, data-deletion/, privacy-policy/, terms-of-service/
│   └── lib/
├── components/
│   ├── accordion.tsx, alert-dialog.tsx, ... (UI komponenty)
│   └── ui/
├── data/
│   ├── articles.json, newsletter-campaigns.json, newsletter-subscribers.json, newsletter-templates.json
│   └── backups/
├── database/
│   ├── migration.sql, schema.sql
├── dokumentace/
│   ├── README.md, ... (dokumentace, manuály, reporty)
├── hooks/
│   ├── use-admin-data.ts, use-admin-filters.ts, ...
├── lib/
│   ├── admin-state.ts, article-service.ts, auth-utils.ts, ...
│   ├── schema.ts, settings-service.ts, newsletter-service.ts, ...
│   └── services/
├── public/
│   ├── placeholder.svg, og-image.svg, ... (veřejné assety)
├── scripts/
│   ├── complete-setup.mjs, setup-database.js, ...
├── styles/
│   └── globals.css
└── ... (další konfigurační a systémové složky)
```

### Popis hlavních složek a souborů

- **app/** – Hlavní aplikační složka Next.js (App Router). Obsahuje stránky, layouty, API routy (`app/api`), administrační rozhraní (`app/admin`), veřejné stránky, globální styly a sdílené knihovny.
  - `app/api/` – Backend API endpointy (REST styl, chráněné JWT, komunikace pouze přes service vrstvu).
  - `app/admin/` – Admin rozhraní pro správu obsahu, článků, newsletteru atd.
  - `app/components/` – Sdílené komponenty používané v rámci app (např. layouty, modální okna).
  - `app/lib/` – Pomocné knihovny, utilitní funkce, business logika pro app.
  - `app/globals.css` – Globální styly pro Next.js app.

- **components/** – Sdílené UI komponenty (Radix UI, Tiptap, Tailwind, vlastní). Vše pro opakované použití napříč aplikací. Složka `ui/` obsahuje základní stavební bloky.

- **data/** – JSON soubory s články, šablonami, odběrateli newsletteru, zálohy. Slouží pro mockování, testování nebo rychlý import/export dat.

- **database/** – SQL schéma a migrace. `schema.sql` je hlavní zdroj pravdy pro strukturu DB, `migration.sql` pro změny a migrace.

- **dokumentace/** – Manuály, reporty, integrační návody, checklisty, popisy funkcí, změnové logy. Vše pro vývojáře i uživatele.

- **hooks/** – React hooky pro správu stavů, filtrů, notifikací, mobilního zobrazení atd. Používejte pro sdílenou logiku napříč komponentami.

- **lib/** – Service vrstva a business logika. Každá entita má svůj service soubor (`article-service.ts`, `settings-service.ts`), zde je jediný povolený přístup k DB. Obsahuje také schéma (`schema.ts`), autentizaci (`auth-utils.ts`), utility a další helpery.
  - `lib/services/` – Další rozšiřující služby a integrace.

- **public/** – Veřejně dostupné assety (obrázky, SVG, favicony, Open Graph obrázky, loga, placeholdery).

- **scripts/** – Setup a utility skripty pro správu DB, migrace, testování, inicializaci projektu. Např. `complete-setup.mjs` vytvoří a naplní DB podle aktuálního schématu.

- **styles/** – Globální styly, případně další CSS soubory mimo Tailwind.

- **root soubory** – Konfigurace, build, lint, env, lockfile, Tailwind, Next.js, Vercel, testovací skripty, ignore soubory. Vše potřebné pro běh, build a správu projektu.


## Architektura a hlavní principy
- Projekt je postaven na Next.js (TypeScript, App Router) s Drizzle ORM a Neon PostgreSQL.
- Backend API je v `app/api`, kde každá route odpovídá jedné entitě nebo akci (REST styl, např. `/api/admin/articles`).
- Autentizace je řešena pomocí JWT tokenů (viz `lib/auth-utils.ts`), session v cookies.
- Databázové schéma je v `lib/schema.ts` a synchronizuje se s Neon DB pomocí setup skriptů (`scripts/complete-setup.mjs`).
- Veškeré SQL dotazy a business logika jsou v service souborech (`lib/article-service.ts`, `lib/settings-service.ts` atd.).
- Frontend používá komponenty z `components/` a `app/admin/components/` (Radix UI, Tiptap, Tailwind CSS).

## Vývojářské workflow
- **Instalace:** `pnpm install` nebo `npm install`
- **Lokální spuštění:** `pnpm dev` (Next.js server na http://localhost:3000)
- **Kompletní setup DB:** `node scripts/complete-setup.mjs` (vytvoří a naplní Neon DB podle aktuálního schématu)
- **.env:** Všechny klíče a přístupy jsou v `.env.local` (viz příklad v `app/admin/README.md`)

### Automatické spuštění setup skriptu s TypeScript importy

Skript `scripts/complete-setup.mjs` importuje TypeScript soubory (`lib/schema.ts`). Pro automatické spuštění bez nutnosti ruční transpilace použijte runner `tsx`:

1. **Instalace závislosti (jednorázově):**
   ```
   pnpm add -D tsx
   ```
   nebo
   ```
   npm install --save-dev tsx
   ```

2. **Spuštění setup skriptu:**
   ```
   pnpm tsx scripts/complete-setup.mjs
   ```
   nebo
   ```
   npx tsx scripts/complete-setup.mjs
   ```

Tím se automaticky načtou TypeScript importy bez nutnosti generovat `.js` soubory. Doporučeno pro všechny vývojové a integrační skripty, které importují `.ts` soubory.

## Důležité konvence a vzory
- Všechny entity mají v kódu camelCase, v DB snake_case (např. `isPublished` v kódu, `is_published` v DB).
- Pro práci s daty používejte pouze service vrstvy (`lib/*-service.ts`), nikdy nevolat DB přímo z API nebo komponent.
- API routes jsou chráněné pomocí `requireAuth` (viz `lib/auth-utils.ts`).
- Pro nové tabulky vždy aktualizujte `lib/schema.ts` a setup skript.
- Pro testování použijte mock data nebo spusťte setup skript pro čistou DB.

## Externí integrace
- Facebook API, Resend (e-mail), Google Analytics – klíče v `.env.local`.
- Neon PostgreSQL – connection string v `.env.local` jako `DATABASE_URL`.

## Příklady a vzory
- CRUD nad články: `lib/article-service.ts`, API: `app/api/admin/articles/`
- Autentizace: `lib/auth-utils.ts`, session v cookies
- Editor článků: `app/admin/components/ArticleEditor.tsx` (Tiptap, vlastní helpery)

## Specifika projektu
- Všechny změny schématu DB synchronizujte přes setup skript, ne ručně v Neonu.
- Pro nové API vždy použijte autentizaci a service vrstvu.
- Dodržujte pojmenování sloupců podle vzoru v `lib/schema.ts`.

---

Pokud není něco jasné nebo chybí důležitý vzor, požádejte o doplnění nebo upřesnění!
