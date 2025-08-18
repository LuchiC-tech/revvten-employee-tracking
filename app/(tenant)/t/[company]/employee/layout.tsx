import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { createSupabaseServer } from '@/lib/supabase/server';
import { fetchCompanyBySlug } from '@/lib/tenant/fetchCompany';
import { EmployeeTabs } from '@/components/employee/EmployeeTabs';
import { UnknownCompany } from '@/components/guards/UnknownCompany';

export default async function EmployeeLayout({
  children,
  params,
}: { children: ReactNode; params: { company: string } }) {
  const company = await fetchCompanyBySlug(params.company);
  if (!company) {
    return (
      <div className="container mx-auto p-6">
        <UnknownCompany companyLoginId={params.company.toLowerCase()} />
      </div>
    );
  }

  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Force no-cache on auth-guarded pages to avoid stale SSR sending user back to login
    redirect(`/t/${company.company_login_id}/auth/login`);
  }

  const { data: profile } = await supabase
    .from('revvten.profiles')
    .select('company_id, email, department, role')
    .eq('user_id', user.id)
    .maybeSingle();

  const bound = profile?.company_id === company.id;
  if (!bound) {
    redirect(`/t/${company.company_login_id}/auth/login`);
  }

  return (
    <div className="container mx-auto p-6">
      <EmployeeTabs company={company.company_login_id} />
      {children}
    </div>
  );
}


