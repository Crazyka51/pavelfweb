-- Ověření, že uživatel pavel má správně nastavené heslo
SELECT 
    id,
    username,
    email,
    password_hash IS NOT NULL as has_password,
    is_active,
    role
FROM admin_users 
WHERE username = 'pavel';

-- Pokud password_hash je NULL, nastavíme heslo "admin123"
UPDATE admin_users 
SET 
    password_hash = crypt('admin123', gen_salt('bf')),
    updated_at = NOW()
WHERE username = 'pavel' AND password_hash IS NULL;

-- Ověření po update
SELECT 
    username,
    email,
    password_hash IS NOT NULL as password_set,
    is_active,
    'Heslo nastaveno na: admin123' as note
FROM admin_users 
WHERE username = 'pavel';
