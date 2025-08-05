import { createBrowserClient } from "@supabase/ssr"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null

export function getBrowserSupabase() {
  if (typeof window === "undefined") {
    return null
  }

  if (!supabaseInstance) {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Missing Supabase environment variables")
      return null
    }

    try {
      supabaseInstance = createBrowserClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })
    } catch (error) {
      console.error("Error creating Supabase client:", error)
      return null
    }
  }

  return supabaseInstance
}

// Legacy export for compatibility
export const supabase = getBrowserSupabase()

// Default export
export function createClient() {
  return getBrowserSupabase()
}
