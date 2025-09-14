# Oprava chyby při mazání článků v administraci

## Identifikovaný problém
Při pokusu o smazání článku v administrační sekci se objevovaly chyby "Unauthorized" i přes to, že uživatel byl přihlášen jako administrátor. Hlavní příčinou problému byla nekonzistentní správa autentizace mezi frontendem a backendem.

## Provedené změny

### 1. Úprava DELETE endpointu pro články
Byla provedena úprava DELETE endpointu v `/app/api/admin/articles/[id]/route.ts`. Původní endpoint používal middleware `requireAuth`, který ne vždy správně zpracovával autorizaci pro DELETE požadavky. Úprava nahradila tento middleware vlastní implementací, která:

- Používá přímo funkci `authenticateAdmin` pro ověření administrátorských oprávnění
- Přidává detailní logování pro diagnostiku autentizačních problémů
- Explicitně kontroluje, zda je uživatel administrátor

### 2. Úprava klientské části (ArticleManager.tsx)
V komponentě ArticleManager byly provedeny úpravy funkcí `handleDeleteArticle` a `handleBulkDelete`, aby správně zacházely s autentizací:

- Nyní jsou zasílány jak HTTP-only cookies (credentials:'include'), tak explicitní Authorization hlavička s tokenem z localStorage
- Přidáno detailní logování pro diagnostiku autentizačních problémů
- Zlepšeny chybové hlášky pro lepší identifikaci problémů

### 3. Diagnostická stránka
Byla vytvořena nová diagnostická stránka na `/admin/diagnose-auth`, která umožňuje:

- Zkontrolovat stav autentizace (HTTP-only cookies a localStorage token)
- Otestovat přístup k API článků
- Provést testovací smazání článku a diagnostikovat případné problémy

## Technické detaily

### Autentizační mechanismus
Aplikace používá dva způsoby autentizace:
1. HTTP-only cookies (refresh_token)
2. JWT tokeny v Authorization hlavičce (access_token)

Problém nastával, když frontend posílal pouze cookies, ale backend očekával primárně Authorization hlavičku. Nyní byla implementována podpora pro oba způsoby současně.

### Funkce authenticateAdmin
Tato funkce z `auth-utils-v2.ts` je nyní používána přímo v API endpointu pro mazání článků. Funkce kontroluje:
1. Nejprve token v Authorization hlavičce
2. Pokud není platný, zkusí refresh token z cookies
3. Vrátí null, pokud autentizace selže, nebo objekt uživatele s rolí, pokud je úspěšná

### Diagnostika
Pro diagnostiku problémů lze použít stránku `/admin/diagnose-auth`, která ukazuje:
- Aktuální stav cookies a localStorage
- Výsledek testovacího volání API
- Detaily z testovacího mazání článku včetně použitých hlaviček

## Doporučení pro budoucnost
1. Sjednotit autentizační metodu - buď používat pouze HTTP-only cookies, nebo pouze JWT tokeny v hlavičkách
2. Implementovat centrální správu autentizace na frontendu, která bude automaticky přidávat potřebné hlavičky
3. Zvážit použití React Context API nebo Redux pro lepší správu autentizačního stavu
