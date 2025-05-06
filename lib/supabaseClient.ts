import { createClient } from "@supabase/supabase-js"
import { config } from "./config"

// Create a singleton for the Supabase client
let supabaseInstance: ReturnType<typeof createClient> | null = null

// Function to get the Supabase client (browser-side)
export function getSupabaseClient() {
  if (supabaseInstance) return supabaseInstance

  // Log for debugging
  console.log("Creating new Supabase client with:", {
    urlSet: Boolean(config.supabase.url),
    keySet: Boolean(config.supabase.anonKey),
  })

  if (!config.supabase.url || !config.supabase.anonKey) {
    console.error("Missing Supabase environment variables. Check your .env file.")
  }

  supabaseInstance = createClient(config.supabase.url, config.supabase.anonKey)
  return supabaseInstance
}

// Export the client instance for convenience
export const supabase = getSupabaseClient()

// Only create the admin client in server components
// This function should never be called from client components
export const createSupabaseAdmin = () => {
  if (typeof window !== "undefined") {
    console.error("Attempted to create admin client in browser")
    throw new Error("Admin client can only be used in server components")
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

  if (!config.supabase.url || !serviceRoleKey) {
    console.error("Missing Supabase admin environment variables")
  }

  return createClient(config.supabase.url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Do NOT export supabaseAdmin directly to avoid client-side imports
