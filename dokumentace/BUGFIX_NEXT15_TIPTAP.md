# Opravy chyb v aplikaci

## 1. Chyba s `params.id` v dynamických cestách

**Problém**: Next.js 15.4.5 vyžaduje explicitní použití `await` na parametrech v dynamických cestách.

**Chybová hláška**:
\`\`\`
Error: Route "/aktuality/[id]" used `params.id`. `params` should be awaited before using its properties.
\`\`\`

**Řešení**:
- V souborech `/app/aktuality/[id]/page.tsx` a podobných jsme přidali explicitní `await` pro parametry:

\`\`\`typescript
// Před:
const article = await getArticle(params.id);

// Po:
const resolvedParams = await params;
const article = await getArticle(resolvedParams.id);
\`\`\`

## 2. Chyba s Tiptap editorem při SSR

**Problém**: Tiptap editor hlásil chybu SSR hydratace, protože nebyl explicitně nastaven režim vykreslování.

**Chybová hláška**:
\`\`\`
Error: Tiptap Error: SSR has been detected, please set `immediatelyRender` explicitly to `false` to avoid hydration mismatches.
\`\`\`

**Řešení**:
- Ve všech komponentách používajících Tiptap editor jsme přidali nastavení `immediatelyRender: false`:

\`\`\`typescript
const editor = useEditor({
  // Přidáno nastavení pro řešení SSR hydratační chyby
  immediatelyRender: false,
  extensions: [
    // ...
  ],
  // ...
});
\`\`\`

Opravy byly provedeny v těchto souborech:
- `/app/aktuality/[id]/page.tsx`
- `/app/admin/components/MediaEnabledTiptapEditor.tsx`
- `/app/admin/components/TiptapEditor_improved.tsx`

## Důležité poznámky

1. Změny v API pro dynamické parametry jsou součástí migrace na Next.js 15.4.5, která vyžaduje explicitní čekání na rozpoznání parametrů.

2. Nastavení `immediatelyRender: false` zajišťuje, že Tiptap editor bude správně hydratován při přechodu ze serveru na klient bez kolizí renderování.
