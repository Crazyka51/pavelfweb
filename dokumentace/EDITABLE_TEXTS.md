# Správa editovatelných textů v CMS

## Přehled

Systém editovatelných textů umožňuje upravovat texty jednotlivých komponent přímo přes administrační rozhraní CMS, bez nutnosti měnit kód. Texty se ukládají do databáze a načítají dynamicky podle názvu komponenty a klíče.

## Struktura databáze

### Model EditableText

```typescript
model EditableText {
  id        String   @id @default(cuid())
  component String   @db.VarChar(100)  // Název komponenty (např. "hero", "about")
  textKey   String   @db.VarChar(100)  // Klíč textu (např. "title", "description")
  value     String                      // Samotný text
  lang      String   @default("cs")     // Jazyk (výchozí: "cs")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([component, textKey, lang])
  @@index([component])
}
```

## API Endpointy

### GET /api/texts
Získá všechny editovatelné texty nebo filtruje podle komponenty.

**Query parametry:**
- `component` (optional) - Filtrovat podle názvu komponenty
- `lang` (optional) - Jazyk, výchozí "cs"

**Příklad:**
```javascript
// Získat všechny texty
fetch('/api/texts')

// Získat texty pro komponentu "hero"
fetch('/api/texts?component=hero')
```

**Odpověď:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx...",
      "component": "hero",
      "textKey": "title",
      "value": "Bc. Pavel Fišer",
      "lang": "cs",
      "createdAt": "2025-10-10T...",
      "updatedAt": "2025-10-10T..."
    }
  ]
}
```

### POST /api/texts (Admin pouze)
Vytvoří nový editovatelný text.

**Autorizace:** Bearer token v hlavičce Authorization

**Body:**
```json
{
  "component": "hero",
  "textKey": "title",
  "value": "Bc. Pavel Fišer",
  "lang": "cs"
}
```

### PUT /api/texts (Admin pouze)
Aktualizuje existující text.

**Body:**
```json
{
  "id": "clx...",
  "value": "Nový text"
}
```

### DELETE /api/texts (Admin pouze)
Smaže text podle ID.

**Query parametry:**
- `id` (required) - ID textu k odstranění

## Použití v komponentách

### Server-side komponenty (doporučeno)

Pro server-side komponenty použijte funkci `getText`:

```typescript
import { getText } from '@/lib/editable-texts';

export default async function Hero() {
  // Získat jednotlivý text s fallbackem
  const title = await getText('hero', 'title', 'Bc. Pavel Fišer');
  const subtitle = await getText('hero', 'subtitle', 'Zastupitel MČ Praha 4');
  const description = await getText(
    'hero', 
    'description', 
    'Manažer s vášní pro komunitní rozvoj'
  );

  return (
    <div className="hero">
      <h1>{title}</h1>
      <p className="subtitle">{subtitle}</p>
      <p>{description}</p>
    </div>
  );
}
```

### Získání více textů najednou

```typescript
import { getTexts } from '@/lib/editable-texts';

export default async function Hero() {
  const texts = await getTexts('hero', [
    { key: 'title', defaultValue: 'Bc. Pavel Fišer' },
    { key: 'subtitle', defaultValue: 'Zastupitel MČ Praha 4' },
    { key: 'description', defaultValue: 'Manažer s vášní...' },
    { key: 'buttonText', defaultValue: 'Kontaktujte mě' },
  ]);

  return (
    <div className="hero">
      <h1>{texts.title}</h1>
      <p className="subtitle">{texts.subtitle}</p>
      <p>{texts.description}</p>
      <button>{texts.buttonText}</button>
    </div>
  );
}
```

### Client-side komponenty

Pro client-side komponenty použijte `getTextClient` nebo `useState` s `useEffect`:

```typescript
"use client";

import { useState, useEffect } from 'react';
import { getTextClient } from '@/lib/editable-texts';

export default function Hero() {
  const [title, setTitle] = useState('Bc. Pavel Fišer');
  const [subtitle, setSubtitle] = useState('Zastupitel MČ Praha 4');

  useEffect(() => {
    // Načíst texty z API
    getTextClient('hero', 'title', 'Bc. Pavel Fišer').then(setTitle);
    getTextClient('hero', 'subtitle', 'Zastupitel MČ Praha 4').then(setSubtitle);
  }, []);

  return (
    <div className="hero">
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
  );
}
```

### Alternativa s přímým fetch:

```typescript
"use client";

import { useState, useEffect } from 'react';

