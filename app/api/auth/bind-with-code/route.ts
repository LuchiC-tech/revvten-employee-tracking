import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(req: Request) {
  try {
    const { companyLoginId, code, displayName, department } = await req.json()
    if (!companyLoginId || !code) {
      return new NextResponse('companyLoginId and code required', { status: 400 })
    }

    const supabase = createSupabaseServer()
    const { data, error } = await supabase.rpc('bind_profile_with_code', {
      _company_login_id: String(companyLoginId).toLowerCase(),
      _plain_code: code,
      _display_name: displayName ?? null,
      _department: department ?? null,
    } as any)
    if (error) {
      console.error('[bind-with-code] rpc error', error)
      return new NextResponse(error.message, { status: 400 })
    }

    // RPC returns table (session_role text) — normalize whether array or single row
    const session_role = Array.isArray(data)
      ? (data as any)[0]?.session_role || 'employee'
      : (data as any)?.session_role || 'employee'

    const res = NextResponse.json({ role: session_role })
    res.headers.set('x-role', session_role)
    return res
  } catch (e: any) {
    console.error('[bind-with-code] exception', e)
    return new NextResponse(e?.message || 'bad request', { status: 400 })
  }
}


