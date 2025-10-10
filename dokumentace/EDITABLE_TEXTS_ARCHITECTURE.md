# Editable Texts Feature - Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                           │
└─────────────────────────────────────────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ▼                         ▼
        ┌───────────────────┐     ┌──────────────────┐
        │  Admin Interface  │     │  Public Website  │
        │   /admin/texts    │     │   Components     │
        └───────────────────┘     └──────────────────┘
                    │                         │
                    │                         │
                    ▼                         ▼
        ┌───────────────────┐     ┌──────────────────┐
        │  TextsManager.tsx │     │  HeroEditable    │
        │  - List texts     │     │  - Display text  │
        │  - Add/Edit       │     │  - Use defaults  │
        │  - Delete         │     └──────────────────┘
        │  - Search         │                │
        └───────────────────┘                │
                    │                         │
                    └────────────┬────────────┘
                                 │
                                 ▼
        ┌─────────────────────────────────────────┐
        │          API LAYER (/api/texts)         │
        ├─────────────────────────────────────────┤
        │  GET    - Fetch texts (public)          │
        │  POST   - Create text (admin only)      │
        │  PUT    - Update text (admin only)      │
        │  DELETE - Remove text (admin only)      │
        └─────────────────────────────────────────┘
                         │
                         ▼
        ┌─────────────────────────────────────────┐
        │      HELPER LIBRARY (lib/)              │
        ├─────────────────────────────────────────┤
        │  getText()       - Server-side          │
        │  getTexts()      - Batch fetch          │
        │  getTextClient() - Client-side          │
        │  Cache (5 min TTL)                      │
        └─────────────────────────────────────────┘
                         │
                         ▼
        ┌─────────────────────────────────────────┐
        │         PRISMA ORM                      │
        └─────────────────────────────────────────┘
                         │
                         ▼
        ┌─────────────────────────────────────────┐
        │    DATABASE (PostgreSQL/Neon)           │
        ├─────────────────────────────────────────┤
        │  Table: EditableText                    │
        │  ┌───────────────────────────┐          │
        │  │ id          (String)      │          │
        │  │ component   (String)      │          │
        │  │ textKey     (String)      │          │
        │  │ value       (String)      │          │
        │  │ lang        (String)      │          │
        │  │ createdAt   (DateTime)    │          │
        │  │ updatedAt   (DateTime)    │          │
        │  └───────────────────────────┘          │
        │  Indexes:                               │
        │  - component                            │
        │  Unique: (component, textKey, lang)     │
        └─────────────────────────────────────────┘
```

## Flow Diagram: How It Works

### 1. Admin Flow - Adding/Editing Text

```
Admin User
    │
    ├─→ Navigate to /admin
    │
    ├─→ Click "Správa textů" in menu
    │
    ├─→ TextsManager Component Loads
    │     │
    │     ├─→ Fetches texts from GET /api/texts
    │     │
    │     └─→ Displays texts grouped by component
    │
    ├─→ Click "Přidat text" or Edit existing
    │
    ├─→ Fill form (component, textKey, value, lang)
    │
    ├─→ Submit → POST/PUT /api/texts (with Bearer token)
    │
    ├─→ API validates token & data
    │
    ├─→ Prisma writes to database
    │
    └─→ Success! Text is saved
```

### 2. Website Flow - Displaying Text

```
Website Component (e.g., Hero)
    │
    ├─→ Server-side: import { getText } from '@/lib/editable-texts'
    │   Client-side: import { getTextClient } from '@/lib/editable-texts'
    │
    ├─→ Call: getText('hero', 'title', 'Default Title')
    │
    ├─→ Check cache first
    │     │
    │     ├─→ Cache hit? → Return cached value
    │     │
    │     └─→ Cache miss? → Continue
    │
    ├─→ Query database via Prisma
    │     │
    │     ├─→ Text found? → Return value from DB
    │     │
    │     └─→ Not found? → Return default value
    │
    ├─→ Cache the result (5 min TTL)
    │
    └─→ Render text in component
```

### 3. Data Flow

```
┌──────────────┐
│ Admin Types  │ ──────────────┐
│   in Form    │               │
└──────────────┘               │
                               ▼
                    ┌────────────────────┐
                    │  API Validation    │
                    │  - Check fields    │
                    │  - Auth check      │
                    └────────────────────┘
                               │
                               ▼
                    ┌────────────────────┐
                    │  Prisma ORM        │
                    │  - Type safety     │
                    │  - SQL generation  │
                    └────────────────────┘
                               │
                               ▼
                    ┌────────────────────┐
                    │  PostgreSQL DB     │
                    │  - Store data      │
                    │  - Enforce unique  │
                    └────────────────────┘
                               │
                               ▼
┌──────────────┐    ┌────────────────────┐    ┌──────────────┐
│   Cache      │◄───│  Helper Functions  │───►│  Component   │
│  (5 min)     │    │  - getText()       │    │  Display     │
└──────────────┘    └────────────────────┘    └──────────────┘
```

## Security Model

```
┌──────────────────────┐
│   GET /api/texts     │ ──► PUBLIC (no auth needed)
└──────────────────────┘     Anyone can read texts

┌──────────────────────┐
│  POST /api/texts     │ ──► ADMIN ONLY
│  PUT  /api/texts     │     Requires Bearer token
│  DELETE /api/texts   │     Validated by authenticateAdmin()
└──────────────────────┘
```

## Performance Optimization

```
Request → Check Cache ─┬─► Cache Hit (99% after warmup)
                       │    Return immediately
                       │    ⚡ Super fast!
                       │
                       └─► Cache Miss (1%)
                           │
                           ├─► Query Database
                           │   (with index on component)
                           │
                           ├─► Store in Cache (5 min TTL)
                           │
                           └─► Return result
```

## Key Features

✅ **Separation of Concerns**
   - API handles data operations
   - Helper library handles caching
   - Components handle display
   - Admin UI handles management

✅ **Security**
   - Read access: Public
   - Write access: Admin only
   - Token authentication
   - Input validation

✅ **Performance**
   - 5-minute cache
   - Database indexes
   - Batch operations support

✅ **Reliability**
   - Fallback to defaults
   - Error handling
   - Type safety with TypeScript
   - Unique constraints

✅ **Usability**
   - Intuitive admin interface
   - Search functionality
   - Grouped display
   - Inline editing
