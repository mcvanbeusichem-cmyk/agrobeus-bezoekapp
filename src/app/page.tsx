import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { StatusBadge } from '@/components/ui/Badge'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Dashboard',
}

async function getDashboardData() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split('T')[0]
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
    .toISOString()
    .split('T')[0]

  const [totalCustomers, visitsThisMonth, recentVisits, allCustomers, openActionPoints] =
    await Promise.all([
      prisma.customer.count(),
      prisma.visit.count({ where: { visitDate: { gte: startOfMonth } } }),
      prisma.visit.findMany({
        take: 4,
        orderBy: [{ visitDate: 'desc' }, { visitTime: 'desc' }],
        include: { customer: { select: { id: true, companyName: true } } },
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
      prisma.visit.findMany({
        where: {
          actionPoints: { not: null },
          status: { in: ['concept', 'verzonden'] },
        },
        include: { customer: { select: { id: true, companyName: true } } },
        orderBy: { visitDate: 'desc' },
        take: 3,
      }),
    ])

  const customersNotVisited = allCustomers
    .filter((c) => c.visits.length === 0 || c.visits[0].visitDate < threeMonthsAgo)
    .slice(0, 3)

  return { totalCustomers, visitsThisMonth, recentVisits, customersNotVisited, openActionPoints }
}

export default async function DashboardPage() {
  const { totalCustomers, visitsThisMonth, recentVisits, customersNotVisited, openActionPoints } =
    await getDashboardData()

  const monthName = new Date().toLocaleDateString('nl-NL', { month: 'long' })

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-brand-600 via-brand-500 to-brand-400 pt-safe px-4 pb-8">
        <div className="pt-5 flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-xl flex-shrink-0 overflow-hidden mb-3">
            <Image
              src="/logo.png"
              alt="Agrobeus Consulting"
              width={96}
              height={96}
              className="object-contain p-2"
            />
          </div>
          <h1 className="text-white text-2xl font-bold leading-tight tracking-tight">Agrobeus</h1>
          <p className="text-brand-100 text-sm mt-0.5">BezoekApp</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mt-5">
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
            <div className="text-3xl font-bold text-white">{totalCustomers}</div>
            <div className="text-brand-100 text-sm mt-1">Klanten</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
            <div className="text-3xl font-bold text-white">{visitsThisMonth}</div>
            <div className="text-brand-100 text-sm mt-1">Bezoeken in {monthName}</div>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {/* Snelle actie knoppen */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/visits/new"
            className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col items-center gap-2 active:bg-gray-50 transition-colors shadow-sm"
          >
            <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-700 text-center leading-snug">Nieuw bezoek</span>
          </Link>
          <Link
            href="/customers/new"
            className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col items-center gap-2 active:bg-gray-50 transition-colors shadow-sm"
          >
            <div className="w-10 h-10 bg-earth-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-earth-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-700 text-center leading-snug">Nieuwe klant</span>
          </Link>
        </div>

        {/* Recente bezoeken */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-900">Recente bezoeken</h2>
            <Link href="/customers" className="text-sm text-brand-600 font-medium">Alle klanten</Link>
          </div>

          {recentVisits.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
              <p className="text-gray-400 text-sm">Nog geen bezoeken geregistreerd</p>
              <Link href="/visits/new" className="text-brand-600 text-sm font-medium mt-2 inline-block">
                Eerste bezoek toevoegen →
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentVisits.map((visit) => (
                <Link
                  key={visit.id}
                  href={`/visits/${visit.id}`}
                  className="flex items-center gap-3 bg-white rounded-2xl border border-gray-200 p-4 active:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center flex-shrink-0">
                    <span className="text-brand-700 text-sm font-semibold">
                      {visit.customer.companyName.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{visit.customer.companyName}</p>
                    <p className="text-xs text-gray-500 truncate">{visit.title}</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <StatusBadge status={visit.status as any} />
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(visit.visitDate).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Open actiepunten */}
        {openActionPoints.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-gray-900">Open actiepunten</h2>
              <Link href="/visits/actions" className="text-sm text-brand-600 font-medium">Alle acties</Link>
            </div>
            <div className="space-y-2">
              {openActionPoints.map((visit) => (
                <Link
                  key={visit.id}
                  href={`/visits/${visit.id}`}
                  className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 active:bg-amber-100 transition-colors"
                >
                  <div className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{visit.customer.companyName}</p>
                    <p className="text-xs text-amber-700 mt-0.5 line-clamp-2">{visit.actionPoints}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Klanten lang niet bezocht */}
        {customersNotVisited.length > 0 && (
          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">Lang niet bezocht</h2>
            <div className="space-y-2">
              {customersNotVisited.map((customer) => (
                <Link
                  key={customer.id}
                  href={`/customers/${customer.id}`}
                  className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-3 active:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-gray-500 text-sm font-semibold">
                      {customer.companyName.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm truncate">{customer.companyName}</p>
                    <p className="text-xs text-gray-400">
                      {customer.visits.length === 0
                        ? 'Nog nooit bezocht'
                        : `Laatst: ${new Date(customer.visits[0].visitDate).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long' })}`}
                    </p>
                  </div>
                  <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
