-- Aktivovat admin uživatele (pokud je deaktivovaný)
UPDATE admin_users 
SET 
    is_active = true,
    updated_at = NOW()
WHERE username = 'admin' OR email = 'admin@example.com';
