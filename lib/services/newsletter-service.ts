import { sql } from "../database"
import type { NewsletterSubscriber, NewsletterCampaign, NewsletterTemplate } from "@/lib/types"

export class NewsletterService {
  async getSubscribers(activeOnly = true): Promise<NewsletterSubscriber[]> {
    try {
      if (activeOnly) {
        const result = (await sql(`
          SELECT id, email, is_active, source, unsubscribe_token, subscribed_at, unsubscribed_at
          FROM newsletter_subscribers
          WHERE is_active = true
          ORDER BY subscribed_at DESC
        `)) as NewsletterSubscriber[]
        return result
      } else {
        const result = (await sql(`
          SELECT id, email, is_active, source, unsubscribe_token, subscribed_at, unsubscribed_at
          FROM newsletter_subscribers
          ORDER BY subscribed_at DESC
        `)) as NewsletterSubscriber[]
        return result
      }
    } catch (error) {
      console.error("Failed to get subscribers:", error)
      throw new Error("Failed to fetch subscribers")
    }
  }

  async subscribeEmail(email: string, source = "web"): Promise<NewsletterSubscriber> {
    try {
      const unsubscribeToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

      const result = (await sql(
        `
        INSERT INTO newsletter_subscribers (email, source, unsubscribe_token)
        VALUES ($1, $2, $3)
        ON CONFLICT (email) 
        DO UPDATE SET 
          is_active = true,
          subscribed_at = NOW(),
          unsubscribed_at = NULL
        RETURNING id, email, is_active, source, unsubscribe_token, subscribed_at, unsubscribed_at
      `,
        [email, source, unsubscribeToken],
      )) as NewsletterSubscriber[]

      return result[0]
    } catch (error) {
      console.error("Failed to subscribe email:", error)
      throw error
    }
  }

  async unsubscribeEmail(email: string): Promise<boolean> {
    try {
      const result = await sql(
        `
        UPDATE newsletter_subscribers 
        SET is_active = false, unsubscribed_at = NOW()
        WHERE email = $1
        RETURNING id
      `,
        [email],
      )

      return result.length > 0
    } catch (error) {
      console.error("Failed to unsubscribe email:", error)
      return false
    }
  }

  async deleteSubscriber(id: string): Promise<boolean> {
    try {
      const result = await sql(`DELETE FROM newsletter_subscribers WHERE id = $1 RETURNING id`, [id])
      return result.length > 0
    } catch (error) {
      console.error("Failed to delete subscriber:", error)
      return false
    }
  }

  async getCampaigns(): Promise<NewsletterCampaign[]> {
    try {
      const result = (await sql(`
        SELECT id, name, subject, content, html_content, text_content, template_id,
               status, scheduled_at, sent_at, recipient_count, open_count, click_count,
               bounce_count, unsubscribe_count, created_at, updated_at, created_by, tags, segment_id
        FROM newsletter_campaigns
        ORDER BY created_at DESC
      `)) as NewsletterCampaign[]

      return result
    } catch (error) {
      console.error("Failed to get campaigns:", error)
      throw new Error("Failed to fetch campaigns")
    }
  }

  async getCampaignById(id: string): Promise<NewsletterCampaign | null> {
    try {
      const result = (await sql(
        `
        SELECT id, name, subject, content, html_content, text_content, template_id,
               status, scheduled_at, sent_at, recipient_count, open_count, click_count,
               bounce_count, unsubscribe_count, created_at, updated_at, created_by, tags, segment_id
        FROM newsletter_campaigns
        WHERE id = $1
      `,
        [id],
      )) as NewsletterCampaign[]

      return result.length > 0 ? result[0] : null
    } catch (error) {
      console.error("Failed to get campaign by ID:", error)
      return null
    }
  }

  async createCampaign(
    campaignData: Omit<
      NewsletterCampaign,
      | "id"
      | "created_at"
      | "updated_at"
      | "recipient_count"
      | "open_count"
      | "click_count"
      | "bounce_count"
      | "unsubscribe_count"
    >,
  ): Promise<NewsletterCampaign> {
    try {
      const result = (await sql(
        `
        INSERT INTO newsletter_campaigns (
          name, subject, content, html_content, text_content, template_id,
          status, scheduled_at, created_by, tags, segment_id
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
        )
        RETURNING id, name, subject, content, html_content, text_content, template_id,
                  status, scheduled_at, sent_at, recipient_count, open_count, click_count,
                  bounce_count, unsubscribe_count, created_at, updated_at, created_by, tags, segment_id
      `,
        [
          campaignData.name,
          campaignData.subject,
          campaignData.content,
          campaignData.html_content,
          campaignData.text_content || null,
          campaignData.template_id || null,
          campaignData.status,
          campaignData.scheduled_at || null,
          campaignData.created_by,
          JSON.stringify(campaignData.tags || []),
          campaignData.segment_id || null,
        ],
      )) as NewsletterCampaign[]

      return result[0]
    } catch (error) {
      console.error("Failed to create campaign:", error)
      throw new Error("Failed to create campaign")
    }
  }

