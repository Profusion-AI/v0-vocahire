/*
  Warnings:

  - You are about to drop the column `clerkId` on the `InterviewSession` table. All the data in the column will be lost.
  - You are about to drop the column `feedbacks` on the `InterviewSession` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX IF EXISTS "Feedback_sessionId_key";

-- AlterTable
ALTER TABLE "Feedback" ADD COLUMN     "clarityScore" DOUBLE PRECISION,
ADD COLUMN     "concisenessScore" DOUBLE PRECISION,
ADD COLUMN     "enhancedFeedbackGenerated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "enhancedGeneratedAt" TIMESTAMP(3),
ADD COLUMN     "enhancedReportData" JSONB,
ADD COLUMN     "keywordRelevanceScore" DOUBLE PRECISION,
ADD COLUMN     "overallScore" DOUBLE PRECISION,
ADD COLUMN     "sentimentProgression" JSONB,
ADD COLUMN     "starMethodScore" DOUBLE PRECISION,
ADD COLUMN     "structuredData" JSONB,
ADD COLUMN     "technicalDepthScore" DOUBLE PRECISION,
ADD COLUMN     "toneAnalysis" JSONB;

-- AlterTable (only if columns exist)
ALTER TABLE "InterviewSession" 
DROP COLUMN IF EXISTS "clerkId",
DROP COLUMN IF EXISTS "feedbacks";

-- Update any NULL clerkId values before making it required
UPDATE "User" SET "clerkId" = id WHERE "clerkId" IS NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "clerkId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Feedback_enhancedFeedbackGenerated_idx" ON "Feedback"("enhancedFeedbackGenerated");
