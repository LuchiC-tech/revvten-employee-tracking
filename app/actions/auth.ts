'use server'

import { createSupabaseServer } from '@/lib/supabase/server'

export async function signInWithOtp(email: string, redirectTo?: string) {
	const supabase = createSupabaseServer()
	const { error } = await supabase.auth.signInWithOtp({
		email,
		options: {
			emailRedirectTo: redirectTo ?? `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/auth/callback`,
		},
	})
	if (error) throw error
	return { ok: true }
}

export async function signOut() {
	const supabase = createSupabaseServer()
	await supabase.auth.signOut()
	return { ok: true }
}


