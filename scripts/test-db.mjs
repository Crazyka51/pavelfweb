import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const { DATABASE_URL } = process.env;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const sql = neon(DATABASE_URL);

const schemaSql = `
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Articles table
CREATE TABLE IF NOT EXISTS articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    category VARCHAR(100) NOT NULL,
    tags JSONB DEFAULT '[]',
    published BOOLEAN DEFAULT false,
    image_url TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(100) DEFAULT 'admin'
);

-- Newsletter subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    source VARCHAR(50) DEFAULT 'web',
    unsubscribe_token TEXT,
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    unsubscribed_at TIMESTAMP WITH TIME ZONE
);

-- Newsletter campaigns table  
CREATE TABLE IF NOT EXISTS newsletter_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    html_content TEXT NOT NULL,
    text_content TEXT,
    template_id UUID,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed')),
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    recipient_count INTEGER DEFAULT 0,
    open_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    bounce_count INTEGER DEFAULT 0,
    unsubscribe_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(100) DEFAULT 'admin',
    tags JSONB DEFAULT '[]',
    segment_id UUID
);

-- Newsletter templates table
CREATE TABLE IF NOT EXISTS newsletter_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    html_content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(100) DEFAULT 'admin'
);

-- Admin users table (for authentication)
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    role VARCHAR(20) DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity log table (for audit trail)
CREATE TABLE IF NOT EXISTS activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES admin_users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_active ON newsletter_subscribers(is_active);

CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_status ON newsletter_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_created_at ON newsletter_campaigns(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON activity_log(user_id);

-- Insert default admin users (Pavel and Crazyk)
INSERT INTO admin_users (username, password_hash, email, role) 
VALUES 
    ('pavel', '$2b$10$yourhashedpasswordhere', 'pavel.fiser@praha4.cz', 'admin'),
    ('Crazyk', '$2b$10$yourhashedpasswordhere', 'admin@example.com', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Insert sample categories data
INSERT INTO articles (title, content, excerpt, category, tags, published, created_at, updated_at)
VALUES 
    ('Vítejte na webu Pavla Fišera', 
     '<p>Vítejte na oficiálním webu zastupitele MČ Praha 4 Pavla Fišera.</p>',
     'Úvodní příspěvek na webu zastupitele Pavla Fišera.',
     'Aktuality',
     '["úvod", "praha4", "zastupitel"]',
     true,
     NOW(),
     NOW())
ON CONFLICT DO NOTHING;

-- Sample newsletter template
INSERT INTO newsletter_templates (name, subject, content, html_content)
VALUES 
    ('Základní šablona',
     'Newsletter z Prahy 4',
     'Obsah newsletteru...',
     '<html><body><h1>Newsletter</h1><p>Obsah newsletteru...</p></body></html>')
ON CONFLICT DO NOTHING;
`;

async function setupAndTestDatabase() {
  console.log('Starting database setup and test...');
  try {
    const statements = schemaSql.split(';').filter(s => s.trim().length > 0);
    console.log(`Found ${statements.length} statements to execute.`);

    for (const statement of statements) {
      const trimmedStatement = statement.trim();
      console.log(`Executing: ${trimmedStatement.substring(0, 70).replace(/\s+/g, ' ')}...`);
      await sql.query(trimmedStatement);


    }
    
    console.log('Database setup complete.');
    console.log('---');
    console.log('Verifying tables...');

    const result = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    
    if (result.length > 0) {
      console.log('Connection successful! Found tables:');
      result.forEach(row => console.log(`- ${row.table_name}`));
    } else {
      console.log('Connection successful, but no tables were found in the public schema.');
    }
    
  } catch (error) {
    console.error('Database setup or test failed:', error);
    process.exit(1);
  }
}

setupAndTestDatabase();
