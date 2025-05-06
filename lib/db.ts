import { neon } from "@neondatabase/serverless"

// Create a SQL client using neon for direct SQL queries
export const sql = neon(process.env.DATABASE_URL!)

// User related functions
export const userDb = {
  async findByEmail(email: string) {
    const result = await sql`
      SELECT * FROM "User" WHERE email = ${email} LIMIT 1
    `
    return result[0] || null
  },

  async findById(id: string) {
    const result = await sql`
      SELECT * FROM "User" WHERE id = ${id} LIMIT 1
    `
    return result[0] || null
  },

  async create({
    name,
    email,
    password,
    credits = 1,
  }: { name: string; email: string; password: string; credits?: number }) {
    const id = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    const now = new Date()

    const result = await sql`
      INSERT INTO "User" (id, name, email, password, credits, "createdAt", "updatedAt")
      VALUES (${id}, ${name}, ${email}, ${password}, ${credits}, ${now}, ${now})
      RETURNING *
    `
    return result[0]
  },

  async updateCredits(userId: string, credits: number) {
    const result = await sql`
      UPDATE "User" SET credits = ${credits}, "updatedAt" = ${new Date()}
      WHERE id = ${userId}
      RETURNING *
    `
    return result[0]
  },
}

// Session related functions
export const sessionDb = {
  async create({ sessionToken, userId, expires }: { sessionToken: string; userId: string; expires: Date }) {
    const id = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

    const result = await sql`
      INSERT INTO "Session" (id, "sessionToken", "userId", expires)
      VALUES (${id}, ${sessionToken}, ${userId}, ${expires})
      RETURNING *
    `
    return result[0]
  },

  async findByToken(sessionToken: string) {
    const result = await sql`
      SELECT * FROM "Session" WHERE "sessionToken" = ${sessionToken} LIMIT 1
    `
    return result[0] || null
  },

  async deleteByToken(sessionToken: string) {
    await sql`
      DELETE FROM "Session" WHERE "sessionToken" = ${sessionToken}
    `
  },

  async deleteByUserId(userId: string) {
    await sql`
      DELETE FROM "Session" WHERE "userId" = ${userId}
    `
  },
}

// Account related functions
export const accountDb = {
  async create(data: {
    userId: string
    type: string
    provider: string
    providerAccountId: string
    refresh_token?: string
    access_token?: string
    expires_at?: number
    token_type?: string
    scope?: string
    id_token?: string
    session_state?: string
  }) {
    const id = `account_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

    const result = await sql`
      INSERT INTO "Account" (
        id, "userId", type, provider, "providerAccountId", 
        refresh_token, access_token, expires_at, token_type, 
        scope, id_token, session_state
      )
      VALUES (
        ${id}, ${data.userId}, ${data.type}, ${data.provider}, ${data.providerAccountId},
        ${data.refresh_token || null}, ${data.access_token || null}, ${data.expires_at || null}, 
        ${data.token_type || null}, ${data.scope || null}, ${data.id_token || null}, 
        ${data.session_state || null}
      )
      RETURNING *
    `
    return result[0]
  },

  async findByProviderAndId(provider: string, providerAccountId: string) {
    const result = await sql`
      SELECT * FROM "Account" 
      WHERE provider = ${provider} AND "providerAccountId" = ${providerAccountId}
      LIMIT 1
    `
    return result[0] || null
  },

  async deleteByUserId(userId: string) {
    await sql`
      DELETE FROM "Account" WHERE "userId" = ${userId}
    `
  },
}

// Interview related functions
export const interviewDb = {
  async create({
    userId,
    transcript,
    feedback,
    duration,
  }: { userId: string; transcript?: string; feedback?: any; duration?: number }) {
    const id = `interview_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    const now = new Date()

    const result = await sql`
      INSERT INTO "Interview" (id, "userId", transcript, feedback, duration, "createdAt", "updatedAt")
      VALUES (${id}, ${userId}, ${transcript || null}, ${feedback ? JSON.stringify(feedback) : null}, ${duration || null}, ${now}, ${now})
      RETURNING *
    `
    return result[0]
  },

  async findById(id: string) {
    const result = await sql`
      SELECT * FROM "Interview" WHERE id = ${id} LIMIT 1
    `
    return result[0] || null
  },

  async findByUserId(userId: string) {
    const result = await sql`
      SELECT * FROM "Interview" WHERE "userId" = ${userId} ORDER BY "createdAt" DESC
    `
    return result
  },

  async update({
    id,
    transcript,
    feedback,
    duration,
  }: { id: string; transcript?: string; feedback?: any; duration?: number }) {
    const updateFields = []
    const values: any[] = [id]

    if (transcript !== undefined) {
      updateFields.push(`transcript = $${values.length + 1}`)
      values.push(transcript)
    }

    if (feedback !== undefined) {
      updateFields.push(`feedback = $${values.length + 1}`)
      values.push(JSON.stringify(feedback))
    }

    if (duration !== undefined) {
      updateFields.push(`duration = $${values.length + 1}`)
      values.push(duration)
    }

    updateFields.push(`"updatedAt" = $${values.length + 1}`)
    values.push(new Date())

    if (updateFields.length === 1) {
      return null // Nothing to update
    }

    const query = `
      UPDATE "Interview" 
      SET ${updateFields.join(", ")}
      WHERE id = $1
      RETURNING *
    `

    const result = await sql.query(query, ...values)
    return result[0] || null
  },
}

// Verification token related functions
export const verificationTokenDb = {
  async create({ identifier, token, expires }: { identifier: string; token: string; expires: Date }) {
    const result = await sql`
      INSERT INTO "VerificationToken" (identifier, token, expires)
      VALUES (${identifier}, ${token}, ${expires})
      RETURNING *
    `
    return result[0]
  },

  async findByToken(token: string) {
    const result = await sql`
      SELECT * FROM "VerificationToken" WHERE token = ${token} LIMIT 1
    `
    return result[0] || null
  },

  async deleteByToken(token: string) {
    await sql`
      DELETE FROM "VerificationToken" WHERE token = ${token}
    `
  },
}
