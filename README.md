# Pavel Fišer Web Project

Web aplikace postavená na Next.js s administračním panelem pro správu obsahu.

## Instalace

Projekt využívá pnpm jako správce balíčků. Ujistěte se, že máte nainstalovaný pnpm:

```bash
npm install -g pnpm
```

### Spuštění projektu

1. Naklonujte repozitář:
```bash
git clone <repository-url>
cd pavelfweb
```

2. Nainstalujte závislosti:
```bash
pnpm install
```

3. Spusťte vývojový server:
```bash
pnpm dev
```

4. Projekt bude dostupný na `http://localhost:3000`

### Ostatní příkazy

- Sestavení produkční verze:
```bash
pnpm build
```

- Spuštění produkční verze:
```bash
pnpm start
```

- Linting kódu:
```bash
pnpm lint
```

- Setup databáze:
```bash
pnpm db:setup
```

- Test databáze:
```bash
pnpm db:test
```

## Administrace

Administrační panel je dostupný na `/admin` a obsahuje:

- **Dashboard** - Přehled statistik a rychlé akce
- **Články** - Správa článků a příspěvků
- **Kategorie** - Správa kategorií článků
- **Newsletter** - Správa odběratelů a kampaní
- **Analytika** - Přehled návštěvnosti a metrik
- **Nastavení** - Konfigurace systému

## Technologie

- **Next.js 15** - React framework s App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Drizzle ORM** - Type-safe SQL ORM
- **Neon Database** - Serverless PostgreSQL
- **Shadcn/ui** - UI komponenty
- **Lucide React** - Ikony

## Struktura projektu

```
app/
├── admin/              # Administrační panel
│   ├── dashboard/      # Dashboard sekce
│   ├── components/     # Admin komponenty
│   └── ...
├── api/               # API endpoints
├── components/        # Sdílené komponenty
└── ...
lib/
├── services/          # Business logika
├── database.ts        # Databázové připojení
└── ...
```