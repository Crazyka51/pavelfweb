-- Kompletní setup databáze s admin uživateli
-- Spustí se přímo v v0 prostředí

-- Ujistíme se, že máme pgcrypto extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Vytvoříme admin_users tabulku pokud neexistuje
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

-- Vytvoříme indexy pro výkon
CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(is_active);

-- Nastavíme hesla všem existujícím uživatelům na "admin123"
UPDATE admin_users 
SET password_hash = crypt('admin123', gen_salt('bf', 10)),
    updated_at = CURRENT_TIMESTAMP
WHERE username IN ('pavel', 'Pavel', 'Crazyk');

-- Zobrazíme výsledek
SELECT 
    username,
    email,
    role,
    is_active,
    created_at,
    CASE 
        WHEN password_hash IS NOT NULL AND password_hash != '' 
        THEN 'Heslo nastaveno ✓' 
        ELSE 'Heslo chybí ✗' 
    END as password_status
FROM admin_users 
ORDER BY created_at;
