# Editable Texts Feature - Quick Start

## Co bylo implementováno

Systém pro správu editovatelných textů, který umožňuje upravovat texty komponent přímo přes CMS admin rozhraní.

## Jak začít

### 1. Spustit migraci databáze

```bash
# V produkčním prostředí s připojenou databází
npx prisma migrate deploy
```

Pokud potřebujete vytvořit migraci:
```bash
npx prisma migrate dev --name add_editable_text
```

### 2. Přistup k admin rozhraní

1. Otevřete `/admin` v prohlížeči
2. Přihlaste se admin účtem
3. V levém menu najdete **"Správa textů"**

### 3. Přidání prvního textu

V sekci "Správa textů":
1. Klikněte na **"Přidat text"**
2. Vyplňte:
   - **Komponenta**: `hero` (název komponenty)
   - **Klíč**: `title` (klíč textu)
   - **Text**: `Bc. Pavel Fišer` (samotný text)
3. Klikněte **"Vytvořit"**

### 4. Použití v komponentě

**Server-side komponenta:**
```typescript
import { getText } from '@/lib/editable-texts';

export default async function Hero() {
  const title = await getText('hero', 'title', 'Default Title');
  
  return <h1>{title}</h1>;
}
```

**Client-side komponenta:**
```typescript
"use client";
import { useState, useEffect } from 'react';
import { getTextClient } from '@/lib/editable-texts';

export default function Hero() {
  const [title, setTitle] = useState('Default Title');
  
  useEffect(() => {
    getTextClient('hero', 'title', 'Default Title').then(setTitle);
  }, []);
  
  return <h1>{title}</h1>;
}
```

## Ukázkový příklad

Vytvořena komponenta `app/components/HeroEditable.tsx` jako příklad implementace.

## Kompletní dokumentace

Viz `dokumentace/EDITABLE_TEXTS.md` pro:
- Detailní API dokumentaci
- Všechny možnosti použití
- Doporučené konvence
- Řešení problémů

## Souhrn změn

Viz `dokumentace/EDITABLE_TEXTS_SUMMARY.md` pro kompletní přehled implementace.

## Testování

1. **API test:**
   ```bash
   curl http://localhost:3000/api/texts
   ```

2. **Admin test:**
   - Otevřete `/admin`
   - Přejděte na "Správa textů"
   - Přidejte testovací text
   - Upravte ho
   - Smažte ho

3. **Komponenta test:**
   - Použijte `HeroEditable` komponentu
   - Zkontrolujte, že se zobrazují texty z databáze

## Struktura souborů

```
✅ prisma/schema.prisma - Model EditableText
✅ app/api/texts/route.ts - CRUD API
✅ lib/editable-texts.ts - Helper funkce
✅ app/admin/components/TextsManager.tsx - Admin UI
✅ dokumentace/EDITABLE_TEXTS.md - Dokumentace
✅ app/components/HeroEditable.tsx - Příklad
```

## Hotovo! 🎉

Systém je připravený k použití. Stačí spustit migraci databáze a můžete začít přidávat editovatelné texty přes admin rozhraní.
