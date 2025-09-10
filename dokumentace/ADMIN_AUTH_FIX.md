# Oprava autentizace v administračním rozhraní

## Shrnutí provedených změn

V administračním rozhraní webu byly provedeny opravy související s autentizačním systémem, který nyní používá HTTP-only cookies místo ukládání tokenu do localStorage. Tato změna zvyšuje bezpečnost aplikace a zajišťuje konzistentní autentizaci napříč administrátorským rozhraním.

## Provedené změny

### 1. Úprava API volání v komponentě ArticleManager.tsx

Všechny API volání v této komponentě byly upraveny tak, aby používaly `credentials: 'include'` místo ukládání a čtení tokenu z localStorage. Toto zajišťuje, že HTTP-only cookies jsou automaticky odesílány s každým požadavkem.

```typescript
// Původní kód
const token = localStorage.getItem("adminToken");
if (!token) return alert("Chyba autorizace");
try {
  // ...
  const response = await fetch("/api/admin/articles", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(newArticleData),
  });
}

// Nový kód
try {
  // ...
  const response = await fetch("/api/admin/articles", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: 'include', // Používáme HTTP-only cookies místo token z localStorage
    body: JSON.stringify(newArticleData),
  });
}
```

### 2. Úprava diagnostické stránky

Byla vytvořena diagnostická stránka (`/admin/diagnose`), která pomáhá identifikovat a testovat problémy s administračním rozhraním. Na této stránce byly všechny API volání upraveny tak, aby používaly HTTP-only cookies:

```typescript
const res = await fetch('/api/admin/articles', {
  credentials: 'include', // Přidáno pro použití HTTP-only cookies
});
```

### 3. Vytvoření konzistentního přístupu k autentizaci

Pro zajištění konzistence byla provedena následující opatření:

- Všechny API volání nyní používají `credentials: 'include'`
- Odstranění přístupu k localStorage pro ukládání tokenů
- Správné předávání cookies mezi klientem a serverem

## Bezpečnostní zlepšení

Používání HTTP-only cookies místo localStorage přináší následující bezpečnostní výhody:

1. **Ochrana před XSS útoky** - HTTP-only cookies nejsou dostupné pro JavaScript, což minimalizuje riziko krádeže tokenu pomocí Cross-Site Scripting (XSS)
2. **Automatické odesílání s požadavky** - cookies jsou automaticky odesílány s každým požadavkem do stejné domény
3. **Lepší správa životnosti** - server má plnou kontrolu nad životností autentizační relace

## Testování

Pro ověření správné funkčnosti byla vytvořena diagnostická stránka, která testuje:

1. Přihlášení uživatele
2. Načítání článků přes API
3. Vytváření a publikování článků
4. Aktualizaci existujících článků

## Doporučení pro budoucí vývoj

1. Implementovat automatické obnovení (refresh) autentizačních tokenů
2. Přidat možnost odhlášení na všech zařízeních
3. Rozšířit diagnostické nástroje o sledování výkonu API
4. Implementovat logování autentizačních událostí pro bezpečnostní audit
