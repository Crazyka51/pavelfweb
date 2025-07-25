# CMS Integrace s Hlavní Stránkou

## Přehled
Tento dokument popisuje, jak je CMS propojeno s hlavní stránkou Pavel Fišer webu a jak články publikované v CMS automaticky zobrazují na hlavní stránce.

## Architektura

### CMS (Test verze)
- **Port**: 3001 (localhost:3001)
- **API Endpoint**: `/api/public/articles`
- **Úložiště**: JSON soubor (`data/articles.json`)

### Hlavní Web
- **Port**: 3000 (localhost:3000)
- **Zobrazení článků**: Komponenta `RecentNews`
- **Stránky**: `/aktuality` (seznam všech článků), `/aktuality/[id]` (detail článku)

## Workflow

### 1. Publikování článku v CMS
1. Pavel se přihlásí do CMS (localhost:3001)
2. Vytvoří nový článek pomocí WYSIWYG editoru
3. Nastaví kategorii, štítky, obrázek
4. Označí článek jako "Publikován"
5. Uloží článek

### 2. Zobrazení na hlavní stránce
1. Hlavní stránka automaticky načte nejnovější 3 publikované články
2. Články se zobrazí v sekci "Aktuální novinky"
3. Návštěvníci mohou kliknout na "Zobrazit všechny novinky" pro přechod na `/aktuality`

## API Endpointy

### Veřejný API pro články
\`\`\`
GET /api/public/articles
\`\`\`

**Parametry:**
- `limit` - počet článků (výchozí: všechny)
- `offset` - offset pro stránkování
- `category` - filtr podle kategorie

**Odpověď:**
\`\`\`json
{
  "articles": [
    {
      "id": "string",
      "title": "string",
      "content": "string",
      "excerpt": "string",
      "category": "string",
      "tags": ["string"],
      "published": true,
      "createdAt": "ISO date",
      "updatedAt": "ISO date",
      "imageUrl": "string"
    }
  ],
  "total": number,
  "hasMore": boolean
}
\`\`\`

## Komponenty na hlavní stránce

### RecentNews
- **Umístění**: `app/components/RecentNews.tsx`
- **Funkce**: Zobrazuje 3 nejnovější publikované články
- **Fallback**: Pokud CMS není dostupný, zobrazí mock data
- **Vlastnosti**:
  - Automatické načítání při načtení stránky
  - Responsive design
  - Kategorie s barevným rozlišením
  - Formátování data v češtině
  - Link na detail článku a na všechny novinky

### Stránka Aktuality (/aktuality)
- **Komponenta**: `app/aktuality/NewsPage.tsx`
- **Funkce**: Zobrazuje všechny publikované články s filtrováním a stránkováním
- **Vlastnosti**:
  - Vyhledávání v názvu, obsahu a štítcích
  - Filtrování podle kategorií
  - Stránkování (6 článků na stránku)
  - Responsive grid layout

### Detail článku (/aktuality/[id])
- **Komponenta**: `app/aktuality/[id]/ArticleDetailPage.tsx`
- **Funkce**: Zobrazuje úplný obsah článku
- **Vlastnosti**:
  - SEO optimalizované metadata
  - Sdílení na sociálních sítích
  - Informace o autorovi
  - Navigace zpět na seznam

## Nasazení do produkce

### Doporučená architektura pro produkci:

1. **CMS**: Samostatná subdoména (cms.pavelfiser.cz)
2. **Hlavní web**: Hlavní doména (pavelfiser.cz)
3. **Databáze**: PostgreSQL nebo MongoDB místo JSON souboru
4. **API**: REST API s autentifikací
5. **CDN**: Pro obrázky a statické soubory

### Kroky pro produkční nasazení:

1. **Databáze**:
   \`\`\`sql
   CREATE TABLE articles (
     id UUID PRIMARY KEY,
     title VARCHAR(255) NOT NULL,
     content TEXT NOT NULL,
     excerpt TEXT,
     category VARCHAR(100),
     tags JSONB,
     published BOOLEAN DEFAULT false,
     image_url VARCHAR(500),
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );
   \`\`\`

2. **Environment Variables**:
   \`\`\`
   # CMS
   DATABASE_URL=postgresql://...
   JWT_SECRET=c9f733d944090adced308bd6acbda326da8c2dcaf700988f866a096d0f3cce8d
   ADMIN_PASSWORD_HASH=bcrypt-hash
   
   # Hlavní web
   CMS_API_URL=https://cms.pavelfiser.cz/api
   \`\`\`

3. **Nginx konfigurace**:
   \`\`\`nginx
   # Hlavní web
   server {
     server_name pavelfiser.cz;
     location / {
       proxy_pass http://localhost:3000;
     }
   }
   
   # CMS
   server {
     server_name cms.pavelfiser.cz;
     location / {
       proxy_pass http://localhost:3001;
     }
   }
   \`\`\`

## Bezpečnost

### Současný stav (test):
- Pouze localhost přístup
- Jednoduchá autentifikace (admin/admin123)
- JSON soubor jako úložiště

### Produkční požadavky:
- HTTPS pro všechny endpointy
- Silné heslo pro admina
- JWT s expirací
- Rate limiting na API
- Zálohování databáze
- Monitoring a logování

## Testování

### Ruční test:
1. Spusťte CMS: `cd cms-test && npm run dev`
2. Vytvořte a publikujte článek
3. Spusťte hlavní web: `npm run dev` 
4. Zkontrolujte zobrazení na hlavní stránce

### Automatizovaný test:
\`\`\`bash
# Test API endpointu
curl "http://localhost:3001/api/public/articles?limit=3"

# Test zobrazení na hlavní stránce
curl "http://localhost:3000/aktuality"
\`\`\`

## Řešení problémů

### CMS není dostupný:
- Hlavní stránka zobrazí fallback mock data
- Žádná chyba se nezobrazí uživatelům

### Článek se nezobrazuje:
1. Zkontrolujte, zda je článek označen jako "Publikován"
2. Refresh hlavní stránky (cache může být zastaralá)
3. Zkontrolujte CMS API endpoint

### Obrázky se nezobrazují:
1. Zkontrolujte URL obrázku v CMS
2. Ujistěte se, že obrázek je veřejně dostupný
3. V produkci použijte CDN pro obrázky

## Další vylepšení

### Plánovaná funkcionalita:
- Automatické publikování podle naplánovaného času
- Push notifikace pro nové články
- RSS feed pro články
- Email newsletter s nejnovějšimi články
- Webhooks pro externí systémy
- Verzování článků
- Komentáře od čtenářů (s moderací)
