import { NextResponse } from 'next/server';
import { fetchCompanyBySlug } from '@/lib/tenant/fetchCompany';

export async function GET(_: Request, { params }: { params: { company: string } }) {
	const c = await fetchCompanyBySlug(params.company);
	return NextResponse.json({ ok: !!c, company: c, slug: params.company });
}


