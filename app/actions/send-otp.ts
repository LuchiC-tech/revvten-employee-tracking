'use server'

import { createSupabaseServer } from '@/lib/supabase/server'

export async function sendOtp(email: string) {
	const supabase = createSupabaseServer()
	const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/auth/callback?next=/test`
	const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } })
	if (error) throw error
	return { ok: true }
}


