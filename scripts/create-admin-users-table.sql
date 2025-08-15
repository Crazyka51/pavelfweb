-- Vytvoření tabulky admin_users, pokud neexistuje
CREATE TABLE IF NOT EXISTS public.admin_users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP(3)
);

-- Vytvoření indexu pro rychlejší vyhledávání
CREATE INDEX IF NOT EXISTS admin_users_username_email_idx ON public.admin_users (username, email);
