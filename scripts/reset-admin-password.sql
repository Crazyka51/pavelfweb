-- Resetovat heslo existujícího admin uživatele
-- Nové heslo: newpassword123
UPDATE admin_users 
SET 
    password_hash = '$2b$12$K8gF2Z1qJ3mN4oP5rS6tT.uV7wX8yZ9aB1cD2eF3gH4iJ5kL6mN7o',
    updated_at = NOW()
WHERE username = 'admin' OR email = 'admin@example.com';
