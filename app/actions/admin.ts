'use server'

import { createSupabaseAdmin } from '@/lib/supabase/server'

export async function issueManagerToken(companyId: string, label?: string) {
	const admin = createSupabaseAdmin()
	const { data, error } = await admin.rpc('issue_manager_token', {
		_company_id: companyId,
		_label: label ?? null,
		_ttl_hours: 720
	})
	if (error) throw error
	return data as { plain_token: string; token_id: string }[]
}


