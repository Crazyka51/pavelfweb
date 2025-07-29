import { sql } from "../database"
import { type NewsletterSubscriber, type NewsletterCampaign, type NewsletterTemplate } from "../newsletter-schema"

/**
 * Pomocná funkce pro převod výsledků SQL dotazu na pole objektů
 */
function sqlToArray<T>(result: unknown): T[] {
  return result as T[]
}

export class NewsletterService {
  // Subscriber management
  async getSubscribers(activeOnly = true): Promise<NewsletterSubscriber[]> {
    try {
      if (activeOnly) {
        const queryResult = await sql`
          SELECT id, email, is_active, source, unsubscribe_token, subscribed_at, unsubscribed_at
          FROM newsletter_subscribers
          WHERE is_active = true
          ORDER BY subscribed_at DESC
        `
        // Převod na pole a typování výsledků
        const result = sqlToArray<any>(queryResult)
        return result.map(row => ({
          id: row.id,
          email: row.email,
          is_active: row.is_active,
          source: row.source || 'web',
          unsubscribe_token: row.unsubscribe_token,
          subscribed_at: row.subscribed_at,
          unsubscribed_at: row.unsubscribed_at
        })) as NewsletterSubscriber[]
      } else {
        const queryResult = await sql`
          SELECT id, email, is_active, source, unsubscribe_token, subscribed_at, unsubscribed_at
          FROM newsletter_subscribers
          ORDER BY subscribed_at DESC
        `
        // Převod na pole a typování výsledků
        const result = sqlToArray<any>(queryResult)
        return result.map(row => ({
          id: row.id,
          email: row.email,
          is_active: row.is_active,
          source: row.source || 'web',
          unsubscribe_token: row.unsubscribe_token,
          subscribed_at: row.subscribed_at,
          unsubscribed_at: row.unsubscribed_at
        })) as NewsletterSubscriber[]
      }
    } catch (error) {
      console.error("Failed to get subscribers:", error)
      throw new Error("Failed to fetch subscribers")
    }
  }

  async subscribeEmail(email: string, source = "web"): Promise<NewsletterSubscriber> {
    try {
      // Generate unsubscribe token
      const unsubscribeToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

      const queryResult = await sql`
        INSERT INTO newsletter_subscribers (email, source, unsubscribe_token)
        VALUES (${email}, ${source}, ${unsubscribeToken})
        ON CONFLICT (email) 
        DO UPDATE SET 
          is_active = true,
          subscribed_at = NOW(),
          unsubscribed_at = NULL
        RETURNING id, email, is_active, source, unsubscribe_token, subscribed_at, unsubscribed_at
      `
      // Převod na pole a typování výsledku
      const result = sqlToArray<any>(queryResult)
      
      // Kontrola výsledku
      if (result.length === 0) {
        throw new Error("Failed to subscribe email")
      }
      
      const row = result[0]
      return {
        id: row.id,
        email: row.email,
        is_active: row.is_active,
        source: row.source || 'web',
        unsubscribe_token: row.unsubscribe_token,
        subscribed_at: row.subscribed_at,
        unsubscribed_at: row.unsubscribed_at
      } as NewsletterSubscriber
    } catch (error) {
      console.error("Failed to subscribe email:", error)
      throw error // Re-throw to be caught by API route for specific error messages
    }
  }

  async unsubscribeEmail(email: string): Promise<boolean> {
    try {
      const queryResult = await sql`
        UPDATE newsletter_subscribers 
        SET is_active = false, unsubscribed_at = NOW()
        WHERE email = ${email}
        RETURNING id
      `
      
      const result = sqlToArray<any>(queryResult)
      return result.length > 0
    } catch (error) {
      console.error("Failed to unsubscribe email:", error)
      return false
    }
  }

