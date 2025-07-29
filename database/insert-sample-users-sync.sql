-- insert-sample-users-sync.sql
-- Skript pro vložení vzorových záznamů do tabulky users_sync

-- Vložení základních záznamů
INSERT INTO users_sync (name, email, published, raw_json)
VALUES 
    ('Pavel Fišer', 'pavel.fiser@praha4.cz', true, '{"role": "admin", "phone": "+420123456789"}'),
    ('Admin Webu', 'admin@example.com', true, '{"role": "editor", "notes": "Hlavní správce webu"}'),
    ('Testovací Uživatel', 'test@example.com', false, '{"role": "user", "test": true}')
ON CONFLICT (email) DO NOTHING;  -- Upravte podle skutečného unique klíče, pokud není email
