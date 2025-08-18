import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'

export async function POST(req: Request) {
	if (process.env.NODE_ENV === 'production') return new NextResponse('Not available', { status: 404 })
	const { email, token, companyLoginId, code, department, displayName } = await req.json()
	const slug = (companyLoginId || '').toLowerCase()
	const supabase = createSupabaseServer()

	// Verify OTP
	const { error: verifyErr } = await supabase.auth.verifyOtp({ email, token, type: 'email' as any })
	if (verifyErr) return new NextResponse(verifyErr.message, { status: 400 })

	// Bind profile with code
	const { data: bindData, error: bindErr } = await supabase.rpc('bind_profile_with_code', {
		_company_login_id: slug,
		_plain_code: code,
		_display_name: displayName || (email?.split?.('@')[0] || 'User'),
		_department: department || 'Sales',
	} as any)
	if (bindErr) return new NextResponse(bindErr.message, { status: 400 })

	return NextResponse.json({ ok: true, role: (bindData as any)?.role || 'employee' })
}


