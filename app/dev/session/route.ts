import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'

export async function GET() {
	if (process.env.NODE_ENV === 'production') {
		return new NextResponse('Not available', { status: 404 })
	}
	const supabase = createSupabaseServer()
	const { data: { user } } = await supabase.auth.getUser()
	return NextResponse.json({ ok: true, user })
}