  async updateCampaign(
    id: string,
    updates: Partial<Omit<NewsletterCampaign, "id" | "created_at">>,
  ): Promise<NewsletterCampaign | null> {
    try {
      const setParts: string[] = []
      const params: any[] = []
      let p = 1

      if (updates.name !== undefined) {
        setParts.push(`name = $${p++}`)
        params.push(updates.name)
      }
      if (updates.subject !== undefined) {
        setParts.push(`subject = $${p++}`)
        params.push(updates.subject)
      }
      if (updates.content !== undefined) {
        setParts.push(`content = $${p++}`)
        params.push(updates.content)
      }
      if (updates.html_content !== undefined) {
        setParts.push(`html_content = $${p++}`)
        params.push(updates.html_content)
      }
      if (updates.text_content !== undefined) {
        setParts.push(`text_content = $${p++}`)
        params.push(updates.text_content)
      }
      if (updates.status !== undefined) {
        setParts.push(`status = $${p++}`)
        params.push(updates.status)
      }
      if (updates.scheduled_at !== undefined) {
        setParts.push(`scheduled_at = $${p++}`)
        params.push(updates.scheduled_at)
      }
      if (updates.sent_at !== undefined) {
        setParts.push(`sent_at = $${p++}`)
        params.push(updates.sent_at)
      }
      if (updates.recipient_count !== undefined) {
        setParts.push(`recipient_count = $${p++}`)
        params.push(updates.recipient_count)
      }
      if (updates.open_count !== undefined) {
        setParts.push(`open_count = $${p++}`)
        params.push(updates.open_count)
      }
      if (updates.click_count !== undefined) {
        setParts.push(`click_count = $${p++}`)
        params.push(updates.click_count)
      }
      if (updates.bounce_count !== undefined) {
        setParts.push(`bounce_count = $${p++}`)
        params.push(updates.bounce_count)
      }
      if (updates.unsubscribe_count !== undefined) {
        setParts.push(`unsubscribe_count = $${p++}`)
        params.push(updates.unsubscribe_count)
      }
      if (updates.tags !== undefined) {
        setParts.push(`tags = $${p++}`)
        params.push(JSON.stringify(updates.tags))
      }

      setParts.push(`updated_at = NOW()`)
      params.push(id)

      const query = `
        UPDATE newsletter_campaigns SET
          ${setParts.join(", ")}
        WHERE id = $${p}
        RETURNING id, name, subject, content, html_content, text_content, template_id,
                  status, scheduled_at, sent_at, recipient_count, open_count, click_count,
                  bounce_count, unsubscribe_count, created_at, updated_at, created_by, tags, segment_id
      `

      const result = (await sql(query, params)) as NewsletterCampaign[]
      return result.length > 0 ? result[0] : null
    } catch (error) {
      console.error("Failed to update campaign:", error)
      throw new Error("Failed to update campaign")
    }
  }

  async deleteCampaign(id: string): Promise<boolean> {
    try {
      const result = await sql(`DELETE FROM newsletter_campaigns WHERE id = $1 RETURNING id`, [id])
      return result.length > 0
    } catch (error) {
      console.error("Failed to delete campaign:", error)
      return false
    }
  }

  async getTemplates(): Promise<NewsletterTemplate[]> {
    try {
      const result = (await sql(`
        SELECT id, name, subject, content, html_content, is_active, created_at, updated_at, created_by
        FROM newsletter_templates
        WHERE is_active = true
        ORDER BY created_at DESC
      `)) as NewsletterTemplate[]

      return result
    } catch (error) {
      console.error("Failed to get templates:", error)
      throw new Error("Failed to fetch templates")
    }
  }

  async createTemplate(
    templateData: Omit<NewsletterTemplate, "id" | "created_at" | "updated_at">,
  ): Promise<NewsletterTemplate> {
    try {
      const result = (await sql(
        `
        INSERT INTO newsletter_templates (name, subject, content, html_content, is_active, created_by)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, name, subject, content, html_content, is_active, created_at, updated_at, created_by
      `,
        [
          templateData.name,
          templateData.subject,
          templateData.content,
          templateData.html_content,
          templateData.is_active,
          templateData.created_by,
        ],
      )) as NewsletterTemplate[]

      return result[0]
    } catch (error) {
      console.error("Failed to create template:", error)
      throw new Error("Failed to create template")
    }
  }

