# Řešení problémů s autentizací a CORS

## 1. Přehled provedených změn

### CORS nastavení
- Přidáno CORS nastavení pro API endpointy v `next.config.mjs`
- Vytvořeno dynamické CORS nastavení v `middleware/cors.ts`
- Ponecháno nastavení pro statické soubory z PR #8

### Cookie nastavení
- Upraveno nastavení `refresh_token` cookie v `auth-utils-v2.ts`:
  - Změna `sameSite` z "strict" na "lax" pro lepší kompatibilitu mezi doménami
  - Přidáno nastavení domény `.fiserpavel.cz` pro produkční prostředí

### Diagnostika a debugování
- Přidán diagnostický endpoint `/api/admin/auth/v2/debug`
- Přidán middleware pro sledování auth požadavků v `middleware/auth-debugger.ts`

## 2. Jak toto řeší problém

### Problém 1: CORS chyby při načítání fontů
- Tento problém je již řešen v PR #8 pomocí CORS hlaviček pro statické soubory

### Problém 2: 401 Unauthorized chyba při přihlašování do administrace
- Hlavní problém byl v nastavení cookies:
  - Cookie `refresh_token` byl nastaven pouze pro konkrétní doménu (www nebo non-www)
  - Změna nastavení domény na `.fiserpavel.cz` umožňuje sdílení cookie mezi subdoménami
  - Změna `sameSite` z "strict" na "lax" umožňuje fungování cookie při přesměrování

### Dynamické CORS pro API endpointy
- Middleware `cors.ts` dynamicky nastaví `Access-Control-Allow-Origin` podle originu požadavku
- Podporuje jak www, tak non-www verze domény
- Povoluje credentials pro zajištění přenosu cookies

## 3. Testování a ověření
1. Přihlašte se přes www.fiserpavel.cz/admin
2. Otestujte, zda přihlášení funguje i při přepnutí na fiserpavel.cz/admin
3. Zkontrolujte konzoli prohlížeče, zda neobsahuje CORS chyby
4. Použijte diagnostický endpoint `/api/admin/auth/v2/debug` pro kontrolu cookies a hlaviček

## 4. Bezpečnostní opatření
- CORS hlavičky jsou nastaveny pouze pro povolené domény
- Citlivé informace nejsou logovány v debug výstupech
- HTTP-only cookies jsou stále použity pro uložení refresh tokenu