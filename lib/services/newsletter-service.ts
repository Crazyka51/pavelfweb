import { PrismaClient } from '@prisma/client';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

// Re-export types from Prisma for external use if needed
export type { NewsletterSubscriber, NewsletterCampaign, NewsletterTemplate } from '@prisma/client';

export class NewsletterService {
  // Subscriber management
  async getSubscribers(activeOnly = true) {
    try {
      const whereClause = activeOnly ? { isActive: true } : {};
      return await prisma.newsletterSubscriber.findMany({
        where: whereClause,

        orderBy: {
          subscribedAt: 'desc',
        },
      });
    } catch (error) {
      console.error("Failed to get subscribers:", error);
      throw new Error("Failed to fetch subscribers");
    }
  }

  async subscribeEmail(email: string, source = "web") {
    try {
      const unsubscribeToken = randomBytes(16).toString('hex');
      return await prisma.newsletterSubscriber.upsert({
        where: { email },
        update: {

          isActive: true,
          subscribedAt: new Date(),
          unsubscribedAt: null,
        },
        create: {
          email,
          source,
          unsubscribeToken,
        },
      });
    } catch (error) {
      console.error("Failed to subscribe email:", error);
      throw new Error("Failed to subscribe email");
    }
  }

  async unsubscribeEmail(email: string) {
    try {
      const updated = await prisma.newsletterSubscriber.update({
        where: { email },
        data: {
          isActive: false,
          unsubscribedAt: new Date(),
        },
      });
      return !!updated;
    } catch (error) {
      console.error("Failed to unsubscribe email:", error);
      return false;
    }
  }

  async unsubscribeByToken(token: string) {
    try {
      const updated = await prisma.newsletterSubscriber.update({
        where: { unsubscribeToken: token },
        data: {

          isActive: false,
          unsubscribedAt: new Date(),
        },
      });
      return !!updated;
    } catch (error) {
      console.error("Failed to unsubscribe by token:", error);
      return false;
    }
  }

  async deleteSubscriber(id: string) {
    try {
      await prisma.newsletterSubscriber.delete({ where: { id } });
      return true;
    } catch (error) {
      console.error("Failed to delete subscriber:", error);
      return false;
    }
  }

  // Statistics
  async getSubscriberStats() {
    try {
      const total = await prisma.newsletterSubscriber.count();
      const active = await prisma.newsletterSubscriber.count({ where: { isActive: true } });
      const inactive = total - active;
      const recent = await prisma.newsletterSubscriber.count({
        where: {
          subscribedAt: {
            gte: new Date(new Date().setDate(new Date().getDate() - 30)),
          },
        },
      });
      return { total, active, inactive, recent };
    } catch (error) {
      console.error("Failed to get subscriber stats:", error);
      return { total: 0, active: 0, inactive: 0, recent: 0 };
    }
  }

  // Campaign management
  async getCampaigns() {
    try {
      return await prisma.newsletterCampaign.findMany({
        orderBy: {
          createdAt: 'desc',

        },
      });
    } catch (error) {
      console.error("Failed to get campaigns:", error);
      throw new Error("Failed to fetch campaigns");
    }
  }
  
  async getCampaign(id: string) {
    try {
      return await prisma.newsletterCampaign.findUnique({ where: { id } });
    } catch (error) {

      console.error("Failed to get campaign:", error);
      return null;
    }
  }
  
  async createCampaign(campaignData: any) {
    try {
      return await prisma.newsletterCampaign.create({
        data: {
            name: campaignData.name || 'Untitled Campaign',

            subject: campaignData.subject || '',
            content: campaignData.content || '',
            htmlContent: campaignData.htmlContent || '',
            textContent: campaignData.textContent,
            templateId: campaignData.templateId,
            status: campaignData.status || 'DRAFT',
            createdById: campaignData.createdById,
            tags: campaignData.tags || [],
            segmentId: campaignData.segmentId,
        }
      });
    } catch (error) {
      console.error("Failed to create campaign:", error);
      throw new Error("Failed to create campaign");
    }
  }
  
  async updateCampaign(id: string, campaignData: any) {
    try {
      return await prisma.newsletterCampaign.update({
        where: { id },
        data: campaignData,

      });
    } catch (error) {
      console.error("Failed to update campaign:", error);
      return null;
    }
  }
  
  async deleteCampaign(id: string) {
    try {
      await prisma.newsletterCampaign.delete({ where: { id } });
      return true;
    } catch (error) {

      console.error("Failed to delete campaign:", error);
      return false;
    }
  }
  
  // Template management
  async getTemplates(activeOnly = true) {
    try {
      const whereClause = activeOnly ? { isActive: true } : {};
      return await prisma.newsletterTemplate.findMany({
        where: whereClause,
        orderBy: {

          name: 'asc',
        },
      });
    } catch (error) {
      console.error("Failed to get templates:", error);
      throw new Error("Failed to fetch templates");
    }
  }
  
  async getTemplate(id: string) {
    try {
      return await prisma.newsletterTemplate.findUnique({ where: { id } });
    } catch (error) {

      console.error("Failed to get template:", error);
      return null;
    }
  }

  async createTemplate(templateData: any) {
    try {
      return await prisma.newsletterTemplate.create({
        data: {
          name: templateData.name || 'Untitled Template',

          subject: templateData.subject || '',
          content: templateData.content || '',
          htmlContent: templateData.htmlContent || '',
          isActive: templateData.isActive ?? true,
          createdById: templateData.createdById,
        },
      });
    } catch (error) {
      console.error("Failed to create template:", error);
      throw new Error("Failed to create template");
    }
  }
  
  async updateTemplate(id: string, templateData: any) {
    try {
      return await prisma.newsletterTemplate.update({
        where: { id },
        data: templateData,

      });
    } catch (error) {
      console.error("Failed to update template:", error);
      return null;
    }
  }
  
  async deleteTemplate(id: string) {
    try {
      await prisma.newsletterTemplate.delete({ where: { id } });
      return true;
    } catch (error) {

      console.error("Failed to delete template:", error);
      return false;
    }
  }

  // Singleton instance
  private static instance: NewsletterService;

  static getInstance(): NewsletterService {
    if (!NewsletterService.instance) {
      NewsletterService.instance = new NewsletterService();
    }
    return NewsletterService.instance;
  }
}

// Export instance of the service
export const newsletterService = NewsletterService.getInstance();
