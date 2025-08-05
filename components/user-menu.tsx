"use client"
import { useEffect, useState } from "react"
import { getBrowserSupabase } from "@/lib/supabase"

export function UserMenu() {
  const supabase = getBrowserSupabase()
  const [user, setUser] = useState(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [supabase])

  return <>{user?.email}</>
}
