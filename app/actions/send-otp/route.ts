import { NextResponse } from 'next/server'
import { signInWithOtp } from '@/app/actions/auth'

export async function POST(req: Request) {
  const { email, redirectTo } = await req.json()
  try {
    await signInWithOtp(email, redirectTo)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return new NextResponse(e?.message ?? 'error', { status: 400 })
  }
}


