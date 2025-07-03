import { sql, NewsletterSubscriber, NewsletterCampaign, NewsletterTemplate } from '../database';

export class NewsletterService {
  
  // Subscriber management
  async getSubscribers(activeOnly: boolean = true): Promise<NewsletterSubscriber[]> {
    try {
      if (activeOnly) {
        const result = await sql`
          SELECT id, email, is_active, source, unsubscribe_token, subscribed_at, unsubscribed_at
          FROM newsletter_subscribers
          WHERE is_active = true
          ORDER BY subscribed_at DESC
        `;
        return result as NewsletterSubscriber[];
      } else {
        const result = await sql`
          SELECT id, email, is_active, source, unsubscribe_token, subscribed_at, unsubscribed_at
          FROM newsletter_subscribers
          ORDER BY subscribed_at DESC
        `;
        return result as NewsletterSubscriber[];
      }
    } catch (error) {
      console.error('Failed to get subscribers:', error);
      throw new Error('Failed to fetch subscribers');
    }
  }

  async subscribeEmail(email: string, source: string = 'web'): Promise<NewsletterSubscriber> {
    try {
      // Generate unsubscribe token
      const unsubscribeToken = Math.random().toString(36).substring(2, 15) + 
                              Math.random().toString(36).substring(2, 15);
      
      const result = await sql`
        INSERT INTO newsletter_subscribers (email, source, unsubscribe_token)
        VALUES (${email}, ${source}, ${unsubscribeToken})
        ON CONFLICT (email) 
        DO UPDATE SET 
          is_active = true,
          subscribed_at = NOW(),
          unsubscribed_at = NULL
        RETURNING id, email, is_active, source, unsubscribe_token, subscribed_at, unsubscribed_at
      `;
      
      return result[0] as NewsletterSubscriber;
    } catch (error) {
      console.error('Failed to subscribe email:', error);
      throw new Error('Failed to subscribe email');
    }
  }

  async unsubscribeEmail(token: string): Promise<boolean> {
    try {
      const result = await sql`
        UPDATE newsletter_subscribers 
        SET is_active = false, unsubscribed_at = NOW()
        WHERE unsubscribe_token = ${token}
        RETURNING id
      `;
      
      return result.length > 0;
    } catch (error) {
      console.error('Failed to unsubscribe email:', error);
      return false;
    }
  }

  async deleteSubscriber(id: string): Promise<boolean> {
    try {
      const result = await sql`DELETE FROM newsletter_subscribers WHERE id = ${id}`;
      return result.length > 0;
    } catch (error) {
      console.error('Failed to delete subscriber:', error);
      return false;
    }
  }

  // Campaign management
  async getCampaigns(): Promise<NewsletterCampaign[]> {
    try {
      const result = await sql`
        SELECT id, name, subject, content, html_content, text_content, template_id,
               status, scheduled_at, sent_at, recipient_count, open_count, click_count,
               bounce_count, unsubscribe_count, created_at, updated_at, created_by, tags, segment_id
        FROM newsletter_campaigns
        ORDER BY created_at DESC
      `;
      
      return result as NewsletterCampaign[];
    } catch (error) {
      console.error('Failed to get campaigns:', error);
      throw new Error('Failed to fetch campaigns');
    }
  }

  async getCampaignById(id: string): Promise<NewsletterCampaign | null> {
    try {
      const result = await sql`
        SELECT id, name, subject, content, html_content, text_content, template_id,
               status, scheduled_at, sent_at, recipient_count, open_count, click_count,
               bounce_count, unsubscribe_count, created_at, updated_at, created_by, tags, segment_id
        FROM newsletter_campaigns
        WHERE id = ${id}
      `;
      
      return result.length > 0 ? result[0] as NewsletterCampaign : null;
    } catch (error) {
      console.error('Failed to get campaign by ID:', error);
      return null;
    }
  }

  async createCampaign(campaignData: Omit<NewsletterCampaign, 'id' | 'created_at' | 'updated_at' | 'recipient_count' | 'open_count' | 'click_count' | 'bounce_count' | 'unsubscribe_count'>): Promise<NewsletterCampaign> {
    try {
      const result = await sql`
        INSERT INTO newsletter_campaigns (
          name, subject, content, html_content, text_content, template_id,
          status, scheduled_at, created_by, tags, segment_id
        ) VALUES (
          ${campaignData.name},
          ${campaignData.subject},
          ${campaignData.content},
          ${campaignData.html_content},
          ${campaignData.text_content || null},
          ${campaignData.template_id || null},
          ${campaignData.status},
          ${campaignData.scheduled_at || null},
          ${campaignData.created_by},
          ${JSON.stringify(campaignData.tags)},
          ${campaignData.segment_id || null}
        )
        RETURNING id, name, subject, content, html_content, text_content, template_id,
                  status, scheduled_at, sent_at, recipient_count, open_count, click_count,
                  bounce_count, unsubscribe_count, created_at, updated_at, created_by, tags, segment_id
      `;
      
      return result[0] as NewsletterCampaign;
    } catch (error) {
      console.error('Failed to create campaign:', error);
      throw new Error('Failed to create campaign');
    }
  }

