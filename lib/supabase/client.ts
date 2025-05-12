import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"

// Create a single instance of the Supabase client to be used across the client-side application
export const createClient = () => {
  return createClientComponentClient<Database>()
}
