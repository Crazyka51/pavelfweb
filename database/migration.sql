-- Migration script for transferring data from JSON files to Neon PostgreSQL
-- Run this after setting up the database schema

-- First, ensure the schema exists
-- (This should already be run from schema.sql)

-- Insert sample admin user for testing
INSERT INTO admin_users (username, password_hash, role, is_active, created_by)
VALUES 
  ('admin', '$2a$10$example.hash.for.admin.password', 'admin', true, 'system')
ON CONFLICT (username) DO NOTHING;

-- Insert sample categories
INSERT INTO categories (name, slug, description, is_active, created_by)
VALUES 
  ('Aktuality', 'aktuality', 'Aktuální zprávy a novinky', true, 'admin'),
  ('Události', 'udalosti', 'Nadcházející události a akce', true, 'admin'),
  ('Projekty', 'projekty', 'Dokončené a probíhající projekty', true, 'admin')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample articles (can be updated with real data later)
INSERT INTO articles (title, content, excerpt, category, tags, published, created_by)
VALUES 
  ('Vítejte na nových stránkách', 
   '<p>Vítejte na našich nově vytvořených webových stránkách! Tyto stránky představují moderní způsob prezentace našich služeb a projektů.</p><p>Najdete zde aktuální informace o našich činnostech, portfolio projektů a možnost kontaktu.</p>', 
   'Vítejte na našich nových webových stránkách s moderním designem a funkcemi.',
   'Aktuality',
   '["web", "design", "moderní"]',
   true,
   'admin'),
  ('První článek', 
   '<p>Toto je ukázkový článek vytvořený pro demonstraci fungování systému správy obsahu.</p><p>Systém umožňuje vytváření, úpravu a mazání článků s podporou HTML formátování.</p>', 
   'Ukázkový článek pro demonstraci CMS systému.',
   'Aktuality',
   '["cms", "demo", "článek"]',
   true,
   'admin')
ON CONFLICT DO NOTHING;

-- Insert sample newsletter template
INSERT INTO newsletter_templates (name, subject, content, html_content, is_active, created_by)
VALUES 
  ('Základní template', 
   'Newsletter - {{date}}', 
   'Vážení odběratelé,\n\nPřinášíme vám nejnovější informace...\n\n{{content}}\n\nS pozdravem,\nTým', 
   '<html><body><h2>Newsletter</h2><p>Vážení odběratelé,</p><p>Přinášíme vám nejnovější informace:</p>{{content}}<p>S pozdravem,<br>Tým</p></body></html>',
   true,
   'admin')
ON CONFLICT DO NOTHING;

-- Sample newsletter subscribers can be added manually through the admin interface

COMMIT;
