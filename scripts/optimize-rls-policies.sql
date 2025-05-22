-- RLS Policy Optimization Script for VocaHire
-- This script analyzes and optimizes Row Level Security policies

-- 1. First, let's check current RLS policies on the interviews table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'interviews';

-- 2. Check if the interviews table is actively used
SELECT 
    COUNT(*) as total_records,
    COUNT(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN 1 END) as recent_records,
    COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END) as very_recent_records
FROM interviews;

-- 3. Analyze performance of queries on the interviews table
-- This will show if RLS is causing slowdowns
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM interviews 
WHERE user_id = 'sample-user-id-here' 
LIMIT 10;

-- 4. Create optimized RLS helper functions
-- These functions cache auth checks and reduce overhead

-- Function to get current user ID (adjust based on your auth system)
CREATE OR REPLACE FUNCTION auth_user_id() 
RETURNS TEXT 
LANGUAGE sql 
STABLE 
SECURITY DEFINER
AS $$
    -- For Supabase:
    -- SELECT auth.uid()::text;
    
    -- For Clerk (you may need to pass this from application):
    SELECT current_setting('app.current_user_id', true);
$$;

-- Function to check if user is premium (cached)
CREATE OR REPLACE FUNCTION is_user_premium(user_id TEXT) 
RETURNS BOOLEAN 
LANGUAGE plpgsql 
STABLE 
SECURITY DEFINER
AS $$
DECLARE
    premium_status BOOLEAN;
BEGIN
    SELECT "isPremium" INTO premium_status
    FROM "User"
    WHERE id = user_id;
    
    RETURN COALESCE(premium_status, FALSE);
END;
$$;

-- 5. Drop existing inefficient RLS policies (if any)
-- CAUTION: Only run these if you've identified problematic policies
-- DO $$
-- BEGIN
--     -- Example: DROP POLICY IF EXISTS "old_policy_name" ON interviews;
-- END $$;

-- 6. Create optimized RLS policies

-- Simple policy for SELECT (most performant)
CREATE POLICY "users_view_own_interviews" ON interviews
FOR SELECT
TO authenticated
USING (user_id::text = auth_user_id());

-- Policy for INSERT
CREATE POLICY "users_insert_own_interviews" ON interviews
FOR INSERT
TO authenticated
WITH CHECK (user_id::text = auth_user_id());

-- Policy for UPDATE
CREATE POLICY "users_update_own_interviews" ON interviews
FOR UPDATE
TO authenticated
USING (user_id::text = auth_user_id())
WITH CHECK (user_id::text = auth_user_id());

-- Policy for DELETE
CREATE POLICY "users_delete_own_interviews" ON interviews
FOR DELETE
TO authenticated
USING (user_id::text = auth_user_id());

-- 7. If you need more complex policies, use a security definer function
CREATE OR REPLACE FUNCTION can_access_interview(interview_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
    current_user_id TEXT;
    user_role TEXT;
BEGIN
    -- Get current user
    current_user_id := auth_user_id();
    
    -- User can access their own interviews
    IF interview_user_id::text = current_user_id THEN
        RETURN TRUE;
    END IF;
    
    -- Admins can access all interviews
    SELECT role INTO user_role
    FROM "User"
    WHERE id = current_user_id;
    
    IF user_role = 'ADMIN' THEN
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$;

-- Use the function in a policy
-- CREATE POLICY "complex_access_policy" ON interviews
-- FOR ALL
-- TO authenticated
-- USING (can_access_interview(user_id));

-- 8. Analyze the impact of the new policies
-- Run this after implementing new policies
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM interviews 
WHERE user_id = 'sample-user-id-here' 
LIMIT 10;

-- 9. Create monitoring view for RLS performance
CREATE OR REPLACE VIEW rls_performance_monitor AS
SELECT 
    n.nspname as schema_name,
    c.relname as table_name,
    pol.polname as policy_name,
    pol.polcmd as command,
    CASE pol.polcmd
        WHEN 'r' THEN 'SELECT'
        WHEN 'a' THEN 'INSERT'
        WHEN 'w' THEN 'UPDATE'
        WHEN 'd' THEN 'DELETE'
        ELSE 'OTHER'
    END as command_type,
    pg_get_expr(pol.polqual, pol.polrelid) as using_expression,
    pg_get_expr(pol.polwithcheck, pol.polrelid) as with_check_expression,
    pol.polpermissive as is_permissive
FROM pg_policy pol
JOIN pg_class c ON c.oid = pol.polrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
ORDER BY n.nspname, c.relname, pol.polname;

-- 10. Recommendations for application code
COMMENT ON TABLE interviews IS 'DEPRECATED: Consider migrating to InterviewSession+Transcript+Feedback tables for better performance and structure. If keeping this table, ensure RLS policies are optimized.';

-- 11. Alternative: Disable RLS and handle authorization in application
-- This is the most performant option if you can ensure security at the application level
-- ALTER TABLE interviews DISABLE ROW LEVEL SECURITY;

-- 12. Monitor slow queries caused by RLS
CREATE OR REPLACE VIEW slow_rls_queries AS
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    min_time,
    max_time,
    stddev_time
FROM pg_stat_statements
WHERE query LIKE '%interviews%'
AND mean_time > 100 -- queries averaging > 100ms
ORDER BY mean_time DESC
LIMIT 20;