export default function Hero() {
  const [texts, setTexts] = useState({
    title: 'Bc. Pavel Fišer',
    subtitle: 'Zastupitel MČ Praha 4'
  });

  useEffect(() => {
    fetch('/api/texts?component=hero')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const textMap: any = {};
          data.data.forEach((t: any) => {
            textMap[t.textKey] = t.value;
          });
          setTexts(prev => ({ ...prev, ...textMap }));
        }
      })
      .catch(console.error);
  }, []);

  return (
    <div className="hero">
      <h1>{texts.title}</h1>
      <p>{texts.subtitle}</p>
    </div>
  );
}
```

## Administrace textů

### Přístup k administraci

1. Přihlaste se do admin panelu na `/admin`
2. V levém menu zvolte **"Správa textů"**
3. Zde můžete:
   - Zobrazit všechny texty seskupené podle komponent
   - Vyhledávat texty podle komponenty, klíče nebo obsahu
   - Přidat nový text
   - Upravit existující text
   - Odstranit text

### Přidání nového textu

1. Klikněte na tlačítko **"Přidat text"**
2. Vyplňte formulář:
   - **Komponenta**: Název komponenty (např. "hero", "about", "contact")
   - **Klíč**: Klíč textu (např. "title", "description", "buttonText")
   - **Text**: Samotný text
   - **Jazyk**: Výchozí je "cs"
3. Klikněte **"Vytvořit"**

### Úprava textu

1. Najděte text, který chcete upravit
2. Klikněte na ikonu tužky (Edit)
3. Upravte text v textovém poli
4. Klikněte **"Uložit"** nebo **"Zrušit"** pro zrušení změn

### Odstranění textu

1. Najděte text, který chcete odstranit
2. Klikněte na ikonu koše (Delete)
3. Potvrďte odstranění

## Doporučené konvence pojmenování

### Názvy komponent
- Používejte kebab-case: `hero`, `about-us`, `contact-form`
- Používejte název, který odpovídá názvu komponenty nebo sekci webu

### Názvy klíčů
- Používejte camelCase nebo kebab-case: `title`, `description`, `buttonText`, `button-text`
- Buďte konzistentní v rámci projektu
- Používejte popisné názvy: `mainTitle`, `shortDescription`, `ctaButtonText`

### Příklady dobré struktury

```
Komponenta: hero
- title: "Bc. Pavel Fišer"
- subtitle: "Zastupitel MČ Praha 4"
- description: "Manažer s vášní..."
- buttonText: "Kontaktujte mě"
- linkText: "Moje priority"

Komponenta: about
- heading: "O mně"
- introduction: "Jsem zastupitel..."
- experience: "Více než 10 let..."

Komponenta: contact
- title: "Kontaktujte mě"
- description: "Rád odpovím..."
- buttonText: "Odeslat zprávu"
- successMessage: "Děkuji za zprávu!"
```

## Cache a výkon

Systém automaticky cachuje načtené texty po dobu 5 minut, aby minimalizoval dotazy do databáze.

Pro vymazání cache (např. po aktualizaci textu):

```typescript
import { clearTextsCache } from '@/lib/editable-texts';

clearTextsCache();
```

## Migrace existujících komponent

### Před:
```typescript
export default function Hero() {
  return (
    <div>
      <h1>Bc. Pavel Fišer</h1>
      <p>Zastupitel MČ Praha 4</p>
    </div>
  );
}
```

### Po:
```typescript
import { getText } from '@/lib/editable-texts';

export default async function Hero() {
  const title = await getText('hero', 'title', 'Bc. Pavel Fišer');
  const subtitle = await getText('hero', 'subtitle', 'Zastupitel MČ Praha 4');

  return (
    <div>
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
  );
}
```

## Tipy a triky

1. **Používejte popisné výchozí hodnoty**: Fallback hodnoty by měly být smysluplné a použitelné i bez databáze
2. **Organizujte podle komponent**: Seskupujte související texty pod jednu komponentu
3. **Používejte cache**: Server-side komponenty automaticky využívají cache
4. **Testujte fallbacky**: Ujistěte se, že aplikace funguje i když databáze není dostupná
5. **Dokumentujte klíče**: V kódu používejte komentáře pro popis účelu jednotlivých textů

## Řešení problémů

### Text se nenačítá
- Zkontrolujte, že text existuje v databázi (přes admin rozhraní)
- Ověřte, že používáte správný název komponenty a klíč
- Zkontrolujte konzoli prohlížeče/serveru pro chybové zprávy

### Změny se nezobrazují
- Vyčistěte cache prohlížeče
- Vyčistěte server cache pomocí `clearTextsCache()`
- Zkontrolujte, že jste uložili změny v admin rozhraní

### Autorizační chyby při API voláních
- Ujistěte se, že jste přihlášeni jako admin
- Zkontrolujte, že token je platný a není expirovaný
- GET endpointy nepotřebují autorizaci, POST/PUT/DELETE ano
