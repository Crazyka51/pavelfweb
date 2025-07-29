# Admin Dashboard - Aktualizace pro lokální statistiky

## Změny provedené v AdminDashboard.tsx

### Odebrané prvky:
- Mock data pro návštěvnost (today/week/month views)
- Fake analytics čísla, která byla pouze simulovaná

### Přidané užitečné statistiky:
- **Celkový počet slov** ve všech článcích
- **Průměrný počet slov** na článek
- **Počet nových článků** za posledních 7 dní
- Lepší odkaz na Vercel Analytics pro skutečnou návštěvnost

### Výhody této změny:

1. **Relevantní informace**: Dashboard nyní zobrazuje skutečně užitečné statistiky o obsahu
2. **Žádné fake data**: Odstraněny simulované čísla návštěvnosti
3. **Přesměrování na Vercel**: Jasné směřování na Vercel pro skutečnou analytiku
4. **Lepší UX**: Uživatel vidí smysluplné informace o svém obsahu

### Zobrazované statistiky:

#### Hlavní karty:
- Celkem článků
- Publikované články  
- Koncepty
- Naplánované články

#### Statistiky obsahu:
- Celkový počet slov (s formátováním tisíců)
- Průměrný počet slov na článek
- Počet nových článků za posledních 7 dní

#### Ostatní sekce:
- Nedávné články (posledních 5)
- Nedávná aktivita (posledních 8 akcí)
- Quick actions pro rychlé operace

### Technické detaily:

- Počítání slov: Odstraní HTML tagy a spočítá skutečná slova
- Formátování čísel: České formátování pro tisíce
- Datum filtering: Skutečný výpočet posledních 7 dní
- Responsivní design: Funkční na mobilu i desktopu

### Pro budoucí rozšíření:

Dashboard je připraven pro:
- Kategorie a tagy statistiky
- Export/import funkce
- Backup informace
- Uživatelské nastavení

### Vercel Analytics:

Dashboard obsahuje přímý odkaz na Vercel Analytics kde Pavel najde:
- Real-time návštěvnost
- Geografická data
- Referrer statistiky
- Page views a session data
- Performance metriky

Toto rozdělení zajišťuje, že CMS dashboard se zaměřuje na správu obsahu, zatímco Vercel poskytuje profesionální web analytics.
