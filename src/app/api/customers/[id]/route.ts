import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: params.id },
      include: {
        visits: { orderBy: { visitDate: 'desc' } },
        _count: { select: { visits: true } },
      },
    })

    if (!customer) {
      return NextResponse.json({ error: 'Klant niet gevonden' }, { status: 404 })
    }

    return NextResponse.json(customer)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Fout bij ophalen klant' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const { companyName, contactName, email, phone, address, cropType, hectares, notes } = body

    if (!companyName || !contactName || !email || !cropType) {
      return NextResponse.json({ error: 'Verplichte velden ontbreken' }, { status: 400 })
    }

    const customer = await prisma.customer.update({
      where: { id: params.id },
      data: { companyName, contactName, email, phone: phone ?? '', address: address ?? '', cropType, hectares: hectares ?? null, notes: notes ?? null },
    })

    return NextResponse.json(customer)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Fout bij bijwerken klant' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.customer.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Fout bij verwijderen klant' }, { status: 500 })
  }
}
