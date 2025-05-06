import { getSupabaseClient } from "./supabaseClient"

export async function getSessionToken() {
  const supabase = getSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session?.access_token
}
