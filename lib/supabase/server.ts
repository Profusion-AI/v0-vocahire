import { createServerComponentClient, createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/types/supabase"

// For use in Server Components
export const createServerClient = () => {
  return createServerComponentClient<Database>({ cookies })
}

// For use in Route Handlers
export const createApiClient = () => {
  return createRouteHandlerClient<Database>({ cookies })
}
