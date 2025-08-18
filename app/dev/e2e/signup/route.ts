import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'

export async function POST(req: Request) {
	if (process.env.NODE_ENV === 'production') return new NextResponse('Not available', { status: 404 })
	const { companyLoginId, email, password, department, displayName, code } = await req.json()
	const slug = (companyLoginId || '').toLowerCase()
	const supabase = createSupabaseServer()

	// Resolve company first
	const { data: companyData, error: companyErr } = await supabase.rpc('resolve_company_by_login', { _login: slug })
	if (companyErr) return new NextResponse(companyErr.message, { status: 400 })
	const company = Array.isArray(companyData) ? (companyData as any)[0] : (companyData as any)
	if (!company?.id) return new NextResponse('Company not found', { status: 404 })

	// Note: Skipping early validate here to allow OTP to be issued first in E2E testing.

	// Create auth user
	const { error: signErr } = await supabase.auth.signUp({ email, password })
	if (signErr) return new NextResponse(signErr.message, { status: 400 })

	// Send OTP email code (no redirect)
	await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } }).catch(() => {})

	return NextResponse.json({ ok: true, next: 'verify', email, note: 'Check your inbox for a one-time verification code' })
}


