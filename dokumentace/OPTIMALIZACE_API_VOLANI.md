# Optimalizace opakovaných API požadavků v ArticleManager

## Popis problému

V administračním rozhraní v komponentě ArticleManager docházelo k nadměrnému volání API endpoint `/api/admin/articles`.
Toto chování způsobovalo:

1. Zvýšenou zátěž serveru (desítky požadavků za sekundu)
2. Zbytečný síťový provoz
3. Potenciální problémy s výkonem na klientské straně

## Příčina problému

Hlavní příčinou bylo nevhodně nastavené useEffect s příliš mnoha závislostmi:

\`\`\`javascript
// Původní implementace
useEffect(() => {
  // ...
  loadArticles();
}, [propArticles, onRefresh, checkApiAccess, loadArticles]);
\`\`\`

Protože `checkApiAccess` a `loadArticles` jsou callbacky vytvářené pomocí `useCallback`, 
jejich identita se mění při každém přerenderování komponenty, což vedlo k opakovanému
volání funkce `loadArticles()` a tím i k mnoha API požadavkům.

## Provedená oprava

1. **Odstranění nadbytečných závislostí z useEffect**
   - Ponechána pouze závislost na `propArticles`
   - Odstraněny závislosti způsobující nekonečnou smyčku

2. **Přidání explicitního obnovování dat**
   - Přidáno tlačítko "Obnovit" pro manuální načtení dat
   - Snížena agresivita automatického načítání

3. **Snížení množství logovaných informací**
   - Vypnut debug režim pro standardní API volání

## Testování

- Ověřte, že se při načtení admin panelu zobrazí seznam článků
- Zkontrolujte, že v konzoli nejsou opakované volání API
- Vyzkoušejte funkčnost tlačítka "Obnovit" pro manuální aktualizaci dat
