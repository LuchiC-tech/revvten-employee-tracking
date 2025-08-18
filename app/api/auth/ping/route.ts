import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const supabase = createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  return NextResponse.json({ ok: !!user, userId: user?.id || null })
}


