# Vylepšený TipTap editor s podporou médií

## Přehled implementace

V této aktualizaci jsme vytvořili komplexní systém pro správu médií integrovaný s TipTap editorem. Implementace umožňuje:

1. **Správa médií**
   - Nahrávání obrázků přes přetažení nebo výběr souborů
   - Organizaci souborů podle roku a měsíce
   - Vyhledávání v médiích
   - Snadné vkládání obrázků do obsahu

2. **Vylepšený editor**
   - Vkládání obrázků pomocí drag & drop
   - Podpora vkládání YouTube videí
   - Vylepšené formátování textu
   - Pokročilá práce s tabulkami
   - Zarovnání textu

3. **API endpointy**
   - Endpointy pro nahrávání médií
   - Endpointy pro procházení a mazání médií

## Hlavní soubory

### API Endpointy
- `/api/admin/media/upload/route.ts` - Nahrávání souborů
- `/api/admin/media/list/route.ts` - Výpis médií
- `/api/admin/media/delete/route.ts` - Mazání médií

### UI Komponenty
- `/app/admin/components/MediaEnabledTiptapEditor.tsx` - Hlavní editor s podporou médií
- `/app/admin/components/MediaManager.tsx` - Správce médií
- `/app/admin/components/MediaPickerDialog.tsx` - Dialog pro výběr médií
- `/app/admin/components/TiptapToolbar.tsx` - Vylepšený panel nástrojů

### Integrace
- `/app/admin/media/page.tsx` - Samostatná stránka pro správu médií
- `/app/admin/components/ArticleEditor.tsx` - Integrace s editorem článků

## Jak to funguje

### Nahrávání obrázků
1. Uživatel může nahrávat obrázky přes správce médií nebo přímo v editoru
2. Soubory jsou ukládány do adresářové struktury `/public/media/YYYY/MM/`
3. Pro každý soubor je generován unikátní hash k zajištění jedinečnosti

### Používání médií v editoru
1. Tlačítko pro vložení obrázku otevře dialog s výběrem médií
2. Vybraný obrázek je vložen na aktuální pozici kurzoru
3. Drag & drop obrázků přímo do editoru je také podporován

### YouTube videa
1. Pomocí tlačítka "Vložit YouTube video" lze přidat odkaz
2. Odkaz je automaticky zpracován a vložen jako iframe

## Bezpečnost
- Ověřování uživatelů pomocí JWT tokenů
- Kontrola typu souborů (povoleny pouze obrázky)
- Limitace velikosti souborů (max 5MB)
- Sanitizace názvů souborů

## Příští kroky
- Implementace cache pro rychlejší načítání obrázků
- Možnost úpravy obrázků (ořez, otočení)
- Podpora dalších typů médií (PDF, video)
- Zobrazení statistik využití médií
