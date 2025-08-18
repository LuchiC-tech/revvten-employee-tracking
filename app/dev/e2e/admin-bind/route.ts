import { NextResponse } from 'next/server'
import { createSupabaseAdmin, createSupabaseServer } from '@/lib/supabase/server'

export async function POST(req: Request) {
  if (process.env.NODE_ENV === 'production') return new NextResponse('Not available', { status: 404 })
  const { email, companyLoginId, code, department, displayName } = await req.json()
  const slug = (companyLoginId || '').toLowerCase()

  const admin = createSupabaseAdmin()
  const supabase = createSupabaseServer()

  // Resolve company via public RPC
  const { data: companyData, error: companyErr } = await supabase.rpc('resolve_company_by_login', { _login: slug })
  if (companyErr) return new NextResponse(companyErr.message, { status: 400 })
  const company = Array.isArray(companyData) ? (companyData as any)[0] : (companyData as any)
  if (!company?.id) return new NextResponse('Company not found', { status: 404 })

  // Validate code to derive role
  const { data: validateData, error: valErr } = await supabase.rpc('validate_company_code', {
    _company_login_id: slug,
    _plain_code: code,
  } as any)
  if (valErr) return new NextResponse(valErr.message, { status: 400 })
  if (!validateData) return new NextResponse('Invalid company code', { status: 400 })
  const role = (validateData as any)?.role || 'employee'

  // Lookup auth user id by email using admin
  const { data: authUser, error: authErr } = await (admin as any)
    .from('auth.users')
    .select('id, email')
    .eq('email', email)
    .maybeSingle()
  if (authErr) return new NextResponse(authErr.message, { status: 400 })
  if (!authUser?.id) return new NextResponse('Auth user not found', { status: 404 })

  // Ensure profile exists and is updated
  const { data: existing } = await (admin as any)
    .from('revvten.profiles')
    .select('user_id')
    .eq('user_id', authUser.id)
    .eq('company_id', company.id)
    .maybeSingle()

  if (existing?.user_id) {
    const { error: updErr } = await (admin as any)
      .from('revvten.profiles')
      .update({ email, department: department || 'Sales', role })
      .eq('user_id', authUser.id)
      .eq('company_id', company.id)
    if (updErr) return new NextResponse(updErr.message, { status: 400 })
  } else {
    const { error: insErr } = await (admin as any)
      .from('revvten.profiles')
      .insert({ user_id: authUser.id, company_id: company.id, email, department: department || 'Sales', role, display_name: displayName || (email.split?.('@')[0] || 'User') })
    if (insErr) return new NextResponse(insErr.message, { status: 400 })
  }

  return NextResponse.json({ ok: true, role, company: { id: company.id, slug }, user: { id: authUser.id, email } })
}


