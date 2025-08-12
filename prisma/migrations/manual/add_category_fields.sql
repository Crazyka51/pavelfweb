-- AlterTable: Přidání nových sloupců do tabulky Category
ALTER TABLE "Category" 
ADD COLUMN IF NOT EXISTS "slug" TEXT,
ADD COLUMN IF NOT EXISTS "description" TEXT,
ADD COLUMN IF NOT EXISTS "color" TEXT DEFAULT '#3B82F6',
ADD COLUMN IF NOT EXISTS "display_order" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "is_active" BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS "parent_id" TEXT;

-- Inicializace sloupce slug z existujících názvů
-- Skript bude aktualizován po výpisu existujících kategorií
