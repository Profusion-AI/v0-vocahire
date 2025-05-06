// Environment variables accessible on the client side
export const config = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  },
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || "",
  },
  turn: {
    url: process.env.NEXT_PUBLIC_TURN_URL || "",
    username: process.env.NEXT_PUBLIC_TURN_USERNAME || "",
    credential: process.env.NEXT_PUBLIC_TURN_CREDENTIAL || "",
  },
}

// Log configuration in development to help with debugging
if (process.env.NODE_ENV !== "production") {
  console.log("Config:", {
    supabaseUrl: config.supabase.url ? "Set" : "Not set",
    supabaseAnonKey: config.supabase.anonKey ? "Set" : "Not set",
    turnUrl: config.turn.url ? "Set" : "Not set",
    turnUsername: config.turn.username ? "Set" : "Not set",
    turnCredential: config.turn.credential ? "Set" : "Not set",
  })
}
