import { NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase/server'

export async function POST(req: Request) {
	if (process.env.NODE_ENV === 'production') return new NextResponse('Not available', { status: 404 })
	const { email, type = 'signup' } = await req.json()
	const admin = createSupabaseAdmin()
	const { data, error } = await (admin as any).auth.admin.generateLink({ type, email })
	if (error) return new NextResponse(error.message, { status: 400 })
	const anyData = data as any
	return NextResponse.json({ ok: true, email_otp: anyData?.email_otp ?? anyData?.properties?.email_otp ?? null, action_link: anyData?.action_link || null })
}


