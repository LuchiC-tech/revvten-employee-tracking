import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(req: Request) {
  const { email, password, companyLoginId, code } = await req.json()
  if (process.env.NODE_ENV !== 'production') console.log('[login] start', { email, companyLoginId })

  // Create a response up-front so Supabase can attach cookies directly to it
  const response = new NextResponse(null, { status: 200 })
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

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    console.error('[login] signInWithPassword error:', error.message)
    return NextResponse.json({ ok: false, error: error.message }, { status: 400, headers: { 'Cache-Control': 'no-store' } })
  }
  if (process.env.NODE_ENV !== 'production') console.log('[login] signIn ok')

  // Resolve company and preserve existing department if present
  const { data: cdata } = await supabase.rpc('resolve_company_by_login', { _login: (companyLoginId || '').toLowerCase() })
  const company = Array.isArray(cdata) ? (cdata as any)[0] : (cdata as any)
  if (!company?.id) {
    console.error('[login] unknown tenant for', companyLoginId)
    return NextResponse.json({ ok: false, error: 'Unknown tenant' }, { status: 400, headers: { 'Cache-Control': 'no-store' } })
  }
  if (process.env.NODE_ENV !== 'production') console.log('[login] tenant ok', { companyId: company.id })

  let department = 'Sales'
  try {
    const { data: me } = await supabase.auth.getUser()
    const uid = me?.user?.id
    if (uid) {
      const { data: existing } = await supabase
        .from('revvten.profiles')
        .select('department')
        .eq('user_id', uid)
        .eq('company_id', company.id)
        .maybeSingle()
      department = existing?.department || 'Sales'
    }
  } catch {}
  if (process.env.NODE_ENV !== 'production') console.log('[login] department', { department })

  const displayName = (email?.split?.('@')[0] || 'User')
  const { data: bindData, error: bindErr } = await supabase.rpc('bind_profile_with_code', {
    _company_login_id: (companyLoginId || '').toLowerCase(),
    _plain_code: code,
    _display_name: displayName,
    _department: department,
  } as any)
  if (bindErr) {
    console.error('[login] bind_profile_with_code error:', bindErr.message)
    return NextResponse.json({ ok: false, error: bindErr.message }, { status: 400, headers: { 'Cache-Control': 'no-store' } })
  }
  if (process.env.NODE_ENV !== 'production') console.log('[login] bind ok', { role: (bindData as any)?.role })

  const role = (bindData as any)?.role || 'employee'
  // Force a quick session validation to ensure cookies are persisted
  await supabase.auth.getUser()
  response.headers.set('x-role', role)
  response.headers.set('Cache-Control', 'no-store')
  if (process.env.NODE_ENV !== 'production') console.log('[login] done', { role })
  return response
}


