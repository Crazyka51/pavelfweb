# Google Consent Mode v2 - Implementace

## ✅ Co bylo implementováno

### 1. Google Consent Mode v2 funkce

#### setDefaultConsentState()
\`\`\`javascript
window.gtag('consent', 'default', {
  'ad_storage': 'denied',
  'ad_user_data': 'denied', 
  'ad_personalization': 'denied',
  'analytics_storage': 'denied',
  'functionality_storage': 'granted',
  'personalization_storage': 'denied',
  'security_storage': 'granted',
  'wait_for_update': 500,
})
\`\`\`

#### updateConsentState(granted: boolean)
\`\`\`javascript
window.gtag('consent', 'update', {
  'ad_storage': granted ? 'granted' : 'denied',
  'ad_user_data': granted ? 'granted' : 'denied', 
  'ad_personalization': granted ? 'granted' : 'denied',
  'analytics_storage': granted ? 'granted' : 'denied',
  'functionality_storage': 'granted',
  'personalization_storage': granted ? 'granted' : 'denied',
  'security_storage': 'granted',
})
\`\`\`

#### gtagSetAdsDataRedaction(redact: boolean)
\`\`\`javascript
window.gtag('set', 'ads_data_redaction', redact)
\`\`\`

### 2. Komponenty

#### GoogleAnalytics.tsx
- ✅ Implementace Google Consent Mode v2
- ✅ Default consent state (vše odepřeno kromě nezbytných)
- ✅ Automatické načtení uložených preferencí
- ✅ Anonymizace IP adres
- ✅ Secure cookie flags

#### CookieBanner.tsx  
- ✅ Rozšířené UI s kategoriemi cookies
- ✅ Nastavení detailních preferencí
- ✅ Tlačítka: "Pouze nezbytné", "Nastavení", "Přijmout vše"
- ✅ Granulární ovládání kategorií
- ✅ Propojení s Consent Mode

#### CookiePreferences.tsx
- ✅ Detailní správa consent po načtení stránky
- ✅ Modal s kategoriemi cookies
- ✅ Vysvětlení jednotlivých kategorií
- ✅ Toggle switche pro každou kategorii
- ✅ Příklady služeb v každé kategorii

#### CookieManager.tsx
- ✅ Správa zobrazování CookiePreferences
- ✅ Event listener pro otevření z Footer

#### Footer.tsx
- ✅ Odkaz "Nastavení cookies"
- ✅ Custom event pro otevření preferencí

### 3. Kategorie cookies

#### Nezbytné cookies (vždy povolené)
- `functionality_storage`: 'granted'
- `security_storage`: 'granted'
- Nelze zakázat, nutné pro funkčnost webu

#### Analytické cookies
- `analytics_storage`: uživatelská volba
- Google Analytics sledování
- Anonymizované statistiky návštěvnosti

#### Marketingové cookies  
- `ad_storage`: uživatelská volba
- `ad_user_data`: uživatelská volba
- `ad_personalization`: uživatelská volba
- Reklamní kampaně, remarketinг

#### Personalizační cookies
- `personalization_storage`: uživatelská volba
- Uživatelské preference
- Doporučený obsah

### 4. GDPR Compliance funkce

#### Automatická redakce dat
- Při odepření: `ads_data_redaction: true`
- Při souhlasu: `ads_data_redaction: false`

#### Anonymizace IP
\`\`\`javascript
gtag('config', GA_TRACKING_ID, {
  'anonymize_ip': true,
  'cookie_flags': 'SameSite=None;Secure'
})
\`\`\`

#### Uložení preferencí
- `cookieConsent`: 'accepted' | 'declined'
- `cookieConsentDate`: ISO datum souhlasu
- `cookiePreferences`: JSON objekt s detailními preferencemi

### 5. Tracking events
\`\`\`javascript
trackEvent('consent_update', 'cookie_banner', 'accepted|declined')
trackEvent('consent_preferences_updated', 'cookie_settings', 'accepted|declined')
trackEvent('consent_accept_all', 'cookie_settings', 'accepted')
trackEvent('consent_decline_all', 'cookie_settings', 'declined')
\`\`\`

## 🔧 Jak testovat

### 1. Google Tag Assistant
- Nainstalovat Google Tag Assistant rozšíření
- Otevřít web a zkontrolovat Consent Mode události
- Ověřit správné nastavení consent parametrů

### 2. Developer Tools
\`\`\`javascript
// Zkontrolovat dataLayer
console.log(window.dataLayer)

// Zkontrolovat consent state
window.gtag('get', GA_TRACKING_ID, 'consent')

// Manuální update consent
window.gtag('consent', 'update', {
  'analytics_storage': 'granted'
})
\`\`\`

### 3. Real-time reporting
- Google Analytics > Real-time
- Ověřit, že se data nesbírají při odepření consent
- Potvrdit funkčnost při udělení souhlasu

### 4. Privacy Sandbox
- Chrome DevTools > Application > Storage
- Zkontrolovat consent cookies
- Ověřit redakci dat v ads calls

## 📋 Výhody implementace

### 1. GDPR Compliance
- ✅ Výslovný souhlas před sledováním
- ✅ Granulární kontrola kategorií
- ✅ Možnost odvolání souhlasu
- ✅ Transparentní informace o cookies

### 2. Google požadavky
- ✅ Consent Mode v2 (nejnovější verze)
- ✅ Ads data redaction
- ✅ Správné default consent state
- ✅ wait_for_update parametr

### 3. Uživatelský zážitek
- ✅ Jasné kategorie cookies
- ✅ Vysvětlení účelu jednotlivých kategorií
- ✅ Snadná změna preferencí
- ✅ Odkazy na privacy policy

### 4. Technické výhody
- ✅ Minimální dopad na Core Web Vitals
- ✅ beforeInteractive loading strategy
- ✅ Event tracking pro analýzu consent rate
- ✅ Kompatibilita s Google službami

## 🎯 Výsledek
- ✅ Plná implementace Google Consent Mode v2
- ✅ setDefaultConsentState() implementována
- ✅ updateConsentState() implementována  
- ✅ gtagSetAdsDataRedaction() implementována
- ✅ GDPR compliant cookie management
- ✅ Granulární kontrola uživatele
- ✅ Optimalizace pro Google služby
