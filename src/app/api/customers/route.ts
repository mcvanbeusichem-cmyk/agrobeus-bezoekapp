import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') ?? ''
    const cropType = searchParams.get('cropType') ?? ''

    const customers = await prisma.customer.findMany({
      where: {
        AND: [
          search ? {
            OR: [
              { companyName: { contains: search } },
              { contactName: { contains: search } },
            ],
          } : {},
          cropType ? { cropType: { contains: cropType } } : {},
        ],
      },
      include: {
        _count: { select: { visits: true } },
        visits: {
          orderBy: { visitDate: 'desc' },
          take: 1,
          select: { visitDate: true },
        },
      },
      orderBy: { companyName: 'asc' },
    })

    return NextResponse.json(customers)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Fout bij ophalen klanten' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { companyName, contactName, email, phone, address, cropType, hectares, notes } = body

    if (!companyName || !contactName || !email || !cropType) {
      return NextResponse.json({ error: 'Verplichte velden ontbreken' }, { status: 400 })
    }

    const customer = await prisma.customer.create({
      data: { companyName, contactName, email, phone: phone ?? '', address: address ?? '', cropType, hectares: hectares ?? null, notes: notes ?? null },
    })

    return NextResponse.json(customer, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Fout bij aanmaken klant' }, { status: 500 })
  }
}
