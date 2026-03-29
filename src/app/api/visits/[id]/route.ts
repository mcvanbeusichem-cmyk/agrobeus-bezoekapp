import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const visit = await prisma.visit.findUnique({
      where: { id: params.id },
      include: { customer: true, photos: true },
    })

    if (!visit) {
      return NextResponse.json({ error: 'Bezoek niet gevonden' }, { status: 404 })
    }

    return NextResponse.json(visit)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Fout bij ophalen bezoek' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const { visitDate, visitTime, title, report, advice, actionPoints, followUpDate, status, latitude, longitude } = body

    if (!visitDate || !visitTime || !title || !report) {
      return NextResponse.json({ error: 'Verplichte velden ontbreken' }, { status: 400 })
    }

    const visit = await prisma.visit.update({
      where: { id: params.id },
      data: {
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
      include: { customer: true, photos: true },
    })

    return NextResponse.json(visit)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Fout bij bijwerken bezoek' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.visit.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Fout bij verwijderen bezoek' }, { status: 500 })
  }
}
