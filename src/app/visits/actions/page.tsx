import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatusBadge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Actiepunten',
}

export default async function ActionsPage() {
  const visits = await prisma.visit.findMany({
    where: {
      actionPoints: { not: null },
      status: { in: ['concept', 'verzonden'] },
    },
    include: { customer: { select: { id: true, companyName: true } } },
    orderBy: [{ visitDate: 'desc' }],
  })

  return (
    <div className="pb-24">
      <PageHeader title="Open actiepunten" showLogo={true} />

      <div className="px-4 pt-4 space-y-2">
        {visits.length === 0 ? (
          <EmptyState
            icon="✅"
            title="Geen open actiepunten"
            description="Alle actiepunten zijn afgehandeld of er zijn nog geen bezoeken geregistreerd."
          />
        ) : (
          <>
            <p className="text-xs text-gray-400 pb-1">
              {visits.length} bezoek{visits.length !== 1 ? 'en' : ''} met openstaande acties
            </p>
            {visits.map((visit) => (
              <Link
                key={visit.id}
                href={`/visits/${visit.id}`}
                className="block bg-white rounded-2xl border border-gray-200 p-4 active:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{visit.customer.companyName}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{visit.title}</p>
                  </div>
                  <StatusBadge status={visit.status as any} />
                </div>
                <p className="text-xs text-gray-400 mb-2">
                  {new Date(visit.visitDate).toLocaleDateString('nl-NL', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
                <div className="bg-amber-50 rounded-xl p-3 space-y-1.5">
                  {visit.actionPoints!.split('\n').filter(Boolean).slice(0, 3).map((point, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                      <p className="text-xs text-amber-800 leading-snug">
                        {point.replace(/^[-•]\s*/, '')}
                      </p>
                    </div>
                  ))}
                </div>
              </Link>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
