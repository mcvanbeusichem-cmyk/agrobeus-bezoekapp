import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const { password } = await req.json()

  if (!password || password !== process.env.APP_PASSWORD) {
    return NextResponse.json({ error: 'Onjuist wachtwoord' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set('agrobeus_session', password, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 dagen
    path: '/',
  })

  return res
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.delete('agrobeus_session')
  return res
}
