import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'

export async function POST(req: Request) {
	const { email } = await req.json()
	const supabase = createSupabaseServer()
	const { error } = await supabase.auth.resend({ type: 'signup', email })
	if (error) return new NextResponse(error.message, { status: 400 })
	return NextResponse.json({ ok: true })
}


