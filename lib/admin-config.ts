// Admin configuration utilities

/**
 * Get admin user IDs from environment variable
 * Handles trimming and deduplication
 */
export function getAdminUserIds(): string[] {
  const adminIdsEnv = process.env.ADMIN_USER_IDS;
  
  if (!adminIdsEnv) {
    return [];
  }
  
  // Split by comma, trim each ID, filter empty strings, and deduplicate
  const adminIds = adminIdsEnv
    .split(',')
    .map(id => id.trim())
    .filter(id => id.length > 0);
  
  // Remove duplicates while preserving order
  return [...new Set(adminIds)];
}

/**
 * Check if a user ID is an admin
 */
export function isAdminUser(userId: string): boolean {
  const adminIds = getAdminUserIds();
  return adminIds.includes(userId);
}

/**
 * Validate admin authorization for request
 */
export async function validateAdminAuth(userId: string | null): Promise<boolean> {
  if (!userId) {
    return false;
  }
  
  return isAdminUser(userId);
}