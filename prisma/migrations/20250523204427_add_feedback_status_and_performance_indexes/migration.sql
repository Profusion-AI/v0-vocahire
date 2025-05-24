-- AlterTable
ALTER TABLE "InterviewSession" ADD COLUMN "clerkId" TEXT;
ALTER TABLE "InterviewSession" ADD COLUMN "deletedAt" TIMESTAMP(3);
ALTER TABLE "InterviewSession" ADD COLUMN "duration" INTEGER;
ALTER TABLE "InterviewSession" ADD COLUMN "endTime" TIMESTAMP(3);
ALTER TABLE "InterviewSession" ADD COLUMN "feedbackStatus" TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE "InterviewSession" ADD COLUMN "feedbacks" TEXT;
ALTER TABLE "InterviewSession" ADD COLUMN "metadata" JSONB;
ALTER TABLE "InterviewSession" ADD COLUMN "resumeData" JSONB;
ALTER TABLE "InterviewSession" ADD COLUMN "startTime" TIMESTAMP(3);
ALTER TABLE "InterviewSession" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE "Transcript" ADD COLUMN "metadata" JSONB;
ALTER TABLE "Transcript" ADD COLUMN "sequenceNumber" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "User" ADD COLUMN "clerkId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");

-- CreateIndex
CREATE INDEX "User_clerkId_idx" ON "User"("clerkId");

-- CreateIndex
CREATE INDEX "InterviewSession_userId_status_createdAt_idx" ON "InterviewSession"("userId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "Transcript_sessionId_sequenceNumber_idx" ON "Transcript"("sessionId", "sequenceNumber");

-- CreateIndex
CREATE INDEX "Transcript_sessionId_role_idx" ON "Transcript"("sessionId", "role");

-- CreateIndex
CREATE INDEX "Feedback_sessionId_idx" ON "Feedback"("sessionId");