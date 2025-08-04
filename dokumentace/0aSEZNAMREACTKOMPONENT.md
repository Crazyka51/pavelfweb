# Seznam React komponent

## Layouty a stránky

### RootLayout
- **Soubor**: `app/layout.tsx`
- **Typ**: Layout
- **Popis**: Hlavní layout aplikace, obsahuje hlavičku, patičku a cookie banner
- **Props**: `{ children: React.ReactNode }`
- **Závislosti**: Header, Footer, CookieBanner, CookieManager, GoogleAnalytics, StructuredData

### AdminLayout
- **Soubor**: `app/admin/layout.tsx`
- **Typ**: Layout
- **Popis**: Layout pro administrativní část webu
- **Props**: `{ children: React.ReactNode }`

### HomePage
- **Soubor**: `app/page.tsx`
- **Typ**: Stránka
- **Popis**: Hlavní stránka webu

### NotFoundPage
- **Soubor**: `app/not-found.tsx`
- **Typ**: Stránka
- **Popis**: Stránka pro neexistující URL
## Hlavní komponenty UI

### Header
- **Soubor**: `app/components/Header.tsx`
- **Typ**: Navigační komponenta
- **Popis**: Hlavička webu s navigací
- **Závislosti**: Framer Motion, Next/Link

### Footer
- **Soubor**: `app/components/Footer.tsx`
- **Typ**: Navigační komponenta
- **Popis**: Patička webu s odkazy a autorskými právy
- **Funkce**: Obsahuje tlačítko pro otevření nastavení cookies

### Hero
- **Soubor**: `app/components/Hero.tsx`
- **Typ**: Prezentační komponenta
- **Popis**: Úvodní hero sekce s představením osoby
- **Závislosti**: Framer Motion

### CookieBanner
- **Soubor**: `app/components/CookieBanner.tsx`
- **Typ**: UI komponenta
- **Popis**: Banner pro správu cookies a souhlasů
- **Stav**: Používá useState pro správu viditelnosti a nastavení
- **Závislosti**: GoogleAnalytics, Lucide ikony

### CookieManager
- **Soubor**: `app/components/CookieManager.tsx`
- **Typ**: Správa souhlasů
- **Popis**: Komponenta pro správu cookie preferencí

### CookiePreferences
- **Soubor**: `app/components/CookiePreferences.tsx`
- **Typ**: Dialog
- **Popis**: Modal pro úpravu cookie preferencí

### GoogleAnalytics
- **Soubor**: `app/components/GoogleAnalytics.tsx`
- **Typ**: Analytics komponenta
- **Popis**: Implementace Google Analytics s Consent Mode

### ContactForm
- **Soubor**: `app/components/ContactForm.tsx`
- **Typ**: Formulář
- **Popis**: Kontaktní formulář

### Contact
- **Soubor**: `app/components/Contact.tsx`
- **Typ**: Sekce
- **Popis**: Kontaktní sekce obsahující formulář

### AboutUs
- **Soubor**: `app/components/AboutUs.tsx`
- **Typ**: Sekce
- **Popis**: Sekce s informacemi o osobě

### FeatureCarousel
- **Soubor**: `app/components/FeatureCarousel.tsx`
- **Typ**: Carousel
- **Popis**: Carousel pro zobrazení vlastností/priorit

### FacebookPosts
- **Soubor**: `app/components/FacebookPosts.tsx`
- **Typ**: Integrační komponenta
- **Popis**: Zobrazuje příspěvky z Facebooku

### CustomCursor
- **Soubor**: `app/components/CustomCursor.tsx`
- **Typ**: UI komponenta
- **Popis**: Vlastní kurzor pro lepší UX
## UI komponenty (shadcn/ui)

### ThemeProvider
- **Soubor**: `components/theme-provider.tsx`
- **Typ**: Provider
- **Popis**: Poskytovatel tématu pro aplikaci
- **Props**: `{ children: React.ReactNode, ...ThemeProviderProps }`
- **Závislosti**: next-themes

### Sheet
- **Soubor**: `components/sheet.tsx`
- **Typ**: UI komponenta
- **Popis**: Drawer/Sheet komponenta pro modální okna ze strany obrazovky
- **Závislosti**: vaul, class-variance-authority, cn utility
- **Komponenty**: Sheet, SheetTrigger, SheetClose, SheetPortal, SheetOverlay, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription

