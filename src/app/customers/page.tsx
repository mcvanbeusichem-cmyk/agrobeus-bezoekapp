import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/layout/PageHeader'
import { CustomerCard } from '@/components/customers/CustomerCard'
import { EmptyState } from '@/components/ui/EmptyState'

export const metadata: Metadata = {
  title: 'Klanten',
}

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: { search?: string; cropType?: string }
}) {
  const search = searchParams.search ?? ''
  const cropType = searchParams.cropType ?? ''

  const customers = await prisma.customer.findMany({
    where: {
      AND: [
        search
          ? {
              OR: [
                { companyName: { contains: search, mode: 'insensitive' } },
                { contactName: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {},
        cropType ? { cropType: { contains: cropType, mode: 'insensitive' } } : {},
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

  return (
    <div className="pb-24">
      <PageHeader
        title="Klanten"
        showLogo={true}
        action={
          <Link
            href="/customers/new"
            className="flex items-center justify-center w-10 h-10 bg-brand-500 text-white rounded-xl"
            aria-label="Klant toevoegen"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </Link>
        }
      />

      {/* Zoekbalk */}
      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <form method="GET">
          <input
            type="search"
            name="search"
            defaultValue={search}
            placeholder="Zoek op naam of contactpersoon..."
            className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-base placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:bg-white transition-colors"
          />
        </form>
      </div>

      <div className="px-4 pt-3 space-y-2">
        {customers.length === 0 ? (
          <EmptyState
            icon="🌱"
            title={search ? 'Geen klanten gevonden' : 'Nog geen klanten'}
            description={search ? `Geen resultaten voor "${search}"` : 'Voeg je eerste klant toe om te beginnen.'}
            action={
              !search ? (
                <Link
                  href="/customers/new"
                  className="inline-flex items-center gap-2 bg-brand-500 text-white px-5 py-3 rounded-xl font-medium text-sm"
                >
                  Eerste klant toevoegen
                </Link>
              ) : undefined
            }
          />
        ) : (
          <>
            <p className="text-xs text-gray-400 pb-1">
              {customers.length} klant{customers.length !== 1 ? 'en' : ''}
              {search && ` voor "${search}"`}
            </p>
            {customers.map((customer) => (
              <CustomerCard
                key={customer.id}
                customer={customer}
                lastVisitDate={customer.visits[0]?.visitDate}
              />
            ))}
          </>
        )}
      </div>
    </div>
  )
}