  async unsubscribeByToken(token: string): Promise<boolean> {
    try {
      const queryResult = await sql`
        UPDATE newsletter_subscribers 
        SET is_active = false, unsubscribed_at = NOW()
        WHERE unsubscribe_token = ${token}
        RETURNING id
      `
      
      const result = sqlToArray<any>(queryResult)
      return result.length > 0
    } catch (error) {
      console.error("Failed to unsubscribe by token:", error)
      return false
    }
  }

  async deleteSubscriber(id: string): Promise<boolean> {
    try {
      const queryResult = await sql`DELETE FROM newsletter_subscribers WHERE id = ${id} RETURNING id`
      const result = sqlToArray<any>(queryResult)
      return result.length > 0
    } catch (error) {
      console.error("Failed to delete subscriber:", error)
      return false
    }
  }

  // Statistics
  async getSubscriberStats(): Promise<{
    total: number
    active: number
    inactive: number
    recent: number
  }> {
    try {
      const totalQueryResult = await sql`SELECT COUNT(*) as count FROM newsletter_subscribers`
      const activeQueryResult = await sql`SELECT COUNT(*) as count FROM newsletter_subscribers WHERE is_active = true`
      const inactiveQueryResult = await sql`SELECT COUNT(*) as count FROM newsletter_subscribers WHERE is_active = false`
      const recentQueryResult = await sql`
        SELECT COUNT(*) as count FROM newsletter_subscribers 
        WHERE subscribed_at > NOW() - INTERVAL '30 days'
      `
      
      const totalResult = sqlToArray<any>(totalQueryResult)
      const activeResult = sqlToArray<any>(activeQueryResult)
      const inactiveResult = sqlToArray<any>(inactiveQueryResult)
      const recentResult = sqlToArray<any>(recentQueryResult)

      return {
        total: parseInt(totalResult[0]?.count?.toString() || '0'),
        active: parseInt(activeResult[0]?.count?.toString() || '0'),
        inactive: parseInt(inactiveResult[0]?.count?.toString() || '0'),
        recent: parseInt(recentResult[0]?.count?.toString() || '0'),
      }
    } catch (error) {
      console.error("Failed to get subscriber stats:", error)
      return { total: 0, active: 0, inactive: 0, recent: 0 }
    }
  }

  // Campaign management
  async getCampaigns(): Promise<NewsletterCampaign[]> {
    try {
      const queryResult = await sql`
        SELECT id, name, subject, content, html_content, text_content, template_id,
               status, scheduled_at, sent_at, recipient_count, open_count, click_count,
               bounce_count, unsubscribe_count, created_at, updated_at, created_by, tags, segment_id
        FROM newsletter_campaigns
        ORDER BY created_at DESC
      `

      const result = sqlToArray<any>(queryResult)
      return result.map(row => ({
        id: row.id,
        name: row.name,
        subject: row.subject,
        content: row.content,
        html_content: row.html_content,
        text_content: row.text_content,
        template_id: row.template_id,
        status: row.status,
        scheduled_at: row.scheduled_at,
        sent_at: row.sent_at,
        recipient_count: parseInt(row.recipient_count || '0'),
        open_count: parseInt(row.open_count || '0'),
        click_count: parseInt(row.click_count || '0'),
        bounce_count: parseInt(row.bounce_count || '0'),
        unsubscribe_count: parseInt(row.unsubscribe_count || '0'),
        created_at: row.created_at,
        updated_at: row.updated_at,
        created_by: row.created_by,
        tags: row.tags,
        segment_id: row.segment_id
      })) as NewsletterCampaign[]
    } catch (error) {
      console.error("Failed to get campaigns:", error)
      throw new Error("Failed to fetch campaigns")
    }
  }
  
