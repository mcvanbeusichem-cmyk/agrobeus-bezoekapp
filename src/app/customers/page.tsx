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
                { companyName: { contains: search } },
                { contactName: { contains: search } },
              ],
            }
          : {},
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

  const serializedCustomers = customers.map(({ visits, ...c }) => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    lastVisitDate: visits[0]?.visitDate?.toString(),
  }))

  return (
    <div className="pb-24">
      <PageHeader
        title="Klanten"
        showLogo={true}
        action={
          <div className="flex items-center gap-2">
            <Link
              href="/customers/import"
              className="flex items-center justify-center w-10 h-10 bg-white border border-gray-300 text-gray-600 rounded-xl"
              aria-label="Importeren uit Excel"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
            </Link>
            <Link
              href="/customers/new"
              className="flex items-center justify-center w-10 h-10 bg-brand-500 text-white rounded-xl"
              aria-label="Klant toevoegen"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </Link>
          </div>
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
            {serializedCustomers.map((customer) => (
              <CustomerCard
                key={customer.id}
                customer={customer}
                lastVisitDate={customer.lastVisitDate}
              />
            ))}
          </>
        )}
      </div>
    </div>
  )
}
