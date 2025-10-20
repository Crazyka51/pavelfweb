# Editor komponent - Dokumentace

## Přehled

Editor komponent je nová funkce administračního panelu, která umožňuje editaci textového obsahu přímo ze zdrojových souborů komponent webu.

## Funkce

### Přístup
Editor komponent je dostupný v administračním panelu v sekci "Editor kódu" (ikona `</>`).

### Možnosti editoru
- **Seznam souborů**: Zobrazuje všechny komponenty v adresáři `app/components/`
- **Vyhledávání**: Možnost filtrovat soubory podle názvu
- **Editor**: Textový editor s číslováním řádků a zvýrazněním syntaxe
- **Automatické ukládání**: Indikace neuložených změn
- **Statistiky**: Počet řádků a znaků v editovaném souboru

### Bezpečnost
- **Autentizace**: Přístup pouze pro přihlášené administrátory
- **Omezení cesty**: Editace pouze souborů v `app/components/`
- **Validace**: Kontrola oprávnění před každým čtením/zápisem

## Použití

### Editace textu v komponentách

1. Přihlaste se do administračního panelu
2. V menu vyberte "Editor kódu"
3. Ze seznamu komponent vyberte soubor, který chcete editovat
4. Upravte textový obsah (texty, nadpisy, popisy)
5. Klikněte na tlačítko "Uložit"

### Doporučení

⚠️ **Důležité upozornění:**
- Editujte pouze textový obsah (texty, nadpisy, popisy)
- Neměňte strukturu kódu (JSX, funkce, importy)
- Při úpravách buďte opatrní, chyby mohou způsobit nefunkčnost webu
- Doporučujeme vytvořit zálohu před většími změnami

### Příklad editace textu

**Před:**
```tsx
<h1>Původní nadpis</h1>
<p>Původní text popisu</p>
```

**Po:**
```tsx
<h1>Nový nadpis</h1>
<p>Nový text popisu</p>
```

## API Endpointy

### GET /api/admin/code-editor
Získá seznam všech komponent v `app/components/`

**Response:**
```json
{
  "success": true,
  "files": [
    {
      "name": "Hero.tsx",
      "path": "app/components/Hero.tsx",
      "size": 2048,
      "modified": "2025-10-20T15:00:00.000Z"
    }
  ]
}
```

### POST /api/admin/code-editor
Čte nebo zapisuje obsah souboru

**Request (čtení):**
```json
{
  "filePath": "app/components/Hero.tsx",
  "action": "read"
}
```

**Request (zápis):**
```json
{
  "filePath": "app/components/Hero.tsx",
  "action": "write",
  "content": "// nový obsah souboru"
}
```

## Technické detaily

### Bezpečnostní opatření
1. Autentizace pomocí `requireAuth` middleware
2. Validace cesty souboru (pouze `app/components/`)
3. Ochrana proti path traversal útokům
4. Logování akcí v development módu

### Komponenty
- **CodeEditor.tsx**: Hlavní komponenta editoru
- **route.ts**: API endpoint pro manipulaci se soubory
- **AdminLayout.tsx**: Integrace do navigace

## Budoucí vylepšení

Plánovaná vylepšení:
- [ ] Syntax highlighting v editoru
- [ ] Automatické formátování kódu
- [ ] Historie změn (git integration)
- [ ] Diff view pro porovnání změn
- [ ] Podpora pro více adresářů
- [ ] Předvolby pro editaci pouze textového obsahu

## Troubleshooting

### Nelze uložit soubor
- Zkontrolujte oprávnění k zápisu do souboru
- Ověřte, že jste přihlášení jako administrátor
- Zkontrolujte, že cesta souboru začína `app/components/`

### Soubor se nezobrazuje v seznamu
- Ujistěte se, že má soubor příponu `.tsx`, `.ts`, `.jsx` nebo `.js`
- Ověřte, že je soubor v adresáři `app/components/`

## Závěr

Editor komponent je mocný nástroj pro rychlé úpravy textového obsahu webu. Používejte ho zodpovědně a vždy se ujistěte, že víte, co měníte.
