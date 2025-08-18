import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'

export async function POST(req: Request) {
	const { companyLoginId, code } = await req.json()
	const supabase = createSupabaseServer()

	// Must be signed in already
	const { data: { user } } = await supabase.auth.getUser()
	if (!user) return new NextResponse('Unauthorized', { status: 401 })

	// Resolve company (lock to tenant)
	const slug = (companyLoginId || '').toLowerCase()
	const { data: company, error: companyErr } = await supabase.rpc('resolve_company_by_login', { _login: slug })
	if (companyErr) return new NextResponse(companyErr.message, { status: 400 })
	const row = Array.isArray(company) ? (company as any)[0] : (company as any)
	if (!row?.id) return new NextResponse('Company not found', { status: 404 })

	// Read existing profile to preserve department if present
	const { data: existing } = await supabase
		.from('revvten.profiles')
		.select('email, department, role')
		.eq('user_id', user.id)
		.eq('company_id', row.id)
		.maybeSingle()

	const department = existing?.department || 'Sales'
	const displayName = (user.email || '').split('@')[0] || 'User'

	// Bind or refresh role via code; RPC derives role from code
	const { data: bindData, error: bindErr } = await supabase.rpc('bind_profile_with_code', {
		_company_login_id: slug,
		_plain_code: code,
		_display_name: displayName,
		_department: department,
	} as any)
	if (bindErr) return new NextResponse(bindErr.message, { status: 400 })

	return NextResponse.json({ ok: true, role: (bindData as any)?.role || existing?.role || 'employee' })
}


