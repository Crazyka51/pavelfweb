-- standardize_schema.sql
-- Tento skript upravuje schéma databáze pro standardizaci modelů

-- 1. Nejprve vytvoříme záložní tabulky pro jistotu
CREATE TABLE IF NOT EXISTS articles_backup AS SELECT * FROM articles;
CREATE TABLE IF NOT EXISTS newsletter_subscribers_backup AS SELECT * FROM newsletter_subscribers;
CREATE TABLE IF NOT EXISTS newsletter_campaigns_backup AS SELECT * FROM newsletter_campaigns;
CREATE TABLE IF NOT EXISTS newsletter_templates_backup AS SELECT * FROM newsletter_templates;

-- 2. Vytvoříme nebo upravíme triggery pro synchronizaci dat mezi standardizovanými a legacy modely
-- Tyto triggery budou dočasné, dokud aplikace nebude plně přesunuta na standardizované modely

-- Trigger pro synchronizaci článků z Article do articles
CREATE OR REPLACE FUNCTION sync_article_to_legacy()
RETURNS TRIGGER AS $$
BEGIN
  -- Aktualizace nebo vložení do legacy tabulky
  INSERT INTO articles (
    id, title, content, excerpt, category, tags, published, 
    image_url, published_at, created_at, updated_at, created_by
  )
  VALUES (
    NEW.id, 
    NEW.title, 
    NEW.content, 
    NEW.excerpt, 
    (SELECT name FROM "Category" WHERE id = NEW.categoryId LIMIT 1),
    NEW.tags::json, 
    CASE WHEN NEW.status = 'PUBLISHED' THEN true ELSE false END,
    NEW.imageUrl,
    NEW.publishedAt,
    NEW.createdAt,
    NEW.updatedAt,
    (SELECT name FROM "User" WHERE id = NEW.authorId LIMIT 1)
  )
  ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    excerpt = EXCLUDED.excerpt,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    published = EXCLUDED.published,
    image_url = EXCLUDED.image_url,
    published_at = EXCLUDED.published_at,
    updated_at = EXCLUDED.updated_at;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER article_after_insert_update
AFTER INSERT OR UPDATE ON "Article"
FOR EACH ROW
EXECUTE PROCEDURE sync_article_to_legacy();

-- Trigger pro synchronizaci odběratelů newsletteru
CREATE OR REPLACE FUNCTION sync_newsletter_subscriber_to_legacy()
RETURNS TRIGGER AS $$
BEGIN
  -- Aktualizace nebo vložení do legacy tabulky
  INSERT INTO newsletter_subscribers (
    id, email, is_active, source, unsubscribe_token, subscribed_at, unsubscribed_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    NEW.isActive,
    NEW.source,
    NEW.unsubscribeToken,
    NEW.subscribedAt,
    NEW.unsubscribedAt
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    is_active = EXCLUDED.is_active,
    source = EXCLUDED.source,
    unsubscribe_token = EXCLUDED.unsubscribe_token,
    subscribed_at = EXCLUDED.subscribed_at,
    unsubscribed_at = EXCLUDED.unsubscribed_at;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER newsletter_subscriber_after_insert_update
AFTER INSERT OR UPDATE ON "NewsletterSubscriber"
FOR EACH ROW
EXECUTE PROCEDURE sync_newsletter_subscriber_to_legacy();

-- Trigger pro synchronizaci šablon newsletteru
CREATE OR REPLACE FUNCTION sync_newsletter_template_to_legacy()
RETURNS TRIGGER AS $$
BEGIN
  -- Aktualizace nebo vložení do legacy tabulky
  INSERT INTO newsletter_templates (
    id, name, subject, content, html_content, is_active, created_at, updated_at, created_by
  )
  VALUES (
    NEW.id,
    NEW.name,
    NEW.subject,
    NEW.content,
    NEW.htmlContent,
    NEW.isActive,
    NEW.createdAt,
    NEW.updatedAt,
    (SELECT name FROM "User" WHERE id = NEW.createdById LIMIT 1)
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    subject = EXCLUDED.subject,
    content = EXCLUDED.content,
    html_content = EXCLUDED.html_content,
    is_active = EXCLUDED.is_active,
    updated_at = EXCLUDED.updated_at,
    created_by = EXCLUDED.created_by;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER newsletter_template_after_insert_update
AFTER INSERT OR UPDATE ON "NewsletterTemplate"
FOR EACH ROW
EXECUTE PROCEDURE sync_newsletter_template_to_legacy();

-- Trigger pro synchronizaci kampaní newsletteru
CREATE OR REPLACE FUNCTION sync_newsletter_campaign_to_legacy()
RETURNS TRIGGER AS $$
BEGIN
  -- Aktualizace nebo vložení do legacy tabulky
  INSERT INTO newsletter_campaigns (
    id, name, subject, content, html_content, text_content, template_id,
    status, scheduled_at, sent_at, recipient_count, open_count, click_count,
    bounce_count, unsubscribe_count, created_at, updated_at, created_by, tags, segment_id
  )
  VALUES (
    NEW.id,
    NEW.name,
    NEW.subject,
    NEW.content,
    NEW.htmlContent,
    NEW.textContent,
    NEW.templateId,
    NEW.status,
    NEW.scheduledAt,
    NEW.sentAt,
    NEW.recipientCount,
    NEW.openCount,
    NEW.clickCount,
    NEW.bounceCount,
    NEW.unsubscribeCount,
    NEW.createdAt,
    NEW.updatedAt,
    (SELECT name FROM "User" WHERE id = NEW.createdById LIMIT 1),
    NEW.tags::json,
    NEW.segmentId
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    subject = EXCLUDED.subject,
    content = EXCLUDED.content,
    html_content = EXCLUDED.html_content,
    text_content = EXCLUDED.text_content,
    template_id = EXCLUDED.template_id,
    status = EXCLUDED.status,
    scheduled_at = EXCLUDED.scheduled_at,
    sent_at = EXCLUDED.sent_at,
    recipient_count = EXCLUDED.recipient_count,
    open_count = EXCLUDED.open_count,
    click_count = EXCLUDED.click_count,
    bounce_count = EXCLUDED.bounce_count,
    unsubscribe_count = EXCLUDED.unsubscribe_count,
    updated_at = EXCLUDED.updated_at,
    created_by = EXCLUDED.created_by,
    tags = EXCLUDED.tags,
    segment_id = EXCLUDED.segment_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER newsletter_campaign_after_insert_update
AFTER INSERT OR UPDATE ON "NewsletterCampaign"
FOR EACH ROW
EXECUTE PROCEDURE sync_newsletter_campaign_to_legacy();

-- Poznámka: Pro produkční nasazení by bylo vhodné vytvořit i triggery pro opačný směr (z legacy modelů do standardizovaných),
-- pokud je plán postupný přechod. V tomto případě předpokládáme, že aplikace bude postupně přesunuta na standardizované modely.
