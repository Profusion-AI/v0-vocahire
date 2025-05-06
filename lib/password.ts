// This is a simplified password hashing implementation that works in Edge runtime
// For production, consider using a more secure approach like Argon2 with proper configuration

import { createHash, randomBytes } from "crypto"

// Simple password hashing function
export async function hash(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex")
  const hash = createHash("sha256")
    .update(salt + password)
    .digest("hex")
  return `${salt}:${hash}`
}

// Password comparison function
export async function compare(password: string, hashedPassword: string): Promise<boolean> {
  const [salt, storedHash] = hashedPassword.split(":")
  const hash = createHash("sha256")
    .update(salt + password)
    .digest("hex")
  return storedHash === hash
}
