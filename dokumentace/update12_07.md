# Analýza aplikace - 12. července 2025

## Úvod
Tento dokument obsahuje podrobnou analýzu aplikace, její struktury, funkcionalit a identifikovaných problémů. Postupně budou přidávány informace o jednotlivých částech aplikace.

## Struktura projektu
Projekt je postaven na frameworku Next.js a obsahuje následující klíčové složky:

- **app/**: Obsahuje hlavní komponenty aplikace, včetně layoutů, stránek a stylů.
- **components/**: Sdílené React komponenty, jako je `theme-provider` a UI prvky.
- **data/**: Obsahuje JSON soubory pro správu dat, například články a newsletter kampaně.
- **database/**: SQL soubory pro migrace a schéma databáze.
- **hooks/**: Custom React hooky, například `use-admin-data` a nově vytvořený `useFormHandler`.
- **lib/**: Utility funkce pro autentizaci, práci s databází a další.
- **public/**: Statické soubory, jako obrázky a HTML.
- **scripts/**: Skripty pro nastavení databáze a testování.
- **styles/**: Globální styly aplikace.

## Postup analýzy
1. **Identifikace klíčových funkcionalit**: Prozkoumání hlavních částí aplikace.
2. **Diagnostika problémů**: Vyhledání chyb a neefektivit v kódu.
3. **Návrhy na zlepšení**: Doporučení pro optimalizaci.

## Zjištěné informace
### 1. Formuláře
- **Komponenty**: `ContactForm`, `NewsletterSubscribe`.
- **Logika**: Validace vstupů, odesílání dat na API.
- **Refaktorování**: Vytvořen hook `useFormHandler` pro sjednocení logiky.

### 2. Cookies
- **Komponenty**: `CookiePreferences`, `CookieManager`.
- **Logika**: Správa souhlasu uživatele, integrace s Google Analytics.
- **Možnosti zlepšení**: Potenciální refaktorování do sdílené utility.

### 3. Články
- **Komponenty**: `RecentNews`, `ArticleManager`.
- **Problémy**: Rozdílný počet článků mezi frontpage a admin sekcí.
- **Řešení**: Diagnostika API endpointů a sjednocení logiky zobrazení.

### 4. Navigace
- **Komponenty**: `ArticleManager`.
- **Zlepšení**: Přidány navigační odkazy pro lepší uživatelskou zkušenost.

## Další kroky
- Pokračovat v analýze dalších komponent.
- Dokumentovat zjištění a navrhovaná řešení.
- Implementovat doporučené změny.

---
Tento dokument bude průběžně aktualizován.
