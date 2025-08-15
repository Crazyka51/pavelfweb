-- Zkontrolovat existující admin uživatele
SELECT 
    id,
    username,
    email,
    role,
    is_active,
    created_at,
    last_login
FROM admin_users
ORDER BY created_at DESC;
