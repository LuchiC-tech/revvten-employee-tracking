import { cookies } from 'next/headers'
import { createSupabaseServer } from '@/lib/supabase/server';
import { fetchCompanyBySlug } from '@/lib/tenant/fetchCompany';

export type CompanyLite = { id: string; name: string; company_login_id: string; theme?: any };

export type GateResult = {
  company: CompanyLite | null;
  sessionUser: { id: string; email: string | null } | null;
  profile: { company_id: string; email: string; department: string; role: 'employee' | 'manager' | 'revv_admin' } | null;
  reason: null | 'unknown_company' | 'no_session' | 'not_bound';
};

async function resolveCompanyByLoginId(slug: string): Promise<CompanyLite | null> {
  return await fetchCompanyBySlug(slug);
}

export async function getTenantBySlug(slugRaw: string) {
  const slug = (slugRaw || '').toLowerCase();
  const company = await resolveCompanyByLoginId(slug);
  return { company };
}

export async function getTenantAndSession(companyLoginId: string): Promise<GateResult> {
  const supabase = createSupabaseServer();
  const slug = companyLoginId.toLowerCase();
  const company = await resolveCompanyByLoginId(slug);
  if (!company) return { company: null, sessionUser: null, profile: null, reason: 'unknown_company' };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { company, sessionUser: null, profile: null, reason: 'no_session' };

  const { data: profile } = await supabase
    .from('revvten.profiles')
    .select('company_id, email, department, role')
    .eq('user_id', user.id)
    .single();

  if (!profile || profile.company_id !== company.id) {
    return {
      company,
      sessionUser: { id: user.id, email: user.email ?? null },
      profile: null,
      reason: 'not_bound',
    };
  }

  return {
    company,
    sessionUser: { id: user.id, email: user.email ?? null },
    profile: profile as any,
    reason: null,
  };
}


