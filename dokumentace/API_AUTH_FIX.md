# Oprava autentizace pro API endpointy článků a kategorií

V této dokumentaci jsou popsány opravy provedené v API endpointech pro správu článků a kategorií.

## Identifikované problémy

1. **Mazání článků** - Endpoint pro mazání článků vracel "Unauthorized" i při přihlášeném administrátorovi
2. **Vytváření článků a kategorií** - Články a kategorie se nevytvářely ani neukládaly
3. **Nekonzistentní autentizační metoda** - Rozdílný přístup k autentizaci v různých částech aplikace

## Provedené opravy

### 1. Úprava API endpointů

Provedli jsme následující úpravy:

- **Nahradili jsme `requireAuth` middleware** přímou implementací s funkcí `authenticateAdmin`
- **Přidali jsme explicitní kontrolu autentizace** na začátek každého API endpointu
- **Sjednotili jsme přístup k autentizaci** napříč všemi API endpointy
- **Přidali jsme detailní logování** pro snazší diagnostiku problémů

### 2. Konkrétní změny:

#### a) Endpointy pro články `/api/admin/articles/route.ts`:

- GET endpoint: Nahrazen middleware vlastní autentizací
- POST endpoint: Nahrazen middleware vlastní autentizací
- Přidáno detailní logování

#### b) Endpointy pro mazání článků `/api/admin/articles/[id]/route.ts`:

- DELETE endpoint: Nahrazen middleware vlastní autentizací
- Přidáno detailní logování procesu autentizace

#### c) Endpointy pro kategorie `/api/admin/categories/route.ts`:

- GET endpoint: Nahrazen middleware vlastní autentizací
- POST endpoint: Nahrazen middleware vlastní autentizací
- Přidáno detailní logování

### 3. Klientská část

V komponentě ArticleManager (`/app/admin/components/ArticleManager.tsx`):
- Přidána explicitní Authorization hlavička s tokenem z localStorage při mazání článků
- Zachováno `credentials: 'include'` pro zasílání HTTP-only cookies

## Jak to nyní funguje

1. **Autentizace uživatele**:
   - Na serveru je kontrolován token z Authorization hlavičky
   - Pokud není platný, server zkouší refresh token z cookies
   - Pokud je některý z tokenů platný, pokračuje se ve zpracování požadavku

2. **Oprávnění**:
   - Po autentizaci se kontroluje, zda má uživatel roli "admin"
   - Pokud ne, vrací se chyba "Unauthorized" nebo "Nedostatečná oprávnění"

3. **Klient**:
   - Při odesílání požadavků klient posílá jak cookies (`credentials: 'include'`), tak i explicitní Authorization hlavičku s tokenem z localStorage

## Testování

Pro testování autentizace a operací s články a kategoriemi byla vytvořena diagnostická stránka `/admin/diagnose-auth`.

## Doporučení pro budoucnost

1. **Sjednocení autentizačního mechanismu** - Buď používat pouze HTTP-only cookies, nebo pouze JWT tokeny
2. **Vytvoření jednotného autentizačního modulu** pro frontend - Centrální správa hlaviček a autentizačních dat
3. **Rozšíření logování** - Pro lepší diagnostiku problémů s autentizací
