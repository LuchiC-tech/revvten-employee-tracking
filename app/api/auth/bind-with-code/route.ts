import { NextResponse } from 'next/server'
import { createSupabaseServer, createSupabaseAdmin } from '@/lib/supabase/server'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(req: Request) {
	const { companyLoginId, code, displayName, department } = await req.json()
	const supabase = createSupabaseServer()

	// 1) Bind profile (role derived by RPC)
	const { data, error } = await supabase.rpc('bind_profile_with_code', {
		_company_login_id: (companyLoginId || '').toLowerCase(),
		_plain_code: code,
		_display_name: displayName,
		_department: department,
	} as any)
	if (error) return new NextResponse(error.message, { status: 400 })

	// 2) Ensure company_users mapping (source of truth for tenant membership)
	try {
		const { data: me } = await supabase.auth.getUser()
		const userId = me?.user?.id
		if (userId) {
			const { data: cdata } = await supabase.rpc('resolve_company_by_login', { _login: (companyLoginId || '').toLowerCase() })
			const company = Array.isArray(cdata) ? (cdata as any)[0] : (cdata as any)
			if (company?.id) {
				const admin = createSupabaseAdmin()
				await (admin as any)
					.from('revvten.company_users')
					.upsert({ company_id: company.id, user_id: userId }, { onConflict: 'company_id,user_id' })
			}
		}
	} catch {}

	return NextResponse.json({ ok: true, role: (data as any)?.role || 'employee' })
}


