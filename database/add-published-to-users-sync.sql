-- add-published-to-users-sync.sql
-- Skript pro přidání sloupce 'published' do tabulky 'users_sync' (pokud existuje)
-- Opravená verze, která bezpečně kontroluje existenci tabulky bez použití regclass

-- Ujistíme se, že máme potřebná rozšíření
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Nejprve zkontrolujeme, zda tabulka existuje
DO $$
DECLARE
    table_exists BOOLEAN;
    column_exists BOOLEAN;
BEGIN
    -- Bezpečnější kontrola existence tabulky
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users_sync'
        AND table_schema = 'public'
    ) INTO table_exists;
    
    IF table_exists THEN
        -- Bezpečnější kontrola existence sloupce
        SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'users_sync'
            AND column_name = 'published'
            AND table_schema = 'public'
        ) INTO column_exists;
        
        IF NOT column_exists THEN
            -- Přidáme sloupec published jako boolean s výchozí hodnotou false
            ALTER TABLE users_sync ADD COLUMN published BOOLEAN DEFAULT false;
            RAISE NOTICE 'Sloupec published byl přidán do tabulky users_sync.';
        ELSE
            RAISE NOTICE 'Sloupec published již v tabulce users_sync existuje.';
        END IF;
    ELSE
        RAISE NOTICE 'Tabulka users_sync neexistuje, vytvářím ji...';
        
        -- Vytvoříme tabulku users_sync, protože neexistuje
        CREATE TABLE users_sync (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            deleted_at TIMESTAMP WITH TIME ZONE,
            raw_json JSONB,
            published BOOLEAN DEFAULT false
        );
        RAISE NOTICE 'Tabulka users_sync byla úspěšně vytvořena.';
    END IF;
END $$;
