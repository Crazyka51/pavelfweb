# Řešení problémů s ukládáním článků v administraci

## Identifikované problémy a jejich řešení

Na základě diagnostiky kódu bylo nalezeno několik problémů, které mohou způsobovat nesprávné ukládání nebo publikování článků v administraci.

### 1. Problém s autentizací a JWT tokenem

**Problém:**
V komponentách `ArticleEditor` a `ArticleManager` se pro autentizaci používá token získaný z localStorage, zatímco API používá HTTP-only cookies pro autentizaci.

**Řešení:**
1. Upravit všechny fetch požadavky přidáním `credentials: 'include'` pro zajištění, že cookies budou odesílány s požadavky:

```typescript
const response = await fetch("/api/admin/articles", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  credentials: 'include',  // Přidat toto
  body: JSON.stringify(articleData)
});
```

2. Odstranit kód, který explicitně přidává Authorization hlavičku s tokenem z localStorage:

```typescript
// MÍSTO
headers: {
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`
},

// POUŽÍT
headers: {
  "Content-Type": "application/json"
},
credentials: 'include'
```

### 2. Problém s ukládáním statusu článku

**Problém:**
V API endpointu pro vytváření článků je nejednoznačná logika pro určení statusu článku, což může vést k situacím, kdy se článek nesprávně uloží jako koncept, i když má být publikovaný.

**Řešení:**
Upravit logiku v API endpointu v `/app/api/admin/articles/route.ts`:

```typescript
// MÍSTO
status: (articleData.status || (articleData.published ? ArticleStatus.PUBLISHED : ArticleStatus.DRAFT)),

// POUŽÍT
status: articleData.status === ArticleStatus.PUBLISHED || articleData.published === true
  ? ArticleStatus.PUBLISHED 
  : ArticleStatus.DRAFT,
```

### 3. Problém s validací formuláře

**Problém:**
Formulář pro vytváření článku nevaliduje povinná pole jako `categoryId` před odesláním.

**Řešení:**
V komponentě `ArticleEditor` přidat validaci před odesláním formuláře:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Přidaná validace
  if (!title.trim()) {
    toast({ title: "Chyba", description: "Název článku je povinný", variant: "destructive" });
    return;
  }
  
  if (!categoryId) {
    toast({ title: "Chyba", description: "Vyberte kategorii pro článek", variant: "destructive" });
    return;
  }
  
  if (!content.trim()) {
    toast({ title: "Chyba", description: "Obsah článku je povinný", variant: "destructive" });
    return;
  }
  
  setIsSaving(true);
  // Zbytek funkce zůstává stejný
};
```

### 4. Problém s aktualizací seznamu článků

**Problém:**
Po vytvoření nebo aktualizaci článku nemusí dojít k aktualizaci seznamu článků v administraci.

**Řešení:**
Zajistit, že se vždy volá `loadArticles()` nebo `onRefresh()` po úspěšném uložení článku:

```typescript
if (result.success) {
  toast({ title: articleId ? "Článek úspěšně aktualizován" : "Článek úspěšně vytvořen" });
  // Přidáno volání refresh funkce
  if (onRefresh) await onRefresh();
  if (onSave) onSave();
  router.refresh();
}
```

## Testování řešení

Po implementaci výše uvedených změn doporučuji provést tyto testy:

1. Vytvořit nový článek a nastavit jeho status na "Publikováno"
2. Ověřit, že se článek uložil se správným statusem
3. Upravit existující článek a změnit jeho status
4. Ověřit, že se změny projevily
5. Použít diagnostickou stránku `/admin/diagnose` pro automatické testování

Tyto testy pomohou ověřit, že problémy s ukládáním článků byly vyřešeny.
