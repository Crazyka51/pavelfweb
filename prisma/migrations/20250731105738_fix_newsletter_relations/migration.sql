-- CreateIndex
CREATE INDEX "NewsletterCampaign_createdById_idx" ON "public"."NewsletterCampaign"("createdById");

-- CreateIndex
CREATE INDEX "NewsletterTemplate_createdById_idx" ON "public"."NewsletterTemplate"("createdById");

-- AddForeignKey
ALTER TABLE "public"."NewsletterCampaign" ADD CONSTRAINT "NewsletterCampaign_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NewsletterTemplate" ADD CONSTRAINT "NewsletterTemplate_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
