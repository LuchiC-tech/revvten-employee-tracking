import { ReactNode } from 'react';
import { redirect, notFound } from 'next/navigation';
import { createSupabaseServer } from '@/lib/supabase/server';
import { fetchCompanyBySlug } from '@/lib/tenant/fetchCompany';

export default async function Layout({
  params,
  children,
}: {
  params: { company: string };
  children: ReactNode;
}) {
  const supabase = createSupabaseServer();

  // 1) must have a session
  const { data: { user } } = await supabase.auth.getUser();
  const slug = String(params.company || '').toLowerCase();
  if (!user) {
    redirect(`/t/${slug}/auth/login`);
  }

  // 2) resolve company once (RPC-backed helper)
  const company = await fetchCompanyBySlug(slug);
  if (!company?.id) {
    notFound(); // prevents “Unknown company” loops
  }

  // 3) membership check in the *revvten* schema (not public)
  const { data: membership, error } = await (supabase as any)
    .schema('revvten')
    .from('company_users')
    .select('id')
    .eq('company_id', company.id)
    .eq('user_id', user.id)
    .maybeSingle();

  // Optional: temporary trace to catch mis-wires
  console.log('[guard]', {
    slug,
    userId: user.id,
    companyId: company.id,
    membershipId: membership?.id ?? null,
    error,
  });

  if (!membership) {
    redirect(`/t/${slug}/auth/login`);
  }

  return <>{children}</>;
}

