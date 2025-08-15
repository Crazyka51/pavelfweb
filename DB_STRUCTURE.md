# Struktura databáze a řešení autentizace

Na základě reverzního inženýrství byla zjištěna následující struktura databáze a identifikovány problémy s autentizací.

## Struktura databáze

### Tabulky definované v Prisma schématu

1. **User**
   - Primární klíč: `id` (string, cuid)
   - Unikátní pole: `email`
   - Povinná pole: `email`, `password`
   - Relace:
     - `articles` - spojeno s tabulkou Article (one-to-many)
     - `createdCampaigns` - spojeno s tabulkou NewsletterCampaign (one-to-many)
     - `createdTemplates` - spojeno s tabulkou NewsletterTemplate (one-to-many)
   - Časové značky: `createdAt`, `updatedAt`

2. **Category**
   - Primární klíč: `id` (string, cuid)
   - Unikátní pole: `name`
   - Relace:
     - `articles` - spojeno s tabulkou Article (one-to-many)
   - Manuální migrace přidala pole:
     - `slug` (unikátní)
     - `description`
     - `color`
     - `display_order`
     - `is_active`
     - `parent_id`

3. **Article**
   - Primární klíč: `id` (string, cuid)
   - Unikátní pole: `title`, `slug`
   - Status: enum `ArticleStatus` (DRAFT, PUBLISHED, ARCHIVED)
   - Relace:
     - `author` - spojeno s tabulkou User (many-to-one)
     - `category` - spojeno s tabulkou Category (many-to-one)
   - Časové značky: `createdAt`, `updatedAt`, `publishedAt`

4. **NewsletterSubscriber**
   - Primární klíč: `id` (string, cuid)
   - Unikátní pole: `email`, `unsubscribeToken`
   - Časové značky: `subscribedAt`, `unsubscribedAt`

5. **NewsletterCampaign**
   - Primární klíč: `id` (string, cuid)
   - Status: enum `CampaignStatus` (DRAFT, SCHEDULED, SENDING, SENT, FAILED)
   - Relace:
     - `createdBy` - spojeno s tabulkou User (many-to-one)
     - `template` - spojeno s tabulkou NewsletterTemplate (many-to-one)
   - Časové značky: `createdAt`, `updatedAt`, `scheduledAt`, `sentAt`

6. **NewsletterTemplate**
   - Primární klíč: `id` (string, cuid)
   - Unikátní pole: `name`
   - Relace:
     - `createdBy` - spojeno s tabulkou User (many-to-one)
     - `campaigns` - spojeno s tabulkou NewsletterCampaign (one-to-many)
   - Časové značky: `createdAt`, `updatedAt`

### Tabulky používané autentizačním systémem

1. **admin_users** (tabulka není definována v Prisma schématu)
   - Používaná pro autentizaci v `/lib/auth-utils.ts`
   - Očekávaná struktura:
     - `id` (primární klíč)
     - `username` (unikátní)
     - `email` (unikátní)
     - `password_hash`
     - `role`
     - `is_active` (boolean)
     - `created_at`
     - `updated_at`
     - `last_login`

## Identifikované problémy

1. **Nesoulad mezi Prisma schématem a autentizačním systémem**:
   - Autentizační funkce v `auth-utils.ts` pracují s tabulkou `admin_users`
   - Prisma schéma definuje model `User` s jinou strukturou
   - Tabulka `admin_users` pravděpodobně neexistuje v databázi

2. **Chybějící pole v modelu User**:
   - Model `User` nemá pole `username` a `role`, která jsou očekávána v autentizačním systému

## Navrhovaná řešení

### Řešení 1: Vytvořit tabulku admin_users

1. Vytvořit tabulku `admin_users` podle očekávané struktury
2. Použít skript `create-admin-users-table.sql`
3. Vytvořit administrátorského uživatele pomocí `generate-admin-user.js`

### Řešení 2: Upravit autentizační systém pro práci s modelem User

1. Použít aktualizovanou verzi `auth-utils-updated.ts`, která podporuje oba modely
2. Přejmenovat na `auth-utils.ts` a nahradit původní soubor

### Řešení 3: Aktualizovat Prisma schéma

1. Přidat model `AdminUser` do Prisma schématu
2. Vytvořit migrační skript

## Doporučené kroky

1. Nejprve zkontrolujte připojení k databázi pomocí skriptu `check-db-connection.js`
2. Podle výsledku zvolte nejvhodnější řešení:
   - Pokud existuje tabulka `admin_users`, použijte Řešení 2
   - Pokud neexistuje a chcete zachovat stávající autentizační logiku, použijte Řešení 1
   - Pokud chcete kompletně přepracovat autentizační systém, použijte Řešení 3

3. Po implementaci řešení otestujte autentizaci pomocí endpointu `/api/admin/auth/v2/login`

## Příklad nastavení administrátorského účtu

```sql
INSERT INTO admin_users (
    id,
    username,
    email,
    password_hash,
    role,
    is_active,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'admin',
    'admin@example.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXwtGtrmu3VG', -- heslo: admin123
    'admin',
    true,
    NOW(),
    NOW()
);
```

## Přehled struktury databáze

```
┌────────────────────┐      ┌───────────────────┐      ┌─────────────────────────┐
│      User          │      │    Category       │      │    Article              │
├────────────────────┤      ├───────────────────┤      ├─────────────────────────┤
│ id                 │      │ id                │      │ id                      │
│ email              │◄─┐   │ name              │◄─┐   │ title                   │
│ password           │  │   │ slug              │  │   │ slug                    │
│ name               │  │   │ description       │  │   │ content                 │
│ createdAt          │  │   │ color             │  │   │ excerpt                 │
│ updatedAt          │  │   │ display_order     │  │   │ imageUrl                │
└────────────────────┘  │   │ is_active         │  │   │ status                  │
                        │   │ parent_id         │  │   │ publishedAt             │
                        │   │ createdAt         │  │   │ isFeatured              │
                        │   │ updatedAt         │  │   │ authorId ───────────────┘
                        │   └───────────────────┘  │   │ categoryId ─────────────┘
                        │                          │   │ tags                     │
┌────────────────────┐  │                          │   │ metaTitle                │
│ NewsletterCampaign │  │                          │   │ metaDescription          │
├────────────────────┤  │                          │   │ createdAt                │
│ id                 │  │                          │   │ updatedAt                │
│ name               │  │   ┌────────────────────┐ │   └─────────────────────────┘
│ subject            │  │   │NewsletterTemplate  │ │   
│ content            │  │   ├────────────────────┤ │   ┌──────────────────────────┐
│ htmlContent        │  │   │ id                 │ │   │  NewsletterSubscriber    │
│ textContent        │  │   │ name               │ │   ├──────────────────────────┤
│ status             │  │   │ subject            │ │   │ id                       │
│ scheduledAt        │  │   │ content            │ │   │ email                    │
│ sentAt             │  │   │ htmlContent        │ │   │ isActive                 │
│ recipientCount     │  └───│ isActive           │ │   │ source                   │
│ openCount          │      │ createdById        │─┘   │ unsubscribeToken         │
│ clickCount         │      │ createdAt          │     │ subscribedAt             │
│ bounceCount        │      │ updatedAt          │     │ unsubscribedAt           │
│ unsubscribeCount   │      └────────────────────┘     └──────────────────────────┘
│ createdById        │──┘
│ templateId         │────────┘
│ tags               │
│ segmentId          │
│ createdAt          │
│ updatedAt          │
└────────────────────┘
```