### Accordion
- **Soubor**: `components/ui/accordion.tsx`
- **Typ**: UI komponenta
- **Popis**: Rozbalovací komponenta (accordion)
- **Závislosti**: @radix-ui/react-accordion, lucide-react
- **Komponenty**: Accordion, AccordionItem, AccordionTrigger, AccordionContent

### Alert
- **Soubor**: `components/ui/alert.tsx`
- **Typ**: UI komponenta
- **Popis**: Komponenta pro zobrazení upozornění

### AlertDialog
- **Soubor**: `components/ui/alert-dialog.tsx`
- **Typ**: UI komponenta
- **Popis**: Dialog pro zobrazení důležitých upozornění
## Admin komponenty

Existují různé admin komponenty v adresáři `app/admin`, včetně:

### AdminPage
- **Soubor**: `app/admin/page.tsx`
- **Typ**: Stránka
- **Popis**: Hlavní stránka administrace

### AdminLoading
- **Soubor**: `app/admin/loading.tsx`
- **Typ**: Komponenta pro stav načítání
- **Popis**: Zobrazuje se během načítání admin stránky
## Hooks

### useMobile
- **Soubor**: `hooks/use-mobile.tsx`
- **Typ**: Hook
- **Popis**: Hook pro detekci mobilního zařízení

### useAdminData
- **Soubor**: `hooks/use-admin-data.ts`
- **Typ**: Hook
- **Popis**: Hook pro práci s daty v admin rozhraní

### useAdminFilters
- **Soubor**: `hooks/use-admin-filters.ts`
- **Typ**: Hook
- **Popis**: Hook pro filtrování dat v admin rozhraní

### useBulkOperations
- **Soubor**: `hooks/use-bulk-operations.ts`
- **Typ**: Hook
- **Popis**: Hook pro hromadné operace v admin rozhraní

### useToast
- **Soubor**: `hooks/use-toast.ts`
- **Typ**: Hook
- **Popis**: Hook pro zobrazování toast notifikací

### useFormHandler
- **Soubor**: `hooks/useFormHandler.ts`
- **Typ**: Hook
- **Popis**: Hook pro správu formulářů
## Mapa vztahů mezi komponentami

### Hierarchie

#### RootLayout
- **Header**
- **Footer**
- **CookieBanner**
- **CookieManager**
- **GoogleAnalytics**
- **StructuredData**

#### HomePage
- **Hero**
- **FeatureCarousel**
- **AboutUs**
- **FacebookPosts**
- **Contact**
  - **ContactForm**

#### AdminLayout
- **AdminPage**
- **AdminLoading**
### Komunikace

#### Mezi komponentami pro správu cookies:
- **CookieBanner** komunikuje s **GoogleAnalytics** pomocí funkcí `handleConsentChange`, `trackEvent`, `shouldShowConsentBanner`, `getCurrentConsentPreferences`
- **CookiePreferences** je otevíráno pomocí custom eventu `openCookiePreferences` z **Footer** komponenty

#### Formulářové komponenty:
- **ContactForm** pravděpodobně používá **useFormHandler** pro správu stavu formuláře

#### UI komponenty:
- Mnoho komponent využívá **shadcn/ui** komponenty jako **Accordion**, **Sheet**, **Alert** atd.
- **ThemeProvider** pravděpodobně obaluje celou aplikaci a poskytuje přístup k tématu
## Shrnutí architektury komponent

### Struktura aplikace

#### Stránky a Routování:
- Používá Next.js App Router (stránky jsou definovány v adresáři `app`)
- Oddělené layouty pro hlavní web a administraci

#### Komponenty:
- Rozděleny do logických skupin:
  - UI komponenty v `components/ui`
  - Hlavní komponenty webu v `app/components`
  - Admin komponenty v `app/admin`
  - Hooky v `hooks`

#### Styly:
- Používá TailwindCSS pro stylování
- Některé komponenty používají knihovnu Framer Motion pro animace

#### Stav a management dat:
- Používá React hooky pro správu stavu
- Pravděpodobně používá Context API pro globální stav (ThemeProvider)

#### Závislosti na knihovnách:
- next-themes pro správu témat
- Framer Motion pro animace
- Lucide pro ikony
- Radix UI pro přístupné UI komponenty
- Vaul pro drawer komponenty

Toto je komplexní web postavený na moderních React technologiích s důrazem na dobrý uživatelský zážitek, přístupnost a správu souhlasů s cookies dle GDPR.