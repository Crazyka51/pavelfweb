# 📋 PAVEL FIŠER WEB - WORKPLAN & TODO LIST

**Datum vytvoření:** 27. června 2025
**Aktuální stav:** 85% dokončeno
**Priority:** HIGH → MEDIUM → LOW

---

## 🔥 HIGH PRIORITY - KRITICKÉ FUNKCE

### 1. MULTI-ADMIN SYSTEM
- [x] ✅ **Přidat admina "Crazyk"** s heslem kILhQO9h3@NY
- [x] ✅ **Aktualizovat login systém** pro více adminů
- [x] ✅ **Vygenerovat správný bcrypt hash** pro nové heslo
- [x] ✅ **Opravit CookiePreferences.tsx** (byl prázdný, způsoboval onClick chyby)
- [x] ✅ **Ověřit produkční build** (lokálně úspěšný)
- [ ] 🟡 **Testovat přihlášení obou adminů** v prohlížeči
- [ ] 🟡 **Zobrazit aktuálně přihlášeného admina** v admin panelu
- [ ] 🟡 **Deploy na produkci** a otestovat

### 2. NEWSLETTER MANAGEMENT SYSTEM
- [ ] ❌ **Vytvořit Newsletter component** (/admin/newsletter)
- [ ] ❌ **API pro newsletter subscribers** (/api/admin/newsletter)
- [ ] ❌ **Newsletter template editor** (WYSIWYG)
- [ ] ❌ **Email campaign management**
- [ ] ❌ **Subscriber list management** (import/export)
- [ ] ❌ **Newsletter analytics** (open rates, clicks)
- [ ] ❌ **Integration s Resend API** pro bulk emails
- [ ] ❌ **Newsletter signup form** na hlavní stránce
- [ ] ❌ **Unsubscribe mechanismus** s GDPR compliance

### 3. REAL GOOGLE ANALYTICS 4 INTEGRATION
- [ ] ❌ **GA4 Reporting API** setup
- [ ] ❌ **Real-time visitor data** v admin dashboardu
- [ ] ❌ **Article performance metrics** (views, time on page)
- [ ] ❌ **Traffic sources analysis**
- [ ] ❌ **Monthly/weekly reports** automation
- [ ] ❌ **Custom events tracking** pro CMS actions

### 4. DATABASE MIGRATION
- [ ] ❌ **PostgreSQL/MySQL setup** (doporučuji PostgreSQL)
- [ ] ❌ **Prisma ORM installation** a configuration
- [ ] ❌ **Database schema design** (users, articles, categories, newsletter)
- [ ] ❌ **Migration scripts** z JSON files
- [ ] ❌ **Update všech API routes** pro database
- [ ] ❌ **Connection pooling** a optimization
- [ ] ❌ **Backup strategy** implementation

---

## 🚀 MEDIUM PRIORITY - VYLEPŠENÍ

### 5. IMAGE OPTIMIZATION & MANAGEMENT
- [ ] ❌ **Next.js Image optimization** setup
- [ ] ❌ **Image upload API** enhancement
- [ ] ❌ **Multiple image formats** support (WebP, AVIF)
- [ ] ❌ **Image compression** pipeline
- [ ] ❌ **CDN integration** (Cloudinary/Vercel)
- [ ] ❌ **Alt text management** pro SEO
- [ ] ❌ **Image gallery** v admin panelu

### 6. SEARCH FUNCTIONALITY
- [ ] ❌ **Full-text search** pro články
- [ ] ❌ **Search API endpoint** (/api/search)
- [ ] ❌ **Search UI component** na hlavní stránce
- [ ] ❌ **Advanced filters** (kategorie, datum, autor)
- [ ] ❌ **Search analytics** (popular queries)

### 7. PERFORMANCE OPTIMIZATIONS
- [ ] ❌ **Bundle analysis** a optimization
- [ ] ❌ **Code splitting** improvements
- [ ] ❌ **Caching strategies** (Redis/Vercel)
- [ ] ❌ **Lazy loading** optimizations
- [ ] ❌ **Core Web Vitals** monitoring
- [ ] ❌ **Lighthouse score** optimization (cíl: 95+)

### 8. SCHEDULED PUBLISHING
- [ ] ❌ **Cron job system** pro scheduled posts
- [ ] ❌ **Queue management** pro publishing
- [ ] ❌ **Time zone handling** (Prague timezone)
- [ ] ❌ **Draft scheduling UI** v editoru
- [ ] ❌ **Social media auto-posting** (Facebook)

---

## 📊 LOW PRIORITY - NICE TO HAVE

### 9. ADVANCED CMS FEATURES
- [ ] ❌ **Article versioning** system
- [ ] ❌ **Bulk operations** (delete, publish, category change)
- [ ] ❌ **Article templates** system
- [ ] ❌ **Custom fields** pro články
- [ ] ❌ **Related articles** suggestions
- [ ] ❌ **Article series** management

### 10. SEO & CONTENT IMPROVEMENTS
- [ ] ❌ **RSS feed** auto-generation
- [ ] ❌ **XML Sitemap** automation
- [ ] ❌ **Schema.org markup** enhancement
- [ ] ❌ **Meta descriptions** auto-generation
- [ ] ❌ **SEO scoring** v article editoru

### 11. MONITORING & ANALYTICS
- [ ] ❌ **Error tracking** (Sentry integration)
- [ ] ❌ **Performance monitoring** (Web Vitals)
- [ ] ❌ **Uptime monitoring** setup
- [ ] ❌ **Custom metrics** dashboard
- [ ] ❌ **Alert system** pro chyby

### 12. PROGRESSIVE WEB APP
- [ ] ❌ **Service Worker** implementation
- [ ] ❌ **Offline reading** capability
- [ ] ❌ **Push notifications** system
- [ ] ❌ **App manifest** configuration
- [ ] ❌ **Install prompt** implementation

---

## ⚠️ EXCLUDED FROM SCOPE

### ❌ FUNKCE KTERÉ NEBUDOU IMPLEMENTOVÁNY:
- **Multi-language support** - web bude pouze v češtině
- **Role-based permissions** - všichni admini mají stejné oprávnění
- **Notification system** - není potřeba
- **Comment system** - nechceme komentování článků
- **User registration** - pouze admin přístup

---

## 🔧 TECHNICAL DEBT & MAINTENANCE

### 13. CODE QUALITY IMPROVEMENTS
- [ ] ❌ **TypeScript strict mode** zapnutí
- [ ] ❌ **ESLint rules** enhancement
- [ ] ❌ **Component documentation** (Storybook?)
- [ ] ❌ **Unit tests** pro kritické funkce
- [ ] ❌ **Integration tests** pro API
- [ ] ❌ **E2E tests** pro admin panel

### 14. SECURITY ENHANCEMENTS
- [ ] ❌ **Rate limiting** pro API endpoints
- [ ] ❌ **CSRF protection** enhancement
- [ ] ❌ **Input validation** improvements
- [ ] ❌ **Security headers** optimization
- [ ] ❌ **Audit logs** pro admin actions

---

## 📅 MILESTONES & TIMELINE

### **Milestone 1 - Core Completion (Týden 1-2)**
- Multi-admin system ✅
- Newsletter management system
- Real GA4 integration

### **Milestone 2 - Database & Performance (Týden 3-4)**
- Database migration
- Image optimization
- Search functionality

### **Milestone 3 - Advanced Features (Týden 5-6)**
- Scheduled publishing
- Performance optimizations
- Advanced CMS features

### **Milestone 4 - Polish & Launch (Týden 7-8)**
- SEO improvements
- Monitoring setup
- Final optimizations

---

## 📝 NOTES & DECISIONS

- **Database:** PostgreSQL bude použit pro produkci
- **Email Service:** Resend zůstává pro newsletter i contact form
- **Image Storage:** Vercel Blob Storage nebo Cloudinary
- **Monitoring:** Vercel Analytics + custom dashboard
- **Backup:** Automatické denní zálohy databáze

---

**Aktualizováno:** 27. června 2025
**Odpovědná osoba:** Pavel Fišer, Crazyk (admini)
**Priorita:** HIGH priority items first, pak postupně dolů
