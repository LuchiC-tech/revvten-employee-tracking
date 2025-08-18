import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(req: Request) {
  try {
    const { access_token, refresh_token } = await req.json()
    if (process.env.NODE_ENV !== 'production') {
      const ts = new Date().toISOString()
      console.log(`[sync] ${ts} received tokens`, {
        accessTokenLen: access_token?.length ?? 0,
        refreshTokenLen: refresh_token?.length ?? 0,
      })
    }
    if (!access_token || !refresh_token) {
      return new NextResponse('Missing tokens', { status: 400 })
    }

    const res = new NextResponse(null, { status: 200, headers: { 'Cache-Control': 'no-store' } })
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return cookies().get(name)?.value },
          set(name: string, value: string, options: any) { res.cookies.set({ name, value, ...options }) },
          remove(name: string, options: any) { res.cookies.set({ name, value: '', ...options }) },
        }
      }
    )

    // Prefer official API to set session so Supabase manages cookie flags/expirations
    const { error } = await supabase.auth.setSession({ access_token, refresh_token })
    if (error) {
      if (process.env.NODE_ENV !== 'production') console.error('[sync] setSession error:', error.message)
      return new NextResponse(error.message, { status: 400 })
    }
    if (process.env.NODE_ENV !== 'production') console.log('[sync] setSession ok')

    return res
  } catch (e: any) {
    if (process.env.NODE_ENV !== 'production') console.error('[sync] exception:', e?.message)
    return new NextResponse(e?.message || 'error', { status: 400 })
  }
}


