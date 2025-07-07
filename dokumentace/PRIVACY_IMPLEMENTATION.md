# Privacy Policy a Terms of Service - Implementace

## 📋 Přehled

Vytvořili jsme kompletní implementaci stránek pro ochranu osobních údajů a podmínky použití pro webovou aplikaci Pavla Fišera, zastupitele Prahy 4.

## 🚀 Nové funkce

### 1. Privacy Policy stránka (`/privacy-policy`)
- **Kompletní GDPR compliance**
- Detailní informace o zpracování osobních údajů
- Kontaktní informace správce údajů
- Přehled práv uživatelů
- Informace o cookies a bezpečnosti

### 2. Terms of Service stránka (`/terms-of-service`)
- Podmínky použití webových stránek
- Autorská práva a duševní vlastnictví
- Omezení odpovědnosti
- Pravidla komunikace
- Řešení sporů

### 3. Cookie Banner komponenta
- **Automatické zobrazení** při první návštěvě
- Možnost přijetí nebo odmítnutí cookies
- **LocalStorage persistance** - uloží si volbu uživatele
- Odkazy na privacy policy

### 4. Aktualizovaný Footer
- Odkazy na nové právní stránky
- Správný odkaz na Facebook profil
- Responsive design

## 📁 Struktura souborů

\`\`\`
app/
├── privacy-policy/
│   └── page.tsx              # Privacy Policy stránka
├── terms-of-service/
│   └── page.tsx              # Terms of Service stránka
├── components/
│   ├── CookieBanner.tsx      # Cookie souhlas banner
│   └── Footer.tsx            # Aktualizovaný footer
└── layout.tsx                # Přidán CookieBanner
\`\`\`

## 🎨 Design vlastnosti

### Privacy Policy & Terms of Service
- **Moderní gradientní pozadí** (blue-50 to white)
- **Strukturovaný layout** s ikonami pro sekce
- **Responzivní design** pro všechna zařízení
- **Barevně kodované sekce** pro lepší orientaci
- **Breadcrumb navigace** zpět na hlavní stránku
- **SEO optimalizované** meta tagy

### Cookie Banner
- **Sticky positioning** - vždy viditelný na spodku
- **Elegant design** s ikonami
- **Dva tlačítka** - Přijmout / Odmítnout
- **Non-intrusive** - nebrání v prohlížení
- **Responsive** - adaptuje se na mobilní zařízení

## 🔧 Technické detaily

### Použité technologie
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Lucide Icons** - Moderní ikony
- **LocalStorage** - Persistence volby cookies

### Metadata a SEO
\`\`\`tsx
export const metadata: Metadata = {
  title: 'Zásady ochrany osobních údajů | Pavel Fišer',
  description: 'GDPR compliant privacy policy...',
  robots: 'index, follow',
}
\`\`\`

### Cookie Management
\`\`\`tsx
// Ukládání souhlasu
localStorage.setItem('cookieConsent', 'accepted')
localStorage.setItem('cookieConsentDate', new Date().toISOString())

// Kontrola při načtení
const cookieConsent = localStorage.getItem('cookieConsent')
\`\`\`

## 📱 Responzivní vlastnosti

### Desktop (md+)
- **3-column layout** v sekci kontaktů
- **Side-by-side grids** pro porovnání informací
- **Širší containers** pro lepší čitelnost

### Mobile
- **Single column** layout
- **Stack buttons** v cookie banneru
- **Collapsed grids** v informačních sekcích
- **Touch-friendly** button sizes

## 🎯 Použití

### Návštěvník stránky
1. **Při první návštěvě** se zobrazí cookie banner
2. **Kliknutí na privacy policy** z banneru nebo footeru
3. **Prohlížení strukturovaných informací** o zpracování údajů
4. **Možnost kontaktu** pro uplatnění práv

### Správce (Pavel Fišer)
1. **GDPR compliance** - automaticky splněno
2. **Transparentní komunikace** s občany
3. **Právní ochrana** - jasné podmínky použití
4. **Profesionální image** - důvěryhodnost

## 🔗 Propojení s Facebook integrací

Stránky jsou připravené pro propojení s plánovanou Facebook integrací:

- **Privacy policy vysvětluje** použití Facebook Graph API
- **Cookie banner pokrývá** Facebook Pixel cookies
- **Terms of service definují** pravidla pro externí obsah
- **Footer obsahuje odkaz** na správný Facebook profil

## 🚀 Spuštění

\`\`\`bash
# Development server
npm run dev

# Přístup k novým stránkám
http://localhost:3000/privacy-policy
http://localhost:3000/terms-of-service
\`\`\`

## 📞 Kontakt

Stránky obsahují aktuální kontaktní informace:
- **Email**: pavel.fiser@praha4.cz
- **Adresa**: Antala Staška 2059/80b, 140 00 Praha 4
- **Facebook**: https://www.facebook.com/profile.php?id=61574874071299

---

## ✅ Checklist implementace

- [x] Privacy Policy stránka s GDPR compliance
- [x] Terms of Service stránka
- [x] Cookie Banner komponenta
- [x] Aktualizovaný Footer s odkazy
- [x] Responzivní design
- [x] SEO metadata
- [x] TypeScript typy
- [x] Ikony a moderní UI
- [x] LocalStorage persistence
- [x] Navigační odkazy

**Status: ✅ Kompletní implementace připravená k nasazení**
