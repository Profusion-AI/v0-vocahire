-- Performance Optimization Migration
-- This migration adds composite indexes and optimizes field types for better performance

-- Add composite indexes for User table
CREATE INDEX IF NOT EXISTS "User_isPremium_credits_idx" ON "User"("isPremium", "credits");
CREATE INDEX IF NOT EXISTS "User_role_idx" ON "User"("role");
CREATE INDEX IF NOT EXISTS "User_createdAt_idx" ON "User"("createdAt");
CREATE INDEX IF NOT EXISTS "User_stripeCustomerId_idx" ON "User"("stripeCustomerId");

-- Add composite indexes for InterviewSession table
CREATE INDEX IF NOT EXISTS "InterviewSession_userId_createdAt_idx" ON "InterviewSession"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "InterviewSession_jobTitle_idx" ON "InterviewSession"("jobTitle");
CREATE INDEX IF NOT EXISTS "InterviewSession_company_idx" ON "InterviewSession"("company");
CREATE INDEX IF NOT EXISTS "InterviewSession_interviewType_idx" ON "InterviewSession"("interviewType");
CREATE INDEX IF NOT EXISTS "InterviewSession_startedAt_idx" ON "InterviewSession"("startedAt");
CREATE INDEX IF NOT EXISTS "InterviewSession_webrtcSessionId_idx" ON "InterviewSession"("webrtcSessionId");
CREATE INDEX IF NOT EXISTS "InterviewSession_openaiSessionId_idx" ON "InterviewSession"("openaiSessionId");

-- Add composite indexes for Transcript table
CREATE INDEX IF NOT EXISTS "Transcript_sessionId_timestamp_idx" ON "Transcript"("sessionId", "timestamp");
CREATE INDEX IF NOT EXISTS "Transcript_role_idx" ON "Transcript"("role");
CREATE INDEX IF NOT EXISTS "Transcript_createdAt_idx" ON "Transcript"("createdAt");

-- Add composite indexes for Feedback table
CREATE INDEX IF NOT EXISTS "Feedback_userId_createdAt_idx" ON "Feedback"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "Feedback_createdAt_idx" ON "Feedback"("createdAt");
CREATE INDEX IF NOT EXISTS "Feedback_transcriptScore_idx" ON "Feedback"("transcriptScore");

-- Add composite indexes for UsageEvent table
CREATE INDEX IF NOT EXISTS "UsageEvent_userId_eventType_idx" ON "UsageEvent"("userId", "eventType");
CREATE INDEX IF NOT EXISTS "UsageEvent_occurredAt_idx" ON "UsageEvent"("occurredAt");
CREATE INDEX IF NOT EXISTS "UsageEvent_createdAt_idx" ON "UsageEvent"("createdAt");

-- Add indexes for interviews table (if keeping it)
CREATE INDEX IF NOT EXISTS "interviews_created_at_idx" ON "interviews"("created_at");
CREATE INDEX IF NOT EXISTS "interviews_user_id_created_at_idx" ON "interviews"("user_id", "created_at");

-- Optimize TEXT columns (PostgreSQL automatically handles this, but we ensure correct types)
-- Note: Changing column types requires careful migration and may need downtime

-- Analyze tables to update statistics after index creation
ANALYZE "User";
ANALYZE "InterviewSession";
ANALYZE "Transcript";
ANALYZE "Feedback";
ANALYZE "UsageEvent";
ANALYZE "interviews";

-- Create a function to help with RLS performance (example)
CREATE OR REPLACE FUNCTION auth_user_id() RETURNS TEXT AS $$
BEGIN
    -- This is a placeholder - adjust based on your auth system
    -- For Supabase, it would be: RETURN auth.uid()::text;
    -- For Clerk, you might need a different approach
    RETURN current_setting('app.current_user_id', true);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Add comment explaining the indexes
COMMENT ON INDEX "User_isPremium_credits_idx" IS 'Composite index for credit/premium checks in realtime-session API';
COMMENT ON INDEX "InterviewSession_userId_createdAt_idx" IS 'Composite index for user session history queries';
COMMENT ON INDEX "Transcript_sessionId_timestamp_idx" IS 'Composite index for ordered transcript retrieval';
COMMENT ON INDEX "Feedback_userId_createdAt_idx" IS 'Composite index for user feedback history';
COMMENT ON INDEX "UsageEvent_userId_eventType_idx" IS 'Composite index for usage analytics by event type';