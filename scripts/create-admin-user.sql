-- Vytvořit nového admin uživatele
-- Heslo: admin123 (hash pro bcrypt s cost 12)
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
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXwtGtrmu3VG',
    'admin',
    true,
    NOW(),
    NOW()
);