  async getCampaign(id: string): Promise<NewsletterCampaign | null> {
    try {
      const queryResult = await sql`
        SELECT id, name, subject, content, html_content, text_content, template_id,
               status, scheduled_at, sent_at, recipient_count, open_count, click_count,
               bounce_count, unsubscribe_count, created_at, updated_at, created_by, tags, segment_id
        FROM newsletter_campaigns
        WHERE id = ${id}
      `
      const result = sqlToArray<any>(queryResult)
      
      if (result.length === 0) {
        return null
      }
      
      const row = result[0]
      return {
        id: row.id,
        name: row.name,
        subject: row.subject,
        content: row.content,
        html_content: row.html_content,
        text_content: row.text_content,
        template_id: row.template_id,
        status: row.status,
        scheduled_at: row.scheduled_at,
        sent_at: row.sent_at,
        recipient_count: parseInt(row.recipient_count || '0'),
        open_count: parseInt(row.open_count || '0'),
        click_count: parseInt(row.click_count || '0'),
        bounce_count: parseInt(row.bounce_count || '0'),
        unsubscribe_count: parseInt(row.unsubscribe_count || '0'),
        created_at: row.created_at,
        updated_at: row.updated_at,
        created_by: row.created_by,
        tags: row.tags,
        segment_id: row.segment_id
      } as NewsletterCampaign
    } catch (error) {
      console.error("Failed to get campaign:", error)
      return null
    }
  }
  
  async createCampaign(campaignData: Partial<NewsletterCampaign>): Promise<NewsletterCampaign> {
    try {
      const queryResult = await sql`
        INSERT INTO newsletter_campaigns (name, subject, content, html_content, text_content, template_id, status, created_by)
        VALUES (
          ${campaignData.name || 'Untitled Campaign'}, 
          ${campaignData.subject || ''}, 
          ${campaignData.content || ''}, 
          ${campaignData.html_content || ''}, 
          ${campaignData.text_content || null}, 
          ${campaignData.template_id || null},
          ${campaignData.status || 'draft'},
          ${campaignData.created_by || 'system'}
        )
        RETURNING id, name, subject, content, html_content, text_content, template_id,
                 status, scheduled_at, sent_at, recipient_count, open_count, click_count,
                 bounce_count, unsubscribe_count, created_at, updated_at, created_by, tags, segment_id
      `
      const result = sqlToArray<any>(queryResult)
      
      const row = result[0]
      return {
        id: row.id,
        name: row.name,
        subject: row.subject,
        content: row.content,
        html_content: row.html_content,
        text_content: row.text_content,
        template_id: row.template_id,
        status: row.status,
        scheduled_at: row.scheduled_at,
        sent_at: row.sent_at,
        recipient_count: parseInt(row.recipient_count || '0'),
        open_count: parseInt(row.open_count || '0'),
        click_count: parseInt(row.click_count || '0'),
        bounce_count: parseInt(row.bounce_count || '0'),
        unsubscribe_count: parseInt(row.unsubscribe_count || '0'),
        created_at: row.created_at,
        updated_at: row.updated_at,
        created_by: row.created_by,
        tags: row.tags,
        segment_id: row.segment_id
      } as NewsletterCampaign
    } catch (error) {
      console.error("Failed to create campaign:", error)
      throw new Error("Failed to create campaign")
    }
  }
  
