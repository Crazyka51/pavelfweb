# Email Integration - Resend API

Tato dokumentace popisuje implementaci skutečného odesílání e-mailů z kontaktního formuláře pomocí Resend API.

## 🚀 Funkce

- **Skutečné odesílání e-mailů**: Formulář nyní odesílá skutečné e-maily místo simulace
- **Validace dat**: Server-side validace pomocí Zod schema
- **Konfigurovatelné adresy**: E-mailové adresy lze nastavit přes environment variables
- **Error handling**: Robustní zpracování chyb s uživatelsky přívětivými zprávami
- **Bezpečnost**: API route je chráněna a používá POST metodu
- **HTML + Text**: E-maily se odesílají v HTML i textové verzi

## 📁 Soubory

### API Route
- `app/api/send-email/route.ts` - Server-side logika pro odesílání e-mailů

### Komponenty
- `app/components/ContactForm.tsx` - Aktualizovaný kontaktní formulář s real-time feedback

### Konfigurace
- `.env.example` - Příklady environment variables
- `.env.local` - Lokální konfigurace (není v git)

## 🔧 Nastavení Resend API

### 1. Registrace a API klíč

\`\`\`bash
# Kroky:
# 1. Jděte na https://resend.com/
# 2. Zaregistrujte se (můžete použít GitHub login)
# 3. V dashboard klikněte na "API Keys"
# 4. Vytvořte nový API klíč s názvem "Pavel Fišer Web"
# 5. Zkopírujte API klíč
\`\`\`

### 2. Environment Variables

V `.env.local` přidejte:

\`\`\`bash
# Resend API klíč (POVINNÉ)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# E-mailové adresy (VOLITELNÉ - mají defaultní hodnoty)
RESEND_FROM_EMAIL=onboarding@resend.dev
RESEND_TO_EMAIL=pavel.fiser@praha4.cz
\`\`\`

### 3. Testování

Po nastavení API klíče:

1. Spusťte aplikaci: `pnpm dev`
2. Jděte na kontaktní formulář
3. Vyplňte a odešlete zprávu
4. Zkontrolujte e-mail na adrese `RESEND_TO_EMAIL`

## 📧 Formát e-mailu

### HTML verze
- Profesionální design s hlavičkou a patičkou
- Strukturované zobrazení všech polí formuláře
- Barevné zvýraznění důležitých informací
- Responzivní layout

### Text verze
- Jednoduchý textový formát
- Všechny informace z formuláře
- Časové razítko

### Hlavičky
- **From**: `Kontaktní formulář <${fromEmail}>`
- **To**: `${toEmail}`
- **Subject**: `Kontakt z webu: ${subject}`
- **Reply-To**: `${email}` (e-mail odesílatele)

## 🛡️ Bezpečnost

### Validace
- **Server-side validace** pomocí Zod schema
- **Typová bezpečnost** s TypeScript
- **Sanitizace HTML** v e-mailovém obsahu

### API Protection
- Pouze POST metoda povolena
- Validace všech vstupních dat
- Error handling bez odhalení citlivých informací

### Environment Variables
- API klíč je uložen bezpečně v `.env.local`
- Žádné citlivé informace v klientském kódu
- Konfigurovatelné e-mailové adresy

## 🎨 UX/UI Vylepšení

### Real-time Feedback
- **Loading state**: Tlačítko zobrazuje "Odesílání..." během procesu
- **Success message**: Zelená zpráva s checkmark ikonou
- **Error message**: Červená zpráva s alert ikonou
- **Form reset**: Automatické vymazání formuláře po úspěšném odeslání

### Animace
- Smooth fade-in animace pro status zprávy
- Framer Motion animace pro lepší UX

## 🔧 Pokročilé nastavení

### Vlastní doména (PRODUKCE)

Pro produkční použití s vlastní doménou:

1. **Ověření domény v Resend**:
   \`\`\`bash
   # V Resend dashboard:
   # 1. Jděte na "Domains"
   # 2. Klikněte "Add Domain"
   # 3. Zadejte "pavelfiser.cz"
   # 4. Přidejte poskytnuté DNS záznamy
   \`\`\`

2. **Aktualizace environment variables**:
   \`\`\`bash
   RESEND_FROM_EMAIL=noreply@pavelfiser.cz
   \`\`\`

### Rate Limiting

Pro produkci zvažte přidání rate limiting:

\`\`\`typescript
// Možné rozšíření API route
const rateLimiter = new Map()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const windowMs = 15 * 60 * 1000 // 15 minut
  const maxRequests = 5 // 5 zpráv za 15 minut
  
  if (!rateLimiter.has(ip)) {
    rateLimiter.set(ip, [])
  }
  
  const requests = rateLimiter.get(ip)
  const recentRequests = requests.filter((time: number) => now - time < windowMs)
  
  if (recentRequests.length >= maxRequests) {
    return false
  }
  
  recentRequests.push(now)
  rateLimiter.set(ip, recentRequests)
  return true
}
\`\`\`

## 📊 Monitoring

### Logy
- Všechny úspěšné i neúspěšné pokusy jsou logovány
- Error logy obsahují detaily pro debugging
- Success logy obsahují timestamp a základní info

### Resend Dashboard
- Sledování doručených e-mailů
- Statistiky odesílání
- Error monitoring

## 🚨 Troubleshooting

### Běžné problémy

1. **"Service unavailable"**
   - Zkontrolujte `RESEND_API_KEY` v `.env.local`
   - Ověřte že API klíč je platný

2. **E-mail se nedoručuje**
   - Zkontrolujte spam složku
   - Ověřte že `RESEND_TO_EMAIL` je správná adresa
   - Zkontrolujte Resend dashboard pro status

3. **"Invalid email address"**
   - Zkontrolujte formát `RESEND_FROM_EMAIL`
   - Pro testování použijte `onboarding@resend.dev`

### Development vs Production

**Development**:
\`\`\`bash
RESEND_FROM_EMAIL=onboarding@resend.dev
RESEND_TO_EMAIL=vas-test-email@gmail.com
\`\`\`

**Production**:
\`\`\`bash
RESEND_FROM_EMAIL=noreply@pavelfiser.cz
RESEND_TO_EMAIL=pavel.fiser@praha4.cz
\`\`\`

## ✅ Checklist pro nasazení

- [ ] Resend účet vytvořen
- [ ] API klíč vygenerován a nastaven
- [ ] Testovací e-mail úspěšně odeslán
- [ ] Pro produkci: doména ověřena v Resend
- [ ] Environment variables nastaveny na serveru
- [ ] Funkčnost otestována na produkci

## 🎯 Další možná vylepšení

1. **Auto-reply**: Automatická odpověď odesílateli
2. **Template system**: Použití Resend templates
3. **Analytics**: Sledování úspěšnosti formuláře
4. **Notification**: Slack/Discord notifikace při nové zprávě
5. **Attachment support**: Možnost přiložit soubory
