# Prisma Schema Performance Optimization Guide

## Overview
This guide helps migrate from the current schema to an optimized version that addresses 503/504 timeout errors.

## Key Performance Issues Identified

### 1. Missing Composite Indexes
The application frequently queries users by multiple criteria (e.g., `isPremium` + `credits`), but only single-column indexes exist.

### 2. Large Text Fields Without Optimization
Fields storing large content (resume data, transcripts, feedback) use regular `String` type instead of `Text` with proper database optimization.

### 3. JSON Fields Not Using JSONB
PostgreSQL's JSONB type offers better performance for JSON queries compared to regular JSON.

### 4. Legacy `interviews` Table with RLS
This table appears redundant and has Row Level Security (RLS) policies that could be causing performance issues.

## Migration Steps

### Step 1: Backup Your Database
```bash
# Create a backup before making changes
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Step 2: Update Prisma Schema
Replace your current `schema.prisma` with the optimized version:

```bash
cp prisma/schema-optimized.prisma prisma/schema.prisma
```

### Step 3: Generate Migration
```bash
npx prisma migrate dev --name add_performance_indexes
```

### Step 4: Optimize RLS Policies

Check current RLS policies on the `interviews` table:

```sql
-- Connect to your Supabase SQL Editor and run:
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
```

### Step 5: Optimize RLS Policies

```sql
-- Example of optimizing a slow RLS policy
-- BAD: Complex joins in RLS
CREATE POLICY "Users can view own interviews" ON interviews
FOR SELECT USING (
    user_id IN (
        SELECT id FROM users 
        WHERE email = current_user_email() 
        AND role = 'USER' 
        AND isPremium = true
    )
);

-- GOOD: Simple, direct check
CREATE POLICY "Users can view own interviews" ON interviews
FOR SELECT USING (user_id = auth.uid());

-- If you need more complex checks, use a security definer function:
CREATE OR REPLACE FUNCTION can_access_interview(interview_user_id uuid)
RETURNS boolean AS $$
BEGIN
    -- Your complex logic here, but executed once
    RETURN interview_user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "Users can view own interviews" ON interviews
FOR SELECT USING (can_access_interview(user_id));
```

### Step 6: Analyze Query Performance

```sql
-- Enable query logging for slow queries
ALTER DATABASE your_database SET log_min_duration_statement = 1000; -- Log queries > 1s

-- Check for missing indexes
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    most_common_vals
FROM pg_stats 
WHERE tablename IN ('User', 'InterviewSession', 'Transcript', 'Feedback')
AND n_distinct > 100;

-- Find slow queries
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    min_time,
    max_time
FROM pg_stat_statements
WHERE mean_time > 100 -- queries averaging > 100ms
ORDER BY mean_time DESC
LIMIT 20;
```

### Step 7: Consider Removing the Legacy `interviews` Table

If the `interviews` table is not actively used:

```sql
-- First, verify it's not being used
SELECT COUNT(*) FROM interviews WHERE created_at > NOW() - INTERVAL '7 days';

-- If safe to remove, drop it
DROP TABLE IF EXISTS interviews CASCADE;
```

If you must keep it, ensure RLS policies are optimized as shown above.

## Performance Monitoring

### 1. Set Up Database Monitoring
```sql
-- Create a monitoring view
CREATE VIEW performance_metrics AS
SELECT 
    'index_usage' as metric_type,
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
UNION ALL
SELECT 
    'table_stats' as metric_type,
    schemaname,
    tablename,
    NULL as indexname,
    seq_scan,
    seq_tup_read,
    n_tup_ins + n_tup_upd + n_tup_del as total_changes
FROM pg_stat_user_tables;
```

### 2. Regular Maintenance
```sql
-- Run VACUUM and ANALYZE regularly
VACUUM ANALYZE;

-- Reindex if needed
REINDEX DATABASE your_database;
```

## Application Code Optimizations

### 1. Use Field Selection
```typescript
// BAD: Fetches all fields including large text
const user = await prisma.user.findUnique({
  where: { id: userId }
});

// GOOD: Only fetch needed fields
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: {
    id: true,
    email: true,
    credits: true,
    isPremium: true,
    // Don't fetch large resume fields unless needed
  }
});
```

### 2. Use Proper Pagination
```typescript
// BAD: Fetches all records
const sessions = await prisma.interviewSession.findMany({
  where: { userId }
});

// GOOD: Paginate results
const sessions = await prisma.interviewSession.findMany({
  where: { userId },
  take: 10,
  skip: page * 10,
  orderBy: { createdAt: 'desc' }
});
```

### 3. Batch Operations
```typescript
// BAD: Multiple queries
await prisma.user.update({ where: { id }, data: { credits: { decrement: 1 } } });
await prisma.usageEvent.create({ data: { userId, eventType: 'interview_start' } });

// GOOD: Use transactions
await prisma.$transaction([
  prisma.user.update({ where: { id }, data: { credits: { decrement: 1 } } }),
  prisma.usageEvent.create({ data: { userId, eventType: 'interview_start' } })
]);
```

## Expected Performance Improvements

1. **Composite Indexes**: 50-80% faster queries for multi-column WHERE clauses
2. **JSONB Fields**: 20-30% faster JSON queries
3. **Text Optimization**: Better memory usage for large text fields
4. **RLS Optimization**: Can improve query performance by 10x or more
5. **Overall**: Should eliminate most 503/504 timeout errors

## Rollback Plan

If issues arise:

```bash
# Rollback to previous migration
npx prisma migrate resolve --rolled-back add_performance_indexes

# Or restore from backup
psql $DATABASE_URL < backup_YYYYMMDD_HHMMSS.sql
```

## Next Steps

1. Test in development environment first
2. Run migration during low-traffic period
3. Monitor performance metrics after deployment
4. Consider implementing read replicas for heavy read workloads
5. Set up alerts for slow queries

## Additional Resources

- [Prisma Performance Guide](https://www.prisma.io/docs/guides/performance-and-optimization)
- [PostgreSQL Index Types](https://www.postgresql.org/docs/current/indexes-types.html)
- [Supabase RLS Performance](https://supabase.com/docs/guides/auth/row-level-security#performance-considerations)