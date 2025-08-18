import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(_: Request, { params }: { params: { company: string; email: string } }) {
  if (process.env.NODE_ENV === 'production') return new NextResponse('Not available', { status: 404 })
  const slug = (params.company || '').toLowerCase()
  const email = decodeURIComponent(params.email)

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const admin = createClient(url, serviceKey)

  const { data: cdata, error: cerr } = await admin.rpc('resolve_company_by_login', { _login: slug })
  if (cerr) return new NextResponse(cerr.message, { status: 400 })
  const company = Array.isArray(cdata) ? (cdata as any)[0] : (cdata as any)
  if (!company?.id) return new NextResponse('Company not found', { status: 404 })

  const { data: profile, error: perr } = await admin
    .schema('revvten')
    .from('profiles')
    .select('user_id, company_id, email, department, role, display_name, created_at')
    .eq('company_id', company.id)
    .eq('email', email)
    .maybeSingle()
  if (perr) return new NextResponse(perr.message, { status: 400 })

  return NextResponse.json({ ok: true, company: { id: company.id, slug }, profile })
}


