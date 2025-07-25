import { sql } from "@/lib/database"
import type { NewsletterSubscriber, NewsletterCampaign, NewsletterTemplate } from "@/lib/types"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"

export class NewsletterService {
  async getAllSubscribers(): Promise<NewsletterSubscriber[]> {
    try {
      const subscribers = await sql<
        NewsletterSubscriber[]
      >`SELECT * FROM newsletter_subscribers ORDER BY subscribed_at DESC;`
      return subscribers
    } catch (error) {
      console.error("Error fetching all subscribers:", error)
      throw new Error("Failed to fetch subscribers.")
    }
  }

  async getSubscriberByEmail(email: string): Promise<NewsletterSubscriber | null> {
    try {
      const [subscriber] = await sql<
        NewsletterSubscriber[]
      >`SELECT * FROM newsletter_subscribers WHERE email = ${email};`
      return subscriber || null
    } catch (error) {
      console.error(`Error fetching subscriber with email ${email}:`, error)
      throw new Error(`Failed to fetch subscriber with email ${email}.`)
    }
  }

  async addSubscriber(email: string, source?: string): Promise<NewsletterSubscriber> {
    try {
      const [newSubscriber] = await sql<NewsletterSubscriber[]>`
        INSERT INTO newsletter_subscribers (email, is_active, source)
        VALUES (${email}, TRUE, ${source || null})
        ON CONFLICT (email) DO UPDATE SET is_active = TRUE, updated_at = NOW()
        RETURNING *;
      `
      return newSubscriber
    } catch (error) {
      console.error("Error adding subscriber:", error)
      throw new Error("Failed to add subscriber.")
    }
  }

  async unsubscribeSubscriber(email: string): Promise<boolean> {
    try {
      const result =
        await sql`UPDATE newsletter_subscribers SET is_active = FALSE, updated_at = NOW() WHERE email = ${email};`
      return result.count > 0
    } catch (error) {
      console.error(`Error unsubscribing subscriber with email ${email}:`, error)
      throw new Error(`Failed to unsubscribe subscriber with email ${email}.`)
    }
  }

  async deleteSubscriber(id: string): Promise<boolean> {
    try {
      const result = await sql`DELETE FROM newsletter_subscribers WHERE id = ${id};`
      return result.count > 0
    } catch (error) {
      console.error(`Error deleting subscriber with ID ${id}:`, error)
      throw new Error(`Failed to delete subscriber with ID ${id}.`)
    }
  }

  async bulkDeleteSubscribers(ids: string[]): Promise<number> {
    try {
      const result = await sql`DELETE FROM newsletter_subscribers WHERE id IN (${sql.array(ids)});`
      return result.count
    } catch (error) {
      console.error("Error bulk deleting subscribers:", error)
      throw new Error("Failed to bulk delete subscribers.")
    }
  }

  async bulkUpdateSubscriberStatus(ids: string[], isActive: boolean): Promise<number> {
    try {
      const result = await sql`
        UPDATE newsletter_subscribers
        SET is_active = ${isActive}, updated_at = NOW()
        WHERE id IN (${sql.array(ids)});
      `
      return result.count
    } catch (error) {
      console.error(`Error bulk updating subscriber status to ${isActive}:`, error)
      throw new Error(`Failed to bulk update subscriber status to ${isActive}.`)
    }
  }

  async getAllCampaigns(): Promise<NewsletterCampaign[]> {
    try {
      const campaigns = await sql<NewsletterCampaign[]>`SELECT * FROM newsletter_campaigns ORDER BY created_at DESC;`
      return campaigns
    } catch (error) {
      console.error("Error fetching all campaigns:", error)
      throw new Error("Failed to fetch campaigns.")
    }
  }

  async getCampaignById(id: string): Promise<NewsletterCampaign | null> {
    try {
      const [campaign] = await sql<NewsletterCampaign[]>`SELECT * FROM newsletter_campaigns WHERE id = ${id};`
      return campaign || null
    } catch (error) {
      console.error(`Error fetching campaign with ID ${id}:`, error)
      throw new Error(`Failed to fetch campaign with ID ${id}.`)
    }
  }

  async createCampaign(
    campaignData: Omit<NewsletterCampaign, "id" | "created_at" | "updated_at" | "sent_at" | "status">,
  ): Promise<NewsletterCampaign> {
    try {
      const [newCampaign] = await sql<NewsletterCampaign[]>`
        INSERT INTO newsletter_campaigns (subject, html_content, plain_text_content, scheduled_at, template_id, status)
        VALUES (${campaignData.subject}, ${campaignData.html_content}, ${campaignData.plain_text_content}, ${campaignData.scheduled_at}, ${campaignData.template_id}, 'draft')
        RETURNING *;
      `
      return newCampaign
    } catch (error) {
      console.error("Error creating campaign:", error)
      throw new Error("Failed to create campaign.")
    }
  }

