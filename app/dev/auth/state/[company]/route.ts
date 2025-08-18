import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { fetchCompanyBySlug } from '@/lib/tenant/fetchCompany'

export async function GET(_: Request, { params }: { params: { company: string } }) {
  const supabase = createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  const company = await fetchCompanyBySlug(params.company)

  const { data: profile } = await supabase
    .from('revvten.profiles')
    .select('user_id, company_id, department, display_name, role')
    .eq('user_id', user?.id || '')
    .maybeSingle()

  const { data: membership } = await supabase
    .from('revvten.company_users')
    .select('company_id')
    .eq('user_id', user?.id || '')
    .eq('company_id', company?.id || '')
    .maybeSingle()

  return NextResponse.json({
    uid: user?.id ?? null,
    companySlug: params.company,
    companyId: company?.id ?? null,
    profile,
    membership: !!membership,
  })
}


