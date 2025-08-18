import { createSupabaseServer } from '@/lib/supabase/server';
type CompanyLite = { id: string; name: string; company_login_id: string };

export async function fetchCompanyBySlug(slugRaw: string): Promise<CompanyLite|null> {
	const slug = (slugRaw || '').toLowerCase();
	const supabase = createSupabaseServer();
	const { data, error } = await supabase.rpc('resolve_company_by_login', { _login: slug });
	if (error) {
		console.error('RPC resolve_company_by_login failed', { slug, error });
		return null;
	}
	// PostgREST wraps RETURNS TABLE in an array even if LIMIT 1 is applied
	const row = Array.isArray(data) ? (data[0] as any) : (data as any);
	if (!row || !row.id) {
		console.warn('No company for slug', slug, 'RPC data:', data);
		return null;
	}
	return row as CompanyLite;
}
