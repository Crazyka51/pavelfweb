# Oprava problému s odhlašováním na přihlašovací stránce

## Popis problému

Po implementaci předchozích oprav CORS a cookie nastavení se objevil nový problém: uživatel byl automaticky odhlášen při načtení přihlašovací stránky, což způsobovalo, že přihlášení jen "probliklo" a uživatel byl okamžitě odhlášen.

## Příčina problému

Byly identifikovány následující příčiny problému:

1. V `auth-service.ts` metoda `checkAuth()` automaticky mazala token z localStorage, když uživatel navštívil cestu `/admin/login`, bez ohledu na to, zda se právě přihlašoval nebo odhlašoval.

2. V `login/page.tsx` byl kód, který automaticky přesměrovával na `/admin/login?force=true` a vždy odhlašoval uživatele při načtení přihlašovací stránky.

3. V `AdminAuthLayout.tsx` byla nekonzistentní práce s `force` parametrem, což způsobovalo problémy při přesměrování.

## Provedené opravy

1. **Úprava v `auth-service.ts`:**
   - Odstraněna podmínka, která automaticky mazala token při návštěvě `/admin/login`
   - Token je nyní mazán pouze pokud je přítomen parametr `force=true` v URL

2. **Úprava v `login/page.tsx`:**
   - Odstraněno automatické přesměrování na `/admin/login?force=true`
   - Odhlašování je nyní prováděno pouze pokud je explicitně požadováno pomocí parametru `force`
   - Změněn název parametru z `force=true` na `force=1` pro lepší kompatibilitu

3. **Úprava v `AdminAuthLayout.tsx`:**
   - Upravena detekce parametru `force` pro konzistentní použití
   - Upravena logika přesměrování, aby nezpůsobovala nekonečné smyčky

## Testování řešení

Pro ověření správné funkčnosti:

1. **Test přihlašování:**
   - Otevřete `/admin/login` 
   - Zadejte správné přihlašovací údaje
   - Ověřte, že jste přesměrováni na admin dashboard a zůstáváte přihlášeni

2. **Test vynuceného odhlášení:**
   - Klikněte na "Vynutit nové přihlášení" v patičce přihlašovací stránky
   - Ověřte, že jste skutečně odhlášeni a musíte zadat přihlašovací údaje znovu

3. **Test perzistence přihlášení:**
   - Po úspěšném přihlášení zavřete a znovu otevřete prohlížeč
   - Otevřete `/admin` a ověřte, že jste automaticky přihlášeni