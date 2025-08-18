import { createSupabaseServer } from '@/lib/supabase/server';

export async function rpcResolveCompanyByLogin(login: string) {
  const supabase = createSupabaseServer();
  const { data, error } = await supabase.rpc('resolve_company_by_login', { _login: login.toLowerCase() });
  if (error) throw error;
  return (Array.isArray(data) ? (data as any)[0] : (data as any)) as { id: string; name: string; company_login_id: string } | null;
}

export async function rpcUpsertMyProfile(params: { companyLoginId: string; email: string; displayName: string; department: string; role: 'employee' | 'manager' | 'revv_admin' }) {
  throw new Error('Deprecated: use bind_profile_with_code flow via /api routes');
}

export async function rpcElevateToManager(companyLoginId: string, token: string) {
  throw new Error('Deprecated: use validate_company_code and bind_profile_with_code');
}


