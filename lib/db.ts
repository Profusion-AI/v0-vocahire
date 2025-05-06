import { neon } from "@neondatabase/serverless"

// Create a SQL client using neon for direct SQL queries
export const sql = neon(process.env.DATABASE_URL!)

// User related functions
export const userDb = {
  async findByEmail(email: string) {
    try {
      console.log(`Finding user by email: ${email}`)
      const result = await sql`
        SELECT * FROM "User" WHERE email = ${email} LIMIT 1
      `
      console.log(`User query result: ${JSON.stringify(result)}`)
      return result[0] || null
    } catch (error) {
      console.error(`Error finding user by email: ${email}`, error)
      throw error
    }
  },

  async findById(id: string) {
    try {
      const result = await sql`
        SELECT * FROM "User" WHERE id = ${id} LIMIT 1
      `
      return result[0] || null
    } catch (error) {
      console.error(`Error finding user by id: ${id}`, error)
      throw error
    }
  },

  async create({
    name,
    email,
    password,
    credits = 1,
  }: { name: string; email: string; password: string; credits?: number }) {
    try {
      const id = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      const now = new Date()

      const result = await sql`
        INSERT INTO "User" (id, name, email, password, credits, "createdAt", "updatedAt")
        VALUES (${id}, ${name}, ${email}, ${password}, ${credits}, ${now}, ${now})
        RETURNING *
      `
      return result[0]
    } catch (error) {
      console.error(`Error creating user: ${email}`, error)
      throw error
    }
  },

  async updateCredits(userId: string, credits: number) {
    try {
      const result = await sql`
        UPDATE "User" SET credits = ${credits}, "updatedAt" = ${new Date()}
        WHERE id = ${userId}
        RETURNING *
      `
      return result[0]
    } catch (error) {
      console.error(`Error updating credits for user: ${userId}`, error)
      throw error
    }
  },
}

// Interview related functions
export const interviewDb = {
  async create({ userId, transcript, feedback }: { userId: string; transcript: string; feedback: any }) {
    try {
      const id = `interview_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      const now = new Date()

      const result = await sql`
        INSERT INTO "Interview" (id, "userId", transcript, feedback, "createdAt", "updatedAt")
        VALUES (${id}, ${userId}, ${transcript}, ${JSON.stringify(feedback)}, ${now}, ${now})
        RETURNING *
      `
      return result[0]
    } catch (error) {
      console.error("Error creating interview:", error)
      throw error
    }
  },

  async update({ id, feedback }: { id: string; feedback: any }) {
    try {
      const now = new Date()

      const result = await sql`
        UPDATE "Interview" SET feedback = ${JSON.stringify(feedback)}, "updatedAt" = ${now}
        WHERE id = ${id}
        RETURNING *
      `
      return result[0]
    } catch (error) {
      console.error("Error updating interview:", error)
      throw error
    }
  },

  async findByUserId(userId: string) {
    try {
      const result = await sql`
        SELECT * FROM "Interview" WHERE "userId" = ${userId} ORDER BY "createdAt" DESC
      `
      return result
    } catch (error) {
      console.error("Error finding interviews by user id:", error)
      throw error
    }
  },

  async findById(id: string) {
    try {
      const result = await sql`
        SELECT * FROM "Interview" WHERE id = ${id} LIMIT 1
      `
      return result[0] || null
    } catch (error) {
      console.error(`Error finding interview by id: ${id}`, error)
      throw error
    }
  },
}
