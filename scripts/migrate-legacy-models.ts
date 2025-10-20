import { PrismaClient } from '@prisma/client';

/**
 * Tento skript provádí migraci dat z legacy modelů (articles, newsletter_subscribers, newsletter_campaigns, newsletter_templates)
 * do standardizovaných modelů (Article, NewsletterSubscriber, NewsletterCampaign, NewsletterTemplate).
 * 
 * Spuštění: npx ts-node scripts/migrate-legacy-models.ts
 */

const prisma = new PrismaClient();

/**
 * Funkce pro migraci článků z 'articles' do 'Article'
 */
async function migrateArticles() {
  try {
    // Získání všech článků z legacy modelu
    const legacyArticles = await prisma.articles.findMany();

    // Získání uživatele pro authorId
    let author = await prisma.user.findFirst();
    if (!author) {
      author = await prisma.user.create({
        data: {
          name: "Admin",
          email: "admin@example.com",
          password: "hashed_password_placeholder", // V produkci použít skutečný hash
        }
      });
    }

    // Získání kategorie pro categoryId
    let category = await prisma.category.findFirst();
    if (!category) {
      category = await prisma.category.create({
        data: {
          name: "Aktuality",
          slug: "aktuality",
          description: "Aktuální příspěvky",
        }
      });
    }

    // Migrace každého článku
    for (const legacyArticle of legacyArticles) {
      // Kontrola, zda článek již existuje v cílovém modelu
      const existingArticle = await prisma.article.findFirst({
        where: {
          title: legacyArticle.title
        }
      });

      if (!existingArticle) {
        
        // Vytvoření nového článku v modelu Article
        await prisma.article.create({
          data: {
            title: legacyArticle.title,
            content: legacyArticle.content,
            excerpt: legacyArticle.excerpt || null,
            status: legacyArticle.published ? 'PUBLISHED' : 'DRAFT',
            slug: legacyArticle.title.toLowerCase().replace(/[^\w]+/g, '-'), // Vytvoření slugu z názvu
            authorId: author.id,
            categoryId: category.id,
            tags: Array.isArray(legacyArticle.tags) ? legacyArticle.tags.map((tag: any) => String(tag)) : [],
            imageUrl: legacyArticle.image_url,
            publishedAt: legacyArticle.published_at,
            createdAt: legacyArticle.created_at || new Date(),
            updatedAt: legacyArticle.updated_at || new Date(),
          }
        });
      } else {
      }
    }
  } catch (error) {
  }
}

/**
 * Funkce pro migraci odběratelů newsletteru
 */
async function migrateNewsletterSubscribers() {
  try {
    const legacySubscribers = await prisma.newsletter_subscribers.findMany();

    for (const legacySubscriber of legacySubscribers) {
      const existingSubscriber = await prisma.newsletterSubscriber.findFirst({
        where: {
          email: legacySubscriber.email
        }
      });

      if (!existingSubscriber) {
        await prisma.newsletterSubscriber.create({
          data: {
            id: legacySubscriber.id, // Použijeme stejné ID
            email: legacySubscriber.email,
            isActive: legacySubscriber.is_active ?? true,
            source: legacySubscriber.source || 'web',
            unsubscribeToken: legacySubscriber.unsubscribe_token || null,
            subscribedAt: legacySubscriber.subscribed_at || new Date(),
            unsubscribedAt: legacySubscriber.unsubscribed_at || null,
          }
        });
      } else {
      }
    }
  } catch (error) {
  }
}

/**
 * Funkce pro migraci šablon newsletteru
 */
async function migrateNewsletterTemplates() {
  try {
    const legacyTemplates = await prisma.newsletter_templates.findMany();

    // Získání uživatele pro createdById
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: "Admin",
          email: "admin@example.com",
          password: "hashed_password_placeholder", // V produkci použít skutečný hash
        }
      });
    }

    for (const legacyTemplate of legacyTemplates) {
      const existingTemplate = await prisma.newsletterTemplate.findFirst({
        where: {
          name: legacyTemplate.name
        }
      });

      if (!existingTemplate) {
        await prisma.newsletterTemplate.create({
          data: {
            id: legacyTemplate.id, // Použijeme stejné ID
            name: legacyTemplate.name,
            subject: legacyTemplate.subject,
            content: legacyTemplate.content,
            htmlContent: legacyTemplate.html_content,
            isActive: legacyTemplate.is_active ?? true,
            createdById: user.id,
            createdAt: legacyTemplate.created_at || new Date(),
            updatedAt: legacyTemplate.updated_at || new Date(),
          }
        });
      } else {
      }
    }
  } catch (error) {
  }
}

/**
 * Funkce pro migraci kampaní newsletteru
 */
async function migrateNewsletterCampaigns() {
  try {
    const legacyCampaigns = await prisma.newsletter_campaigns.findMany();

    // Získání uživatele pro createdById
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: "Admin",
          email: "admin@example.com",
          password: "hashed_password_placeholder", // V produkci použít skutečný hash
        }
      });
    }

    for (const legacyCampaign of legacyCampaigns) {
      const existingCampaign = await prisma.newsletterCampaign.findFirst({
        where: {
          name: legacyCampaign.name
        }
      });

      if (!existingCampaign) {
        
        // Převod statusu na enum
        let status: 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'SENT' | 'FAILED' = 'DRAFT';
        switch (legacyCampaign.status?.toLowerCase()) {
          case 'scheduled': status = 'SCHEDULED'; break;
          case 'sending': status = 'SENDING'; break;
          case 'sent': status = 'SENT'; break;
          case 'failed': status = 'FAILED'; break;
        }

        // Nalezení odpovídající template_id, pokud existuje
        let templateId = null;
        if (legacyCampaign.template_id) {
          const legacyTemplate = await prisma.newsletter_templates.findUnique({
            where: { id: legacyCampaign.template_id }
          });
          
          if (legacyTemplate) {
            const targetTemplate = await prisma.newsletterTemplate.findFirst({
              where: { name: legacyTemplate.name }
            });
            if (targetTemplate) {
              templateId = targetTemplate.id;
            }
          }
        }

        await prisma.newsletterCampaign.create({
          data: {
            id: legacyCampaign.id, // Použijeme stejné ID
            name: legacyCampaign.name,
            subject: legacyCampaign.subject,
            content: legacyCampaign.content || '',
            htmlContent: legacyCampaign.html_content,
            textContent: legacyCampaign.text_content || null,
            status: status,
            scheduledAt: legacyCampaign.scheduled_at || null,
            sentAt: legacyCampaign.sent_at || null,
            recipientCount: legacyCampaign.recipient_count || 0,
            openCount: legacyCampaign.open_count || 0,
            clickCount: legacyCampaign.click_count || 0,
            bounceCount: legacyCampaign.bounce_count || 0,
            unsubscribeCount: legacyCampaign.unsubscribe_count || 0,
            createdById: user.id,
            templateId: templateId,
            tags: Array.isArray(legacyCampaign.tags) ? legacyCampaign.tags.map((tag: any) => String(tag)) : [],
            segmentId: legacyCampaign.segment_id || null,
            createdAt: legacyCampaign.created_at || new Date(),
            updatedAt: legacyCampaign.updated_at || new Date(),
          }
        });
      } else {
      }
    }
  } catch (error) {
  }
}

/**
 * Hlavní funkce pro spuštění migrace
 */
async function runMigration() {
  try {
    
    // Spustit migraci jednotlivých modelů
    await migrateArticles();
    await migrateNewsletterSubscribers();
    await migrateNewsletterTemplates();
    await migrateNewsletterCampaigns();
    
  } catch (error) {
  } finally {
    await prisma.$disconnect();
  }
}

// Spustit migraci
runMigration();