  async updateCampaign(id: string, updates: Partial<Omit<NewsletterCampaign, 'id' | 'created_at'>>): Promise<NewsletterCampaign | null> {
    try {
      const result = await sql`
        UPDATE newsletter_campaigns SET
          name = COALESCE(${updates.name}, name),
          subject = COALESCE(${updates.subject}, subject),
          content = COALESCE(${updates.content}, content),
          html_content = COALESCE(${updates.html_content}, html_content),
          text_content = COALESCE(${updates.text_content}, text_content),
          status = COALESCE(${updates.status}, status),
          scheduled_at = COALESCE(${updates.scheduled_at}, scheduled_at),
          sent_at = COALESCE(${updates.sent_at}, sent_at),
          recipient_count = COALESCE(${updates.recipient_count}, recipient_count),
          open_count = COALESCE(${updates.open_count}, open_count),
          click_count = COALESCE(${updates.click_count}, click_count),
          bounce_count = COALESCE(${updates.bounce_count}, bounce_count),
          unsubscribe_count = COALESCE(${updates.unsubscribe_count}, unsubscribe_count),
          tags = COALESCE(${updates.tags ? JSON.stringify(updates.tags) : null}, tags),
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING id, name, subject, content, html_content, text_content, template_id,
                  status, scheduled_at, sent_at, recipient_count, open_count, click_count,
                  bounce_count, unsubscribe_count, created_at, updated_at, created_by, tags, segment_id
      `;
      
      return result.length > 0 ? result[0] as NewsletterCampaign : null;
    } catch (error) {
      console.error('Failed to update campaign:', error);
      throw new Error('Failed to update campaign');
    }
  }

  async deleteCampaign(id: string): Promise<boolean> {
    try {
      const result = await sql`DELETE FROM newsletter_campaigns WHERE id = ${id}`;
      return result.length > 0;
    } catch (error) {
      console.error('Failed to delete campaign:', error);
      return false;
    }
  }

  // Template management
  async getTemplates(): Promise<NewsletterTemplate[]> {
    try {
      const result = await sql`
        SELECT id, name, subject, content, html_content, is_active, created_at, updated_at, created_by
        FROM newsletter_templates
        WHERE is_active = true
        ORDER BY created_at DESC
      `;
      
      return result as NewsletterTemplate[];
    } catch (error) {
      console.error('Failed to get templates:', error);
      throw new Error('Failed to fetch templates');
    }
  }

  async createTemplate(templateData: Omit<NewsletterTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<NewsletterTemplate> {
    try {
      const result = await sql`
        INSERT INTO newsletter_templates (name, subject, content, html_content, is_active, created_by)
        VALUES (${templateData.name}, ${templateData.subject}, ${templateData.content}, 
                ${templateData.html_content}, ${templateData.is_active}, ${templateData.created_by})
        RETURNING id, name, subject, content, html_content, is_active, created_at, updated_at, created_by
      `;
      
      return result[0] as NewsletterTemplate;
    } catch (error) {
      console.error('Failed to create template:', error);
      throw new Error('Failed to create template');
    }
  }

  // Statistics
  async getSubscriberStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    recent: number;
  }> {
    try {
      const totalResult = await sql`SELECT COUNT(*) as count FROM newsletter_subscribers`;
      const activeResult = await sql`SELECT COUNT(*) as count FROM newsletter_subscribers WHERE is_active = true`;
      const inactiveResult = await sql`SELECT COUNT(*) as count FROM newsletter_subscribers WHERE is_active = false`;
      const recentResult = await sql`
        SELECT COUNT(*) as count FROM newsletter_subscribers 
        WHERE subscribed_at > NOW() - INTERVAL '30 days'
      `;
      
      return {
        total: parseInt(totalResult[0].count as string),
        active: parseInt(activeResult[0].count as string),
        inactive: parseInt(inactiveResult[0].count as string),
        recent: parseInt(recentResult[0].count as string),
      };
    } catch (error) {
      console.error('Failed to get subscriber stats:', error);
      return { total: 0, active: 0, inactive: 0, recent: 0 };
    }
  }
}

export const newsletterService = new NewsletterService();
