import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(req: Request) {
	const { companyLoginId, code, displayName, department } = await req.json()
	const supabase = createSupabaseServer()
	const { data, error } = await supabase.rpc('bind_profile_with_code', {
		_company_login_id: (companyLoginId || '').toLowerCase(),
		_plain_code: code,
		_display_name: displayName,
		_department: department,
	} as any)
	if (error) return new NextResponse(error.message, { status: 400 })
	return NextResponse.json({ ok: true, role: data?.role || 'employee' })
}


