import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'

export async function POST(req: Request) {
	const { companyLoginId, code } = await req.json()
	const supabase = createSupabaseServer()
	const { data, error } = await supabase.rpc('validate_company_code', {
		_company_login_id: (companyLoginId || '').toLowerCase(),
		_plain_code: code,
	} as any)
	if (error) return new NextResponse(error.message, { status: 400 })
	if (!data) return new NextResponse('Invalid code', { status: 400 })
	return NextResponse.json({ ok: true, role: (data as any)?.role || 'employee' })
}