  async updateTemplate(
    id: string,
    updates: Partial<Omit<NewsletterTemplate, "id" | "created_at">>,
  ): Promise<NewsletterTemplate | null> {
    try {
      const setParts: string[] = []
      const params: any[] = []
      let p = 1

      if (updates.name !== undefined) {
        setParts.push(`name = $${p++}`)
        params.push(updates.name)
      }
      if (updates.subject !== undefined) {
        setParts.push(`subject = $${p++}`)
        params.push(updates.subject)
      }
      if (updates.content !== undefined) {
        setParts.push(`content = $${p++}`)
        params.push(updates.content)
      }
      if (updates.html_content !== undefined) {
        setParts.push(`html_content = $${p++}`)
        params.push(updates.html_content)
      }
      if (updates.is_active !== undefined) {
        setParts.push(`is_active = $${p++}`)
        params.push(updates.is_active)
      }

      setParts.push(`updated_at = NOW()`)
      params.push(id)

      const query = `
        UPDATE newsletter_templates SET
          ${setParts.join(", ")}
        WHERE id = $${p}
        RETURNING id, name, subject, content, html_content, is_active, created_at, updated_at, created_by
      `

      const result = (await sql(query, params)) as NewsletterTemplate[]
      return result.length > 0 ? result[0] : null
    } catch (error) {
      console.error("Failed to update template:", error)
      throw new Error("Failed to update template")
    }
  }

  async deleteTemplate(id: string): Promise<boolean> {
    try {
      const result = await sql(`DELETE FROM newsletter_templates WHERE id = $1 RETURNING id`, [id])
      return result.length > 0
    } catch (error) {
      console.error("Failed to delete template:", error)
      return false
    }
  }

  async getSubscriberStats(): Promise<{
    total: number
    active: number
    inactive: number
    recent: number
  }> {
    try {
      const totalResult = (await sql(`SELECT COUNT(*) as count FROM newsletter_subscribers`)) as { count: string }[]
      const activeResult = (await sql(
        `SELECT COUNT(*) as count FROM newsletter_subscribers WHERE is_active = true`,
      )) as { count: string }[]
      const inactiveResult = (await sql(
        `SELECT COUNT(*) as count FROM newsletter_subscribers WHERE is_active = false`,
      )) as { count: string }[]
      const recentResult = (await sql(`
        SELECT COUNT(*) as count FROM newsletter_subscribers 
        WHERE subscribed_at > NOW() - INTERVAL '30 days'
      `)) as { count: string }[]

      return {
        total: Number.parseInt(totalResult[0].count),
        active: Number.parseInt(activeResult[0].count),
        inactive: Number.parseInt(inactiveResult[0].count),
        recent: Number.parseInt(recentResult[0].count),
      }
    } catch (error) {
      console.error("Failed to get subscriber stats:", error)
      return { total: 0, active: 0, inactive: 0, recent: 0 }
    }
  }
}

export const newsletterService = new NewsletterService()

export async function getSubscribers(activeOnly = true): Promise<NewsletterSubscriber[]> {
  return newsletterService.getSubscribers(activeOnly)
}

export async function subscribeEmail(email: string, source = "web"): Promise<NewsletterSubscriber> {
  return newsletterService.subscribeEmail(email, source)
}

export async function unsubscribeEmail(email: string): Promise<boolean> {
  return newsletterService.unsubscribeEmail(email)
}

export async function deleteSubscriber(id: string): Promise<boolean> {
  return newsletterService.deleteSubscriber(id)
}

export async function getCampaigns(): Promise<NewsletterCampaign[]> {
  return newsletterService.getCampaigns()
}

export async function getCampaignById(id: string): Promise<NewsletterCampaign | null> {
  return newsletterService.getCampaignById(id)
}

export async function createCampaign(
  campaignData: Omit<
    NewsletterCampaign,
    | "id"
    | "created_at"
    | "updated_at"
    | "recipient_count"
    | "open_count"
    | "click_count"
    | "bounce_count"
    | "unsubscribe_count"
  >,
): Promise<NewsletterCampaign> {
  return newsletterService.createCampaign(campaignData)
}

export async function updateCampaign(
  id: string,
  updates: Partial<Omit<NewsletterCampaign, "id" | "created_at">>,
): Promise<NewsletterCampaign | null> {
  return newsletterService.updateCampaign(id, updates)
}

export async function deleteCampaign(id: string): Promise<boolean> {
  return newsletterService.deleteCampaign(id)
}

export async function getTemplates(): Promise<NewsletterTemplate[]> {
  return newsletterService.getTemplates()
}

export async function createTemplate(
  templateData: Omit<NewsletterTemplate, "id" | "created_at" | "updated_at">,
): Promise<NewsletterTemplate> {
  return newsletterService.createTemplate(templateData)
}

export async function updateTemplate(
  id: string,
  updates: Partial<Omit<NewsletterTemplate, "id" | "created_at">>,
): Promise<NewsletterTemplate | null> {
  return newsletterService.updateTemplate(id, updates)
}

export async function deleteTemplate(id: string): Promise<boolean> {
  return newsletterService.deleteTemplate(id)
}

export async function getSubscriberStats(): Promise<{
  total: number
  active: number
  inactive: number
  recent: number
}> {
  return newsletterService.getSubscriberStats()
}
