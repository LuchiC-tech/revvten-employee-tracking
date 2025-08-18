import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = (searchParams.get('type') || 'magiclink') as any
  const next = searchParams.get('next') || '/'

  const safeNext = next.startsWith('/') ? next : '/'
  const response = NextResponse.redirect(new URL(safeNext, origin))

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookies().get(name)?.value },
        set(name: string, value: string, options: any) { response.cookies.set({ name, value, ...options }) },
        remove(name: string, options: any) { response.cookies.set({ name, value: '', ...options }) },
      }
    }
  )

  try {
    if (code) {
      await supabase.auth.exchangeCodeForSession(code)
    } else if (token_hash) {
      await supabase.auth.verifyOtp({ type, token_hash })
    }
  } catch {
    // ignore; user will remain unauthenticated
  }

  return response
}


