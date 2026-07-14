import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split('T')[0]
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
      .toISOString()
      .split('T')[0]

    const [
      totalCustomers,
      visitsThisMonth,
      recentVisits,
      allCustomers,
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.visit.count({
        where: { visitDate: { gte: startOfMonth } },
      }),
      prisma.visit.findMany({
        take: 5,
        orderBy: [{ visitDate: 'desc' }, { visitTime: 'desc' }],
        include: { customer: true },
      }),
      prisma.customer.findMany({
        include: {
          visits: {
            orderBy: { visitDate: 'desc' },
            take: 1,
            select: { visitDate: true },
          },
        },
      }),
    ])

    // Klanten die langer dan 3 maanden niet bezocht zijn
    const customersNotVisited = allCustomers
      .filter((c) => {
        if (c.visits.length === 0) return true
        return c.visits[0].visitDate < threeMonthsAgo
      })
      .slice(0, 5)

    // Open actiepunten (concept bezoeken met actiepunten)
    const openActionPoints = await prisma.visit.findMany({
      where: {
        actionPoints: { not: null },
        status: { in: ['concept', 'verzonden'] },
      },
      include: { customer: true },
      orderBy: { visitDate: 'desc' },
      take: 5,
    })

    return NextResponse.json({
      totalCustomers,
      visitsThisMonth,
      recentVisits,
      customersNotVisited,
      openActionPoints,
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Fout bij ophalen dashboard' }, { status: 500 })
  }
}
