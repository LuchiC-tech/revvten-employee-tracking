import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'

export async function GET(_: Request, { params }: { params: { company: string } }) {
	if (process.env.NODE_ENV === 'production') {
		return new NextResponse('Not available', { status: 404 })
	}
	const supabase = createSupabaseServer()
	const { data: { user } } = await supabase.auth.getUser()
	if (!user) return new NextResponse('No session', { status: 401 })

	const { data: companyData } = await supabase.rpc('resolve_company_by_login', { _login: params.company.toLowerCase() })
	const company = Array.isArray(companyData) ? (companyData as any)[0] : (companyData as any)
	if (!company?.id) return new NextResponse('Company not found', { status: 404 })

	const { data: profile } = await supabase
		.from('revvten.profiles')
		.select('user_id, company_id, email, role, department')
		.eq('user_id', user.id)
		.eq('company_id', company.id)
		.maybeSingle()

	return NextResponse.json({ ok: true, company: { id: company.id, slug: params.company }, profile, user: { id: user.id, email: user.email } })
}