  async updateCampaign(
    id: string,
    campaignData: Partial<Omit<NewsletterCampaign, "id" | "created_at" | "updated_at">>,
  ): Promise<NewsletterCampaign | null> {
    try {
      const [updatedCampaign] = await sql<NewsletterCampaign[]>`
        UPDATE newsletter_campaigns
        SET
          subject = COALESCE(${campaignData.subject}, subject),
          html_content = COALESCE(${campaignData.html_content}, html_content),
          plain_text_content = COALESCE(${campaignData.plain_text_content}, plain_text_content),
          scheduled_at = COALESCE(${campaignData.scheduled_at}, scheduled_at),
          sent_at = COALESCE(${campaignData.sent_at}, sent_at),
          status = COALESCE(${campaignData.status}, status),
          template_id = COALESCE(${campaignData.template_id}, template_id),
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *;
      `
      return updatedCampaign || null
    } catch (error) {
      console.error(`Error updating campaign with ID ${id}:`, error)
      throw new Error(`Failed to update campaign with ID ${id}.`)
    }
  }

  async deleteCampaign(id: string): Promise<boolean> {
    try {
      const result = await sql`DELETE FROM newsletter_campaigns WHERE id = ${id};`
      return result.count > 0
    } catch (error) {
      console.error(`Error deleting campaign with ID ${id}:`, error)
      throw new Error(`Failed to delete campaign with ID ${id}.`)
    }
  }

  async sendCampaign(campaignId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const campaign = await this.getCampaignById(campaignId)
      if (!campaign) {
        return { success: false, message: "Campaign not found." }
      }

      const activeSubscribers = await sql<
        NewsletterSubscriber[]
      >`SELECT email FROM newsletter_subscribers WHERE is_active = TRUE;`
      const recipientEmails = activeSubscribers.map((s) => s.email)

      if (recipientEmails.length === 0) {
        await this.updateCampaign(campaignId, { status: "failed", sent_at: new Date() })
        return { success: false, message: "No active subscribers to send to." }
      }

      const { data, error } = await resend.emails.send({
        from: RESEND_FROM_EMAIL,
        to: recipientEmails,
        subject: campaign.subject,
        html: campaign.html_content,
        text: campaign.plain_text_content,
      })

      if (error) {
        console.error("Error sending campaign via Resend:", error)
        await this.updateCampaign(campaignId, { status: "failed", sent_at: new Date() })
        return { success: false, message: `Failed to send emails: ${error.message}` }
      }

      await this.updateCampaign(campaignId, { status: "sent", sent_at: new Date() })
      return { success: true, message: `Campaign sent successfully to ${recipientEmails.length} subscribers.` }
    } catch (error) {
      console.error(`Error sending campaign ${campaignId}:`, error)
      await this.updateCampaign(campaignId, { status: "failed", sent_at: new Date() })
      throw new Error(`Failed to send campaign ${campaignId}.`)
    }
  }

  async getAllTemplates(): Promise<NewsletterTemplate[]> {
    try {
      const templates = await sql<NewsletterTemplate[]>`SELECT * FROM newsletter_templates ORDER BY name ASC;`
      return templates
    } catch (error) {
      console.error("Error fetching all templates:", error)
      throw new Error("Failed to fetch templates.")
    }
  }

  async getTemplateById(id: string): Promise<NewsletterTemplate | null> {
    try {
      const [template] = await sql<NewsletterTemplate[]>`SELECT * FROM newsletter_templates WHERE id = ${id};`
      return template || null
    } catch (error) {
      console.error(`Error fetching template with ID ${id}:`, error)
      throw new Error(`Failed to fetch template with ID ${id}.`)
    }
  }

  async createTemplate(
    templateData: Omit<NewsletterTemplate, "id" | "created_at" | "updated_at">,
  ): Promise<NewsletterTemplate> {
    try {
      const [newTemplate] = await sql<NewsletterTemplate[]>`
        INSERT INTO newsletter_templates (name, html_content, plain_text_content)
        VALUES (${templateData.name}, ${templateData.html_content}, ${templateData.plain_text_content})
        RETURNING *;
      `
      return newTemplate
    } catch (error) {
      console.error("Error creating template:", error)
      throw new Error("Failed to create template.")
    }
  }

  async updateTemplate(
    id: string,
    templateData: Partial<Omit<NewsletterTemplate, "id" | "created_at" | "updated_at">>,
  ): Promise<NewsletterTemplate | null> {
    try {
      const [updatedTemplate] = await sql<NewsletterTemplate[]>`
        UPDATE newsletter_templates
        SET
          name = COALESCE(${templateData.name}, name),
          html_content = COALESCE(${templateData.html_content}, html_content),
          plain_text_content = COALESCE(${templateData.plain_text_content}, plain_text_content),
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *;
      `
      return updatedTemplate || null
    } catch (error) {
      console.error(`Error updating template with ID ${id}:`, error)
      throw new Error(`Failed to update template with ID ${id}.`)
    }
  }

  async deleteTemplate(id: string): Promise<boolean> {
    try {
      const result = await sql`DELETE FROM newsletter_templates WHERE id = ${id};`
      return result.count > 0
    } catch (error) {
      console.error(`Error deleting template with ID ${id}:`, error)
      throw new Error(`Failed to delete template with ID ${id}.`)
    }
  }
}

export const newsletterService = new NewsletterService()