  async updateCampaign(id: string, campaignData: Partial<NewsletterCampaign>): Promise<NewsletterCampaign | null> {
    try {
      // Vytvoříme části SQL dotazu jen pro pole, která jsou poskytnuta
      let updateFields = []
      
      if (campaignData.name !== undefined) updateFields.push(`name = ${campaignData.name}`)
      if (campaignData.subject !== undefined) updateFields.push(`subject = ${campaignData.subject}`)
      if (campaignData.content !== undefined) updateFields.push(`content = ${campaignData.content}`)
      if (campaignData.html_content !== undefined) updateFields.push(`html_content = ${campaignData.html_content}`)
      if (campaignData.text_content !== undefined) updateFields.push(`text_content = ${campaignData.text_content}`)
      if (campaignData.template_id !== undefined) updateFields.push(`template_id = ${campaignData.template_id}`)
      if (campaignData.status !== undefined) updateFields.push(`status = ${campaignData.status}`)
      if (campaignData.scheduled_at !== undefined) updateFields.push(`scheduled_at = ${campaignData.scheduled_at}`)
      if (campaignData.sent_at !== undefined) updateFields.push(`sent_at = ${campaignData.sent_at}`)
      
      // Pokud nejsou žádná pole k aktualizaci, vrátíme původní kampaň
      if (updateFields.length === 0) {
        return this.getCampaign(id)
      }
      
      // Přidáme updated_at
      updateFields.push(`updated_at = NOW()`)
      
      // Sestavíme a spustíme dotaz
      const updateQuery = `
        UPDATE newsletter_campaigns 
        SET ${updateFields.join(', ')}
        WHERE id = '${id}'
        RETURNING id, name, subject, content, html_content, text_content, template_id,
                 status, scheduled_at, sent_at, recipient_count, open_count, click_count,
                 bounce_count, unsubscribe_count, created_at, updated_at, created_by, tags, segment_id
      `
      
      const queryResult = await sql.raw(updateQuery)
      const result = sqlToArray<any>(queryResult)
      
      if (result.length === 0) {
        return null
      }
      
      const row = result[0]
      return {
        id: row.id,
        name: row.name,
        subject: row.subject,
        content: row.content,
        html_content: row.html_content,
        text_content: row.text_content,
        template_id: row.template_id,
        status: row.status,
        scheduled_at: row.scheduled_at,
        sent_at: row.sent_at,
        recipient_count: parseInt(row.recipient_count || '0'),
        open_count: parseInt(row.open_count || '0'),
        click_count: parseInt(row.click_count || '0'),
        bounce_count: parseInt(row.bounce_count || '0'),
        unsubscribe_count: parseInt(row.unsubscribe_count || '0'),
        created_at: row.created_at,
        updated_at: row.updated_at,
        created_by: row.created_by,
        tags: row.tags,
        segment_id: row.segment_id
      } as NewsletterCampaign
    } catch (error) {
      console.error("Failed to update campaign:", error)
      return null
    }
  }
  
  async deleteCampaign(id: string): Promise<boolean> {
    try {
      const queryResult = await sql`DELETE FROM newsletter_campaigns WHERE id = ${id} RETURNING id`
      const result = sqlToArray<any>(queryResult)
      return result.length > 0
    } catch (error) {
      console.error("Failed to delete campaign:", error)
      return false
    }
  }
  
  // Template management
  async getTemplates(activeOnly = true): Promise<NewsletterTemplate[]> {
    try {
      let queryResult
      
      if (activeOnly) {
        queryResult = await sql`
          SELECT id, name, subject, content, html_content, is_active, created_at, updated_at, created_by
          FROM newsletter_templates
          WHERE is_active = true
          ORDER BY name ASC
        `
      } else {
        queryResult = await sql`
          SELECT id, name, subject, content, html_content, is_active, created_at, updated_at, created_by
          FROM newsletter_templates
          ORDER BY name ASC
        `
      }
      
      const result = sqlToArray<any>(queryResult)
      return result.map(row => ({
        id: row.id,
        name: row.name,
        subject: row.subject,
        content: row.content,
        html_content: row.html_content,
        is_active: row.is_active,
        created_at: row.created_at,
        updated_at: row.updated_at,
        created_by: row.created_by
      })) as NewsletterTemplate[]
    } catch (error) {
      console.error("Failed to get templates:", error)
      throw new Error("Failed to fetch templates")
    }
  }
  
  async getTemplate(id: string): Promise<NewsletterTemplate | null> {
    try {
      const queryResult = await sql`
        SELECT id, name, subject, content, html_content, is_active, created_at, updated_at, created_by
        FROM newsletter_templates
        WHERE id = ${id}
      `
      const result = sqlToArray<any>(queryResult)
      
      if (result.length === 0) {
        return null
      }
      
      const row = result[0]
      return {
        id: row.id,
        name: row.name,
        subject: row.subject,
        content: row.content,
        html_content: row.html_content,
        is_active: row.is_active,
        created_at: row.created_at,
        updated_at: row.updated_at,
        created_by: row.created_by
      } as NewsletterTemplate
    } catch (error) {
      console.error("Failed to get template:", error)
      return null
    }
  }

