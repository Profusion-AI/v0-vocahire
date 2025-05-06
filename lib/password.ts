// Simple password hashing that doesn't use Node.js crypto
export async function hash(password: string): Promise<string> {
  // In a real app, you'd use a proper hashing library
  // This is a simplified version for demo purposes
  return `hashed_${password}`
}

export async function compare(password: string, hashedPassword: string): Promise<boolean> {
  // In a real app, you'd use a proper hashing library
  // This is a simplified version for demo purposes
  return hashedPassword === `hashed_${password}`
}
