import { prisma } from "./prisma"
import { clerkClient } from "@clerk/nextjs/server"

export async function getOrCreatePrismaUser(clerkUserId: string) {
  try {
    // Try to find existing user by id (clerkId is the id in current schema)
    const user = await prisma.user.findUnique({
      where: { id: clerkUserId }
    })
    
    if (user) {
      return user
    }
    
    // If no user, create a new one
    // Get user data from Clerk
    const clerk = await clerkClient()
    const clerkUser = await clerk.users.getUser(clerkUserId)
    
    return await prisma.user.create({
      data: {
        id: clerkUserId,
        email: clerkUser.emailAddresses[0]?.emailAddress || null,
        name: clerkUser.firstName && clerkUser.lastName 
          ? `${clerkUser.firstName} ${clerkUser.lastName}`
          : clerkUser.firstName || clerkUser.username || null,
        image: clerkUser.imageUrl,
        credits: 3.00, // Default credits for new users
      }
    })
  } catch (error) {
    console.error("Error in getOrCreatePrismaUser:", error)
    throw error
  }
}