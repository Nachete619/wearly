"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { getBrowserSupabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

interface AuthState {
  user: User | null
  loading: boolean
  initialized: boolean
  supabase: ReturnType<typeof getBrowserSupabase>
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const mountedRef = useRef(true)
  const supabase = getBrowserSupabase()

  const handleAuthChange = useCallback(
    (event: string, session: any) => {
      if (!mountedRef.current) return

      console.log("Auth state changed:", event, session?.user?.email)
      setUser(session?.user ?? null)
      setLoading(false)

      if (!initialized) {
        setInitialized(true)
      }
    },
    [initialized],
  )

  const handleVisibilityChange = useCallback(() => {
    if (!mountedRef.current || document.visibilityState !== "visible" || !supabase) return

    // Refresh auth state when tab becomes visible
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mountedRef.current) {
        setUser(session?.user ?? null)
      }
    })
  }, [supabase])

  useEffect(() => {
    mountedRef.current = true

    if (!supabase) {
      console.warn("Supabase client not available")
      setLoading(false)
      setInitialized(true)
      return
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error("Error getting session:", error)
      }

      if (mountedRef.current) {
        setUser(session?.user ?? null)
        setLoading(false)
        setInitialized(true)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(handleAuthChange)

    // Listen for visibility changes
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      mountedRef.current = false
      subscription.unsubscribe()
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [supabase, handleAuthChange, handleVisibilityChange])

  return {
    user,
    loading,
    initialized,
    supabase,
  }
}
