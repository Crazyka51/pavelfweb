# Doporučení pro vyčištění autentizačního systému

## Identifikované konflikty a problémy

Během kontroly kódu byly identifikovány následující potenciální konflikty a nekonzistence:

### 1. Duplicitní autentizační utility

V projektu existují různé verze autentizačních utilit:
- `/lib/auth-utils.ts` - pravděpodobně původní verze
- `/lib/auth-utils-new.ts` - používaná staršími API endpointy
- `/lib/auth-utils-v2.ts` - používaná novějšími API endpointy

### 2. Duplicitní API endpointy pro autentizaci

Existují dva sety autentizačních endpointů:
- Starší verze: `/api/admin/auth/login`, `/api/admin/auth/logout`, `/api/admin/auth/verify`
- Nová verze: `/api/admin/auth/v2/login`, `/api/admin/auth/v2/logout`, `/api/admin/auth/v2/verify`, `/api/admin/auth/v2/refresh`

Klientská strana nyní používá v2 verze, ale starší verze zůstávají v kódu.

### 3. Potenciální konflikty v middleware

Máme middleware pro CORS a pro debugování autentizace, které se aplikují na stejné cesty ('/api/admin/auth/:path*').

## Doporučené kroky k řešení

### 1. Sjednocení autentizačních utilit

#### Možnost A: Odstranění zastaralých utilit
\`\`\`bash
# Odstranit zastaralé utility
rm /workspaces/pavelfweb/lib/auth-utils.ts
rm /workspaces/pavelfweb/lib/auth-utils-new.ts
\`\`\`

#### Možnost B: Sjednocení implementací
Upravit `auth-utils-new.ts` tak, aby používala stejnou implementaci jako `auth-utils-v2.ts`:

\`\`\`javascript
// auth-utils-new.ts
export * from './auth-utils-v2';
\`\`\`

### 2. Odstranění nepoužívaných API endpointů

\`\`\`bash
# Odstranění starších verzí API endpointů
rm -r /workspaces/pavelfweb/app/api/admin/auth/login
rm -r /workspaces/pavelfweb/app/api/admin/auth/logout
rm -r /workspaces/pavelfweb/app/api/admin/auth/verify
# Ponechat diagnostiku a debug endpointy
\`\`\`

### 3. Aktualizace dokumentace

Vytvořit dokumentaci, která popisuje:
- Aktuální strukturu autentizačního systému
- Použité technologie a přístupy
- Seznam dostupných API endpointů a jejich funkcionalitu

### 4. Sjednocení middleware

Zvážit sjednocení middleware pro CORS a debugování do jednoho souboru nebo zajistit správné pořadí vykonávání.

## Přehled API endpointů po vyčištění

| Endpoint | Metoda | Popis |
|----------|--------|-------|
| `/api/admin/auth/v2/login` | POST | Přihlášení uživatele |
| `/api/admin/auth/v2/logout` | POST | Odhlášení uživatele |
| `/api/admin/auth/v2/refresh` | GET | Obnovení tokenu |
| `/api/admin/auth/v2/verify` | GET | Ověření tokenu |
| `/api/admin/auth/v2/debug` | GET | Diagnostické informace |
| `/api/admin/auth/diagnostic` | GET | Detailní diagnostika systému |

## Výhody po implementaci

1. **Jednodušší kód** - odstranění duplicit a zastaralých implementací
2. **Lepší udržitelnost** - jeden zdroj pravdy pro autentizační logiku
3. **Snížení rizika chyb** - méně míst, kde může dojít k chybě
4. **Lepší čitelnost kódu** - jasnější struktura a účel jednotlivých souborů
