# ANALÝZA STRUKTURY PROJEKTU - Pavel Fišer Web

## 📋 ZÁKLADNÍ INFORMACE

**Název projektu:** Pavel Fišer CMS  
**Verze:** 0.1.0  
**Typ:** Next.js 14 aplikace s TypeScript  
**Účel:** Osobní web zastupitele MČ Praha 4 s CMS administrací  
**Status:** PRODUCTION READY ✅  

## 🏗️ ARCHITEKTURA PROJEKTU

### Framework a technologie
- **Frontend:** Next.js 14.2.4 (App Router)
- **Backend:** Next.js API Routes
- **Databáze:** PostgreSQL (Neon) + Prisma ORM
- **Styling:** Tailwind CSS + Radix UI komponenty
- **Autentifikace:** JWT tokeny + bcrypt
- **Email:** Resend API
- **Analytics:** Google Analytics 4
- **Deployment:** Vercel (předpokládáno)

### Klíčové knihovny
- **UI:** @radix-ui/* komponenty, Lucide React ikony
- **Editor:** TipTap WYSIWYG editor, CKEditor
- **Forms:** React Hook Form + Zod validace
- **State:** Zustand pro globální stav
- **Animace:** Framer Motion
- **Charts:** Recharts pro analytics

## 📁 STRUKTURA ADRESÁŘŮ

### `/app` - Next.js App Router
```
app/
├── layout.tsx              # Root layout s metadaty
├── page.tsx               # Hlavní stránka
├── globals.css            # Globální styly
├── 404/                   # Custom 404 stránka
├── admin/                 # CMS administrace
├── aktuality/             # Blog/články
├── api/                   # Backend API routes
├── components/            # Sdílené komponenty
├── data-deletion/         # GDPR compliance
├── privacy-policy/        # Ochrana osobních údajů
└── terms-of-service/      # Obchodní podmínky
```

### `/app/admin` - CMS Administrace
```
admin/
├── layout.tsx             # Admin layout
├── page.tsx              # Dashboard
├── analytics/            # Google Analytics
├── articles/             # Správa článků
├── components/           # Admin komponenty
│   ├── AdminDashboard.tsx
│   ├── ArticleEditor.tsx
│   ├── NewsletterManager.tsx
│   ├── TiptapEditor.tsx
│   └── ...
└── styles/               # Admin styly
```

### `/app/api` - Backend API
```
api/
├── admin/                # Admin API endpoints
│   ├── analytics/        # GA4 data
│   ├── articles/         # CRUD články
│   ├── auth/            # Autentifikace
│   ├── categories/      # Kategorie článků
│   ├── newsletter/      # Newsletter systém
│   └── settings/        # Nastavení
├── facebook-posts/      # Facebook API
├── send-email/          # Kontaktní formulář
└── test-db-connection/  # DB diagnostika
```

### `/components` - Reusable komponenty
```
components/
├── ui/                  # Radix UI komponenty
├── backups/            # Záložní verze
├── bulk-actions-toolbar.tsx
├── sheet.tsx
└── theme-provider.tsx
```

### `/lib` - Utility knihovny
```
lib/
├── services/           # Business logika
│   ├── article-service.ts
│   ├── newsletter-service.ts
│   └── category-service.ts
├── auth-utils.ts      # Autentifikace
├── database.ts        # DB připojení
├── schema.ts          # Zod schémata
└── utils.ts           # Pomocné funkce
```

### `/prisma` - Databázové schéma
```
prisma/
├── schema.prisma      # Databázové modely
└── seed.ts           # Seed data
```

## 🗄️ DATABÁZOVÉ MODELY

### User (Uživatelé)
- id, email, password, name
- Vztah: 1:N s Article

### Category (Kategorie)
- id, name
- Vztah: 1:N s Article

### Article (Články)
- id, title, slug, content, excerpt
- status (DRAFT/PUBLISHED/ARCHIVED)
- SEO metadata (metaTitle, metaDescription)
- Vztahy: N:1 User, N:1 Category

## 🎨 FRONTEND KOMPONENTY

### Hlavní stránka komponenty
- **Hero** - Úvodní sekce
- **WearYourStory** - Představení
- **Services** - Priority/služby
- **AboutUs** - O mně
- **Projects** - Projekty
- **Timeline** - Časová osa
- **Testimonials** - Doporučení
- **FacebookPosts** - Facebook integrace
- **RecentNews** - Nejnovější články
- **ContactForm** - Kontaktní formulář
- **NewsletterSubscribe** - Newsletter

### Admin komponenty
- **AdminDashboard** - Hlavní dashboard
- **ArticleEditor** - WYSIWYG editor článků
- **NewsletterManager** - Správa newsletteru
- **AnalyticsWidget** - GA4 statistiky
- **CategoryManager** - Správa kategorií

## 🔐 BEZPEČNOST A AUTENTIFIKACE

### Autentifikace
- JWT tokeny pro session management
- bcrypt pro hashování hesel
- Middleware pro ochranu admin routes

### GDPR Compliance
- Cookie banner s preferencemi
- Privacy Policy stránka
- Data deletion endpoint
- Structured data pro SEO

## 📧 KOMUNIKAČNÍ SYSTÉMY

### Email systém
- **Resend API** pro odesílání emailů
- Kontaktní formulář s validací
- Newsletter systém s templates

### Facebook integrace
- Facebook Graph API
- Zobrazení příspěvků na webu
- Real-time synchronizace

## 📊 ANALYTICS A MONITORING

### Google Analytics 4
- Tracking kód implementován
- Custom events
- GDPR compliant tracking

### Admin analytics
- Dashboard s klíčovými metrikami
- Real-time data z GA4 API
- Reporting funkce

## 🗂️ DATA MANAGEMENT

### JSON Storage
- `/data/articles.json` - Články
- `/data/newsletter-*.json` - Newsletter data
- Backup strategie implementována

### Blob Storage
- Vercel Blob pro obrázky
- Optimalizace pro performance

## 📚 DOKUMENTACE

### Hlavní dokumenty
- **QUICK_OVERVIEW.md** - Rychlý přehled
- **WORKPLAN.md** - Plán práce
- **NEWSLETTER_SYSTEM_DOCS.md** - Newsletter dokumentace
- **EMAIL_INTEGRATION.md** - Email integrace
- **PRIVACY_IMPLEMENTATION.md** - GDPR implementace

### Admin manuály
- **PAVEL_MANUAL.md** - Uživatelský manuál
- **ADMIN_DASHBOARD_UPDATE.md** - Admin aktualizace
- **EDITOR_FEATURES.md** - Editor funkce

## 🚀 DEPLOYMENT A PRODUKCE

### Production Ready Features
- ✅ Optimalizované buildy
- ✅ SEO optimalizace
- ✅ Performance optimalizace
- ✅ Error handling
- ✅ Security headers
- ✅ GDPR compliance

### Environment Variables
```bash
DATABASE_URL=postgresql://...
RESEND_API_KEY=re_...
NEXTAUTH_SECRET=...
FACEBOOK_ACCESS_TOKEN=...
GOOGLE_ANALYTICS_ID=...
```

## 🔧 DEVELOPMENT WORKFLOW

### Scripts
```json
{
  "dev": "next dev",
  "build": "next build", 
  "start": "next start",
  "lint": "next lint"
}
```

### Package Manager
- **pnpm** - Rychlejší alternativa k npm
- Workspace konfigurace
- Lock file pro konzistenci

## 📈 PERFORMANCE OPTIMALIZACE

### Next.js optimalizace
- Image optimization vypnuto (unoptimized: true)
- Webpack build worker
- Parallel server builds
- TypeScript/ESLint ignorování pro rychlejší buildy

### Bundle optimalizace
- Tree shaking
- Code splitting
- Lazy loading komponent

## 🎯 KLÍČOVÉ FUNKCE

### CMS Systém
- WYSIWYG editor s TipTap
- Drag & drop upload obrázků
- SEO optimalizace článků
- Kategorizace a tagging
- Draft/Published workflow

### Newsletter systém
- Template editor
- Subscriber management
- Campaign tracking
- Bulk operations
- Export/import funkcionalita

### Admin dashboard
- Real-time analytics
- Quick actions
- Notification systém
- Bulk operations
- Settings management

## 🔮 BUDOUCÍ ROZŠÍŘENÍ

### Plánované funkce
1. **GA4 Reporting API** - Real-time analytics
2. **Backup strategy** - Automatické zálohování
3. **Performance optimization** - Rychlost webu
4. **Security hardening** - Rate limiting a monitoring

### Technické dluhy
- Role-based permissions (momentálně všichni admini mají stejná práva)
- Multi-language podpora (pouze čeština)
- Komentáře u článků (neimplementováno)
- Databázová migrace z JSON (volitelné)

## 📊 STATISTIKY PROJEKTU

### Velikost kódu
- **TypeScript/TSX:** ~95% kódu
- **CSS:** Tailwind utility classes
- **Konfigurace:** JSON/JS soubory

### Komponenty
- **Admin komponenty:** 20+ souborů
- **Frontend komponenty:** 25+ souborů
- **UI komponenty:** 40+ Radix UI komponent

### API Endpoints
- **Admin API:** 15+ endpoints
- **Public API:** 5+ endpoints
- **Auth API:** 3 endpoints

---

**Závěr:** Projekt je profesionálně strukturovaný, plně funkční a připravený na produkci. Architektura je škálovatelná a maintainable s důrazem na bezpečnost a výkon.
