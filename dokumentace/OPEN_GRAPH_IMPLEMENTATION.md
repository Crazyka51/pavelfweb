# Open Graph Meta Tagy - Implementace

## ✅ Co bylo implementováno

### 1. Základní Open Graph meta tagy
- **og:title** - Název stránky pro sdílení
- **og:description** - Popis stránky pro sdílení  
- **og:image** - Obrázek pro sdílení (1200×630 px)
- **og:url** - URL stránky
- **og:type** - Typ obsahu (website/article)
- **og:site_name** - Název webu
- **og:locale** - Jazyk (cs_CZ)

### 2. Twitter Card meta tagy
- **twitter:card** - summary_large_image
- **twitter:title** - Název pro Twitter
- **twitter:description** - Popis pro Twitter
- **twitter:image** - Obrázek pro Twitter

### 3. Strukturovaná data (JSON-LD)
- Schema.org markup pro lepší SEO
- Podpora pro Person, Article, Website typy
- Automatické generování strukturovaných dat

### 4. Implementované stránky

#### Hlavní stránka (layout.tsx)
\`\`\`typescript
metadataBase: new URL('https://fiserpavel.cz'),
openGraph: {
  title: "Bc. Pavel Fišer | Zastupitel MČ Praha 4",
  description: "Oficiální stránky...",
  url: 'https://fiserpavel.cz',
  siteName: 'Pavel Fišer - Zastupitel MČ Praha 4',
  images: [{ url: '/og-image.svg', width: 1200, height: 630 }],
  locale: 'cs_CZ',
  type: 'website',
}
\`\`\`

#### Privacy Policy (/privacy-policy/page.tsx)
- Specifické OG meta tagy pro GDPR stránku
- Typ: 'article'
- Obrázek: '/og-privacy.svg'

#### Terms of Service (/terms-of-service/page.tsx)
- Specifické OG meta tagy pro podmínky použití
- Typ: 'article'
- Obrázek: '/og-terms.svg'

#### Data Deletion (/data-deletion/page.tsx)
- Specifické OG meta tagy pro GDPR smazání
- Typ: 'article'
- Obrázek: '/og-data-deletion.svg'

### 5. Vytvořené OG obrázky (placeholder)

#### /public/og-image.svg
- Hlavní obrázek pro domovskou stránku
- Modrý gradient pozadí
- Text: "Bc. Pavel Fišer" + "Zastupitel MČ Praha 4"
- Rozměry: 1200×630 px

#### /public/og-privacy.svg
- Obrázek pro Privacy Policy
- Zeleno-modrý gradient
- Ikona štítu + text o ochraně údajů

#### /public/og-terms.svg
- Obrázek pro Terms of Service
- Modrý gradient
- Ikona dokumentu + text o podmínkách

#### /public/og-data-deletion.svg
- Obrázek pro Data Deletion
- Červeno-modrý gradient
- Ikona koše + GDPR badge

### 6. Komponenta StructuredData
- `/app/components/StructuredData.tsx`
- Podporuje typy: person, article, website
- Automatické generování JSON-LD
- Konfigurovatelná metadata

## 🔧 Jak testovat

### Facebook Debugger
1. Jít na [developers.facebook.com/tools/debug/](https://developers.facebook.com/tools/debug/)
2. Zadat URL: `https://fiserpavel.cz`
3. Kliknout "Debug" a zkontrolovat načtené meta tagy

### Twitter Card Validator
1. Jít na [cards-dev.twitter.com/validator](https://cards-dev.twitter.com/validator)
2. Zadat URL a zkontrolovat náhled

### LinkedIn Post Inspector
1. Jít na [linkedin.com/post-inspector/](https://linkedin.com/post-inspector/)
2. Zadat URL a zkontrolovat náhled

### Manuální test v HTML
Zkontrolovat source code stránky - měly by být vidět meta tagy:
\`\`\`html
<meta property="og:title" content="...">
<meta property="og:description" content="...">
<meta property="og:image" content="...">
<meta property="og:url" content="...">
<meta property="og:type" content="...">
\`\`\`

## 📋 TODO pro produkci

### 1. Vyměnit placeholder obrázky
- Vytvořit profesionální JPG obrázky místo SVG
- Doporučená velikost: 1200×630 px, pod 1MB
- Použít foto Pavla Fišera
- Udržet konzistentní design

### 2. Nástroje pro vytvoření obrázků
- **Canva**: Template "Facebook Cover" (1200×630)
- **Figma**: Vlastní design
- **Adobe Photoshop**: Profesionální úprava

### 3. Přidat OG meta tagy na další stránky
- Pokud budou přidány články z CMS
- Dynamické OG meta tagy pro jednotlivé články
- Autor, datum publikace, kategorie

### 4. Optimalizace
- Komprese obrázků (WebP formát)
- CDN pro rychlejší načítání obrázků
- Cache headers pro OG obrázky

## 🎯 Výsledek
- ✅ Všechny požadované OG meta tagy implementovány
- ✅ Správný formát obrázků (1200×630 px)
- ✅ Strukturovaná data pro SEO
- ✅ Podpora pro všechny hlavní sociální sítě
- ✅ Testovatelné URL pro validaci
