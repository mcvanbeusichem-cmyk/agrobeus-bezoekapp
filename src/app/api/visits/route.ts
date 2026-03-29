import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const customerId = searchParams.get('customerId')
    const status = searchParams.get('status')

    const visits = await prisma.visit.findMany({
      where: {
        AND: [
          customerId ? { customerId } : {},
          status ? { status } : {},
        ],
      },
      include: { customer: true },
      orderBy: [{ visitDate: 'desc' }, { visitTime: 'desc' }],
    })

    return NextResponse.json(visits)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Fout bij ophalen bezoeken' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { customerId, visitDate, visitTime, title, report, advice, actionPoints, followUpDate, status, latitude, longitude } = body

    if (!customerId || !visitDate || !visitTime || !title || !report) {
      return NextResponse.json({ error: 'Verplichte velden ontbreken' }, { status: 400 })
    }

    const visit = await prisma.visit.create({
      data: {
        customerId,
        visitDate,
        visitTime,
        title,
        report,
        advice: advice || null,
        actionPoints: actionPoints || null,
        followUpDate: followUpDate || null,
        status: status ?? 'concept',
        latitude: latitude ?? null,
        longitude: longitude ?? null,
      },
      include: { customer: true },
    })

    return NextResponse.json(visit, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Fout bij aanmaken bezoek' }, { status: 500 })
  }
}
