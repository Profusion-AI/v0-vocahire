-- Manual Performance Optimization Migration
-- Run this script in Supabase SQL Editor

-- Add composite indexes for User table
CREATE INDEX IF NOT EXISTS "User_isPremium_credits_idx" ON "User" ("isPremium", "credits");
CREATE INDEX IF NOT EXISTS "User_role_idx" ON "User" ("role");
CREATE INDEX IF NOT EXISTS "User_createdAt_idx" ON "User" ("createdAt");

-- Add composite indexes for InterviewSession table
CREATE INDEX IF NOT EXISTS "InterviewSession_userId_createdAt_idx" ON "InterviewSession" ("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "InterviewSession_jobTitle_idx" ON "InterviewSession" ("jobTitle");
CREATE INDEX IF NOT EXISTS "InterviewSession_startedAt_idx" ON "InterviewSession" ("startedAt");

-- Add index for Transcript table
CREATE INDEX IF NOT EXISTS "Transcript_sessionId_idx" ON "Transcript" ("sessionId");

-- Add indexes for Feedback table
CREATE INDEX IF NOT EXISTS "Feedback_sessionId_idx" ON "Feedback" ("sessionId");
CREATE INDEX IF NOT EXISTS "Feedback_createdAt_idx" ON "Feedback" ("createdAt");

-- Note: Text field optimizations and JSONB conversions are already handled by Prisma's column type definitions
-- The @db.Text and @db.JsonB annotations in schema.prisma will be applied on next deployment

-- Analyze tables to update statistics after adding indexes
ANALYZE "User";
ANALYZE "InterviewSession";
ANALYZE "Transcript";
ANALYZE "Feedback";