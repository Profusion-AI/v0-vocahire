/**
 * Fallback database module for when Prisma can't connect to the database server
 * This provides mock functionality to allow the application to still function
 * with limited capabilities when the database is unavailable.
 */

import type { User, UserRole } from '@prisma/client';

// Basic in-memory storage for users created during the session
const users = new Map<string, any>();

// Default user object when no stored user is found
const getDefaultUser = (id: string, name?: string | null, email?: string | null): User => ({
  id,
  name,
  email,
  image: null,
  role: 'USER' as UserRole,
  credits: 3.00,
  resumeJobTitle: null,
  resumeSkills: null,
  resumeExperience: null,
  resumeEducation: null,
  resumeAchievements: null,
  resumeFileUrl: null,
  jobSearchStage: null,
  linkedinUrl: null,
  stripeCustomerId: null,
  premiumSubscriptionId: null,
  premiumExpiresAt: null,
  isPremium: false,
  acceptedTermsAt: null,
  acceptedPrivacyAt: null,
  dataRetentionOverride: false,
  createdAt: new Date(),
  updatedAt: new Date(),
});

/**
 * Fallback user operations when the primary database is unavailable
 */
export const fallbackUserOps = {
  // Mock for prisma.user.findUnique
  findUnique: async ({ where }: { where: { id: string } }): Promise<User | null> => {
    console.log('Using fallback database (findUnique) for user', where.id);
    
    // Check if the user is in our in-memory store
    if (users.has(where.id)) {
      return users.get(where.id);
    }
    
    // Create a default user
    const defaultUser = getDefaultUser(where.id);
    users.set(where.id, defaultUser);
    return defaultUser;
  },
  
  // Mock for prisma.user.create
  create: async ({ data }: { data: any }): Promise<User> => {
    console.log('Using fallback database (create) for user', data.id);
    
    const newUser = {
      ...getDefaultUser(data.id, data.name, data.email),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    users.set(data.id, newUser);
    return newUser;
  },
  
  // Mock for prisma.user.update
  update: async ({ where, data }: { where: { id: string }, data: any }): Promise<User> => {
    console.log('Using fallback database (update) for user', where.id);
    
    // Get existing user or create default
    const existingUser = users.get(where.id) || getDefaultUser(where.id);
    
    // Update the user with new data
    const updatedUser = {
      ...existingUser,
      ...data,
      updatedAt: new Date(),
    };
    
    users.set(where.id, updatedUser);
    return updatedUser;
  }
};

/**
 * Fallback database client for use when Prisma cannot connect to the real database
 */
export const fallbackDb = {
  user: fallbackUserOps,
  
  // Add other models as needed, for example:
  interviewSession: {
    create: async () => ({ id: `fallback-${Date.now()}` }),
    findUnique: async () => null,
  },
  
  // For testing database connectivity
  $queryRaw: async (query: any) => {
    throw new Error('Database connection not available');
  }
};