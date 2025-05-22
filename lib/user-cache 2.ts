import { getRedisClient } from "./redis";
import { prisma, warmDatabaseConnection } from "./prisma";
import { getConsistentCreditValue, createPrismaDecimal } from "./prisma-types";

// Cache configuration
const USER_CACHE_TTL = 30; // 30 seconds cache for user credentials
const USER_CACHE_PREFIX = "user_creds:";

export interface CachedUserCredentials {
  id: string;
  credits: number;
  isPremium: boolean;
  cacheTime: number;
  fromCache: boolean;
}

/**
 * Get user credentials with caching to reduce database hits
 * Especially important for session creation flows
 */
export async function getCachedUserCredentials(userId: string): Promise<CachedUserCredentials | null> {
  const cacheKey = `${USER_CACHE_PREFIX}${userId}`;
  const redis = getRedisClient();
  
  try {
    // Try to get from cache first
    const cached = await redis.get<CachedUserCredentials>(cacheKey);
    if (cached) {
      console.log(`[UserCache] Cache hit for user ${userId}`);
      return { ...cached, fromCache: true };
    }
  } catch (error) {
    console.error('[UserCache] Redis error, proceeding without cache:', error);
  }
  
  // Cache miss - fetch from database with connection warming
  console.log(`[UserCache] Cache miss for user ${userId}, fetching from database`);
  
  // Warm connection before querying
  await warmDatabaseConnection();
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true,
        credits: true, 
        isPremium: true 
      },
    });
    
    if (!user) {
      return null;
    }
    
    const credentials: CachedUserCredentials = {
      id: user.id,
      credits: getConsistentCreditValue(user.credits),
      isPremium: user.isPremium,
      cacheTime: Date.now(),
      fromCache: false
    };
    
    // Cache the result
    try {
      await redis.set(cacheKey, credentials, { ex: USER_CACHE_TTL });
      console.log(`[UserCache] Cached credentials for user ${userId}`);
    } catch (cacheError) {
      console.error('[UserCache] Failed to cache user credentials:', cacheError);
    }
    
    return credentials;
  } catch (error) {
    console.error('[UserCache] Database error fetching user credentials:', error);
    throw error;
  }
}

/**
 * Invalidate user cache (e.g., after credit deduction)
 */
export async function invalidateUserCache(userId: string): Promise<void> {
  const cacheKey = `${USER_CACHE_PREFIX}${userId}`;
  const redis = getRedisClient();
  
  try {
    await redis.del(cacheKey);
    console.log(`[UserCache] Invalidated cache for user ${userId}`);
  } catch (error) {
    console.error('[UserCache] Failed to invalidate cache:', error);
  }
}

/**
 * Pre-fetch and cache user credentials
 * Useful for warming cache before critical operations
 */
export async function prefetchUserCredentials(userId: string): Promise<void> {
  try {
    await getCachedUserCredentials(userId);
    console.log(`[UserCache] Pre-fetched credentials for user ${userId}`);
  } catch (error) {
    console.error('[UserCache] Failed to pre-fetch user credentials:', error);
  }
}