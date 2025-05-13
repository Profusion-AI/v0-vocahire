import type { NextAuthOptions, Session } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

// Extend the Session type to include 'id' on user
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token && session.user && typeof token.id === 'string') {
        session.user.id = token.id;
      }

      return session
    },
    async jwt({ token, user, account }) {
      if (account && user) {
        token.id = user.id
        token.name = user.name
        token.email = user.email
        token.picture = user.image
      }
      return token
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
