# Google Consent Mode v2 - Pokročilá implementace

## Přehled
Tato implementace používá Google Consent Mode v2 s pokročilými funkcemi pro GDPR compliance:

### Klíčové funkce implementované

#### 1. setDefaultConsentState()
\`\`\`typescript
setDefaultConsentState() // Nastavuje výchozí stav odmítnutí pro všechny kategorie
\`\`\`

**Implementované funkce:**
- `ad_storage: 'denied'` - Odmítnutí reklamních cookies
- `ad_user_data: 'denied'` - Odmítnutí sdílení uživatelských dat pro reklamy  
- `ad_personalization: 'denied'` - Odmítnutí personalizované reklamy
- `analytics_storage: 'denied'` - Odmítnutí analytických cookies
- `functionality_storage: 'granted'` - Povolení nezbytných cookies
- `personalization_storage: 'denied'` - Odmítnutí personalizačních cookies
- `security_storage: 'granted'` - Povolení bezpečnostních cookies
- `wait_for_update: 500` - Čekání na uživatelský souhlas (500ms)
- `region: ['CZ', 'EU']` - Aplikace pro ČR a EU

#### 2. updateConsentState()
\`\`\`typescript
updateConsentState(preferences: ConsentSettings) // Granulární aktualizace souhlasu
\`\`\`

**Granulární kategorize:**
- **Necessary** (vždy povolené): `functionality_storage`, `security_storage`
- **Analytics**: `analytics_storage` - Google Analytics s anonymizací
- **Marketing**: `ad_storage`, `ad_user_data` - reklamní cookies
- **Personalization**: `ad_personalization`, `personalization_storage`

#### 3. gtagSetAdsDataRedaction()
\`\`\`typescript
gtagSetAdsDataRedaction(preferences: ConsentSettings) // Redakce reklamních dat
\`\`\`

**Privacy-first nastavení:**
- `ads_data_redaction: true` pokud marketing consent = denied
- `client_storage: 'none'` při redakci
- `anonymize_ip: true` vždy aktivní  
- `allow_google_signals: false` při redakci

## Technická implementace

### Typy pro TypeScript
\`\`\`typescript
export interface ConsentSettings {
  necessary: boolean      // Vždy true
  analytics: boolean      // Google Analytics
  marketing: boolean      // Reklamní cookies
  personalization: boolean // Personalizační cookies
}
\`\`\`

### Pokročilé funkce

#### Consent-aware tracking
\`\`\`typescript
// Event tracking pouze s analytickým souhlasem
trackEvent('action', 'category', 'label', value)

// Page view tracking s consent kontrolou
trackPageView(url, title)
\`\`\`

#### Centralizovaná správa změn
\`\`\`typescript
handleConsentChange(newPreferences: ConsentSettings)
// - Aktualizuje Google Consent Mode
// - Uloží do localStorage
// - Trackuje změny
// - Spustí page view při povolení analytics
\`\`\`

### Uživatelské rozhraní

#### CookieBanner.tsx
- **Modal design** - celostránkový overlay
- **Rychlé akce**: "Přijmout vše", "Pouze nezbytné", "Nastavit"
- **Granulární nastavení** - toggle pro každou kategorii
- **GDPR informace** v patičce

#### CookiePreferences.tsx  
- **Detailní správa** kategorií cookies
- **Živé náhledy** změn před uložením
- **Reset function** pro vrácení změn
- **Loading states** při ukládání
- **Kategorize s příklady** použití

#### Automatické načítání preferencí
- Kontrola při inicializaci Google Analytics
- Backward compatibility se starými nastaveními
- Fallback na privacy-first výchozí hodnoty

## GDPR Compliance funkce

### Privacy by Default
\`\`\`typescript
// Výchozí odmítnutí všech nepovinných kategorií
const defaultSettings = {
  necessary: true,        // Nelze změnit
  analytics: false,       // Odmítnuto
  marketing: false,       // Odmítnuto  
  personalization: false  // Odmítnuto
}
\`\`\`

### Anonymizace dat
\`\`\`typescript
// V Google Analytics vždy aktivní:
'anonymize_ip': true,
'restricted_data_processing': true, // Při odmítnutí marketing
'allow_ad_personalization_signals': false, // Privacy default
\`\`\`

### Persistent preferences
- **Uložení**: localStorage pro 2 roky
- **Formát**: JSON s timestamp
- **Zpětná kompatibilita** se starými formáty

## Deployment checklist

### Před nasazením ověřit:
- [ ] Google Analytics ID správně nastaven
- [ ] setDefaultConsentState volán před gtag config
- [ ] All tracking events respektují consent
- [ ] CookieBanner se zobrazuje novým uživatelům
- [ ] Preferences modal dostupný z patičky
- [ ] GDPR texty v češtině aktuální

### Testing scenarios:
1. **Nový uživatel** - zobrazí se banner, defaultní odmítnutí
2. **Přijmout vše** - všechny kategorie povoleny, analytics tracking aktivní
3. **Pouze nezbytné** - jen necessary povoleno, ads_data_redaction aktivní
4. **Granulární nastavení** - jednotlivé kategorie dle volby
5. **Změna preferencí** - modal z patičky, uložení změn
6. **Page refresh** - nastavení perzistentní

## API Reference

### Exportované funkce z GoogleAnalytics.tsx:
\`\`\`typescript
// Core Consent Mode functions
setDefaultConsentState(): void
updateConsentState(preferences: ConsentSettings): void  
gtagSetAdsDataRedaction(preferences: ConsentSettings): void

// Utility functions
handleConsentChange(preferences: ConsentSettings): void
getCurrentConsentPreferences(): ConsentSettings | null
shouldShowConsentBanner(): boolean

// Privacy-aware tracking
trackEvent(action: string, category: string, label?: string, value?: number): void
trackPageView(url: string, title: string): void
\`\`\`

### Events pro monitoring:
- `consent_update` - změna souhlasu
- `preferences_updated` - manuální aktualizace z modal
- Standard GA4 events (pouze s analytics consent)

## Bezpečnost a soukromí

### Implementované ochrany:
- **No cross-site tracking** bez explicit consent
- **Data minimization** - jen nezbytná data v necessary režimu  
- **Secure cookies** - SameSite=None;Secure flags
- **IP anonymization** vždy aktivní
- **Right to be forgotten** - link na data deletion

### Compliance dokumenty:
- Privacy Policy aktualizována s Consent Mode v2 info
- Cookie kategorize detailně popsány
- Kontakt pro data protection dotazy
