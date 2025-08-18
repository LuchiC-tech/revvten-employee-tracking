import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function POST(req: Request) {
  const { email, password, companyLoginId, code } = await req.json()

  // Prepare a response that will capture Set-Cookie from Supabase auth
  const initial = new NextResponse('', { headers: { 'Content-Type': 'application/json' } })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookies().get(name)?.value },
        set(name: string, value: string, options: any) { initial.cookies.set({ name, value, ...options }) },
        remove(name: string, options: any) { initial.cookies.set({ name, value: '', ...options }) },
      }
    }
  )

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return new NextResponse(error.message, { status: 400 })

  // Resolve company and preserve existing department if present
  const { data: cdata } = await supabase.rpc('resolve_company_by_login', { _login: (companyLoginId || '').toLowerCase() })
  const company = Array.isArray(cdata) ? (cdata as any)[0] : (cdata as any)
  if (!company?.id) return new NextResponse('Unknown tenant', { status: 400 })

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

  const displayName = (email?.split?.('@')[0] || 'User')
  const { data: bindData, error: bindErr } = await supabase.rpc('bind_profile_with_code', {
    _company_login_id: (companyLoginId || '').toLowerCase(),
    _plain_code: code,
    _display_name: displayName,
    _department: department,
  } as any)
  if (bindErr) return new NextResponse(bindErr.message, { status: 400 })

  const payload = { ok: true, role: (bindData as any)?.role || 'employee' }
  const final = NextResponse.json(payload)
  // propagate cookies captured on initial
  initial.cookies.getAll().forEach((c) => final.cookies.set(c))
  return final
}


