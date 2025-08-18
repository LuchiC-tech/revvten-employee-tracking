import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { env } from '@/lib/env'

export const createSupabaseServer = () => {
  const cookieStore = cookies()
  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value },
        set() {}, // handled by Next route handlers if needed
        remove() {}
      }
    }
  )
}

// Admin-level client (server/edge only) — NEVER expose to browser
export const createSupabaseAdmin = () =>
  createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY!
  )


