-- CreateEnum
CREATE TYPE "public"."ArticleStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."CampaignStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'SENDING', 'SENT', 'FAILED');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT DEFAULT '#3B82F6',
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "parent_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Article" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "imageUrl" TEXT,
    "status" "public"."ArticleStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "authorId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "tags" TEXT[],
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."NewsletterCampaign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "content" TEXT,
    "htmlContent" TEXT NOT NULL,
    "textContent" TEXT,
    "status" "public"."CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "scheduledAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "recipientCount" INTEGER NOT NULL DEFAULT 0,
    "openCount" INTEGER NOT NULL DEFAULT 0,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "bounceCount" INTEGER NOT NULL DEFAULT 0,
    "unsubscribeCount" INTEGER NOT NULL DEFAULT 0,
    "createdById" TEXT,
    "templateId" TEXT,
    "tags" TEXT[],
    "segmentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewsletterCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."NewsletterSubscriber" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "source" TEXT,
    "unsubscribeToken" TEXT,
    "subscribedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unsubscribedAt" TIMESTAMP(3),

    CONSTRAINT "NewsletterSubscriber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."NewsletterTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "htmlContent" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewsletterTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."activity_log" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID,
    "action" VARCHAR(100) NOT NULL,
    "entity_type" VARCHAR(50) NOT NULL,
    "entity_id" UUID,
    "details" JSONB,
    "ip_address" INET,
    "user_agent" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."admin_users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "username" VARCHAR(50) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255),
    "role" VARCHAR(20) DEFAULT 'admin',
    "is_active" BOOLEAN DEFAULT true,
    "last_login" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."articles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "category" VARCHAR(100) NOT NULL,
    "tags" JSONB DEFAULT '[]',
    "published" BOOLEAN DEFAULT false,
    "image_url" TEXT,
    "published_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(100) DEFAULT 'admin',

    CONSTRAINT "articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."newsletter_campaigns" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "subject" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "html_content" TEXT NOT NULL,
    "text_content" TEXT,
    "template_id" UUID,
    "status" VARCHAR(20) DEFAULT 'draft',
    "scheduled_at" TIMESTAMPTZ(6),
    "sent_at" TIMESTAMPTZ(6),
    "recipient_count" INTEGER DEFAULT 0,
    "open_count" INTEGER DEFAULT 0,
    "click_count" INTEGER DEFAULT 0,
    "bounce_count" INTEGER DEFAULT 0,
    "unsubscribe_count" INTEGER DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(100) DEFAULT 'admin',
    "tags" JSONB DEFAULT '[]',
    "segment_id" UUID,

    CONSTRAINT "newsletter_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."newsletter_subscribers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" VARCHAR(255) NOT NULL,
    "is_active" BOOLEAN DEFAULT true,
    "source" VARCHAR(50) DEFAULT 'web',
    "unsubscribe_token" TEXT,
    "subscribed_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "unsubscribed_at" TIMESTAMPTZ(6),

    CONSTRAINT "newsletter_subscribers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."newsletter_templates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "subject" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "html_content" TEXT NOT NULL,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by" VARCHAR(100) DEFAULT 'admin',

    CONSTRAINT "newsletter_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "public"."Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "public"."Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Article_slug_key" ON "public"."Article"("slug");

-- CreateIndex
CREATE INDEX "NewsletterCampaign_createdById_idx" ON "public"."NewsletterCampaign"("createdById");

-- CreateIndex
CREATE INDEX "NewsletterCampaign_templateId_idx" ON "public"."NewsletterCampaign"("templateId");

-- CreateIndex
CREATE UNIQUE INDEX "NewsletterSubscriber_email_key" ON "public"."NewsletterSubscriber"("email");

-- CreateIndex
CREATE UNIQUE INDEX "NewsletterSubscriber_unsubscribeToken_key" ON "public"."NewsletterSubscriber"("unsubscribeToken");

-- CreateIndex
CREATE INDEX "NewsletterTemplate_createdById_idx" ON "public"."NewsletterTemplate"("createdById");

-- CreateIndex
CREATE INDEX "idx_activity_log_created_at" ON "public"."activity_log"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_activity_log_user_id" ON "public"."activity_log"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_username_key" ON "public"."admin_users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "articles_title_key" ON "public"."articles"("title");

-- CreateIndex
CREATE INDEX "idx_articles_category" ON "public"."articles"("category");

-- CreateIndex
CREATE INDEX "idx_articles_created_at" ON "public"."articles"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_articles_published" ON "public"."articles"("published", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_newsletter_campaigns_created_at" ON "public"."newsletter_campaigns"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_newsletter_campaigns_status" ON "public"."newsletter_campaigns"("status");

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_subscribers_email_key" ON "public"."newsletter_subscribers"("email");

-- CreateIndex
CREATE INDEX "idx_newsletter_subscribers_active" ON "public"."newsletter_subscribers"("is_active");

-- CreateIndex
CREATE INDEX "idx_newsletter_subscribers_email" ON "public"."newsletter_subscribers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_templates_name_key" ON "public"."newsletter_templates"("name");

-- AddForeignKey
ALTER TABLE "public"."Article" ADD CONSTRAINT "Article_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Article" ADD CONSTRAINT "Article_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NewsletterCampaign" ADD CONSTRAINT "NewsletterCampaign_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NewsletterCampaign" ADD CONSTRAINT "NewsletterCampaign_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."NewsletterTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NewsletterTemplate" ADD CONSTRAINT "NewsletterTemplate_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."activity_log" ADD CONSTRAINT "activity_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."admin_users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