  async createTemplate(templateData: Partial<NewsletterTemplate>): Promise<NewsletterTemplate> {
    try {
      const queryResult = await sql`
        INSERT INTO newsletter_templates (name, subject, content, html_content, is_active, created_by)
        VALUES (
          ${templateData.name || 'Untitled Template'}, 
          ${templateData.subject || ''}, 
          ${templateData.content || ''}, 
          ${templateData.html_content || ''}, 
          ${templateData.is_active ?? true},
          ${templateData.created_by || 'system'}
        )
        RETURNING id, name, subject, content, html_content, is_active, created_at, updated_at, created_by
      `
      const result = sqlToArray<any>(queryResult)
      
      const row = result[0]
      return {
        id: row.id,
        name: row.name,
        subject: row.subject,
        content: row.content,
        html_content: row.html_content,
        is_active: row.is_active,
        created_at: row.created_at,
        updated_at: row.updated_at,
        created_by: row.created_by
      } as NewsletterTemplate
    } catch (error) {
      console.error("Failed to create template:", error)
      throw new Error("Failed to create template")
    }
  }
  
  async updateTemplate(id: string, templateData: Partial<NewsletterTemplate>): Promise<NewsletterTemplate | null> {
    try {
      // Vytvoříme části SQL dotazu jen pro pole, která jsou poskytnuta
      let updateFields = []
      
      if (templateData.name !== undefined) updateFields.push(`name = ${templateData.name}`)
      if (templateData.subject !== undefined) updateFields.push(`subject = ${templateData.subject}`)
      if (templateData.content !== undefined) updateFields.push(`content = ${templateData.content}`)
      if (templateData.html_content !== undefined) updateFields.push(`html_content = ${templateData.html_content}`)
      if (templateData.is_active !== undefined) updateFields.push(`is_active = ${templateData.is_active}`)
      
      // Pokud nejsou žádná pole k aktualizaci, vrátíme původní šablonu
      if (updateFields.length === 0) {
        return this.getTemplate(id)
      }
      
      // Přidáme updated_at
      updateFields.push(`updated_at = NOW()`)
      
      // Sestavíme a spustíme dotaz
      const updateQuery = `
        UPDATE newsletter_templates 
        SET ${updateFields.join(', ')}
        WHERE id = '${id}'
        RETURNING id, name, subject, content, html_content, is_active, created_at, updated_at, created_by
      `
      
      const queryResult = await sql.raw(updateQuery)
      const result = sqlToArray<any>(queryResult)
      
      if (result.length === 0) {
        return null
      }
      
      const row = result[0]
      return {
        id: row.id,
        name: row.name,
        subject: row.subject,
        content: row.content,
        html_content: row.html_content,
        is_active: row.is_active,
        created_at: row.created_at,
        updated_at: row.updated_at,
        created_by: row.created_by
      } as NewsletterTemplate
    } catch (error) {
      console.error("Failed to update template:", error)
      return null
    }
  }
  
  async deleteTemplate(id: string): Promise<boolean> {
    try {
      const queryResult = await sql`DELETE FROM newsletter_templates WHERE id = ${id} RETURNING id`
      const result = sqlToArray<any>(queryResult)
      return result.length > 0
    } catch (error) {
      console.error("Failed to delete template:", error)
      return false
    }
  }

  // Singleton instance
  private static instance: NewsletterService

  static getInstance(): NewsletterService {
    if (!NewsletterService.instance) {
      NewsletterService.instance = new NewsletterService()
    }
    return NewsletterService.instance
  }
}

// Export instance služby
export const newsletterService = NewsletterService.getInstance()
