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
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

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
`;

const dataInsertionSql = `
-- Update existing users with proper passwords
-- Password for 'pavel' and 'Crazyk' is 'admin123'
UPDATE admin_users 
SET password_hash = crypt('admin123', gen_salt('bf'))
WHERE username IN ('pavel', 'Pavel', 'Crazyk');

-- Insert sample article if not exists
INSERT INTO articles (title, content, excerpt, category, tags, published, created_at, updated_at)
SELECT 
    'Vítejte na webu Pavla Fišera', 
    '<p>Vítejte na oficiálním webu zastupitele MČ Praha 4 Pavla Fišera.</p>',
    'Úvodní příspěvek na webu zastupitele Pavla Fišera.',
    'Aktuality',
    '["úvod", "praha4", "zastupitel"]'::jsonb,
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM articles WHERE title = 'Vítejte na webu Pavla Fišera');

-- Sample newsletter template
INSERT INTO newsletter_templates (name, subject, content, html_content)
SELECT
    'Základní šablona',
    'Newsletter z Prahy 4',
    'Obsah newsletteru...',
    '<html><body><h1>Newsletter</h1><p>Obsah newsletteru...</p></body></html>'
WHERE NOT EXISTS (SELECT 1 FROM newsletter_templates WHERE name = 'Základní šablona');
`;

async function executeSQL(statement) {
  try {
    return await sql.query(statement);
  } catch (error) {
    console.error(`Error executing SQL: ${error.message}`);
    throw error;
  }
}

async function setupAndTestDatabase() {
  console.log('Starting database setup and test...');
  try {
    console.log('Creating schema...');
    
    // Execute each SQL statement separately
    await executeSQL('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    await executeSQL('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
    
    // Create tables
    await executeSQL(`
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
      )
    `);
    
    await executeSQL(`
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE NOT NULL,
        is_active BOOLEAN DEFAULT true,
        source VARCHAR(50) DEFAULT 'web',
        unsubscribe_token TEXT,
        subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        unsubscribed_at TIMESTAMP WITH TIME ZONE
      )
    `);
    
    await executeSQL(`
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
      )
    `);
    
    await executeSQL(`
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
      )
    `);
    
    await executeSQL(`
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
      )
    `);
    
    await executeSQL(`
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
      )
    `);
    
    // Create indexes
    await executeSQL('CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published, created_at DESC)');
    await executeSQL('CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category)');
    await executeSQL('CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at DESC)');
    await executeSQL('CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email)');
    await executeSQL('CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_active ON newsletter_subscribers(is_active)');
    await executeSQL('CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_status ON newsletter_campaigns(status)');
    await executeSQL('CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_created_at ON newsletter_campaigns(created_at DESC)');
    await executeSQL('CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at DESC)');
    await executeSQL('CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON activity_log(user_id)');
    
    console.log('Schema created successfully.');
    
    console.log('Inserting sample data...');
    
    // Update existing users
    await executeSQL(`
      UPDATE admin_users 
      SET password_hash = crypt('admin123', gen_salt('bf'))
      WHERE username IN ('pavel', 'Pavel', 'Crazyk')
    `);
    
    // Sample article
    const articleExists = await sql`SELECT COUNT(*) FROM articles WHERE title = 'Vítejte na webu Pavla Fišera'`;
    if (parseInt(articleExists[0]?.count || 0) === 0) {
      await sql`
        INSERT INTO articles (title, content, excerpt, category, tags, published, created_at, updated_at)
        VALUES (
          'Vítejte na webu Pavla Fišera',
          '<p>Vítejte na oficiálním webu zastupitele MČ Praha 4 Pavla Fišera.</p>',
          'Úvodní příspěvek na webu zastupitele Pavla Fišera.',
          'Aktuality',
          ${'["úvod", "praha4", "zastupitel"]'}::jsonb,
          true,
          NOW(),
          NOW()
        )
      `;
    }
    
    // Sample template
    const templateExists = await sql`SELECT COUNT(*) FROM newsletter_templates WHERE name = 'Základní šablona'`;
    if (parseInt(templateExists[0]?.count || 0) === 0) {
      await sql`
        INSERT INTO newsletter_templates (name, subject, content, html_content)
        VALUES (
          'Základní šablona',
          'Newsletter z Prahy 4',
          'Obsah newsletteru...',
          '<html><body><h1>Newsletter</h1><p>Obsah newsletteru...</p></body></html>'
        )
      `;
    }
    
    console.log('Sample data inserted successfully.');
    console.log('---');
    console.log('Verifying admin users...');

    const users = await sql`
      SELECT username, email, is_active, created_at
      FROM admin_users 
      ORDER BY created_at
    `;
    
    if (users.length > 0) {
      console.log('Admin users found:');
      users.forEach(user => {
        console.log(`- ${user.username} (${user.email || 'no email'}) - Active: ${user.is_active ? 'yes' : 'no'}`);
      });
      console.log('\nYou can now login with:');
      console.log('Username: pavel');
      console.log('Password: admin123');
    } else {
      console.log('No admin users found, creating default admin user...');
      
      // Create default admin user if none exists
      await sql`
        INSERT INTO admin_users (username, password_hash, email, role, is_active)
        VALUES (
          'pavel', 
          crypt('admin123', gen_salt('bf')), 
          'admin@example.com',
          'admin',
          true
        )
      `;
      
      console.log('Default admin user created.');
      console.log('\nYou can now login with:');
      console.log('Username: pavel');
      console.log('Password: admin123');
    }
    
    console.log('\nDatabase setup completed successfully!');
    
  } catch (error) {
    console.error('Database setup or test failed:', error);
    process.exit(1);
  }
}

setupAndTestDatabase();
