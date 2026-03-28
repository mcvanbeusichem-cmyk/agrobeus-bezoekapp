import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/layout/PageHeader'
import { VisitCard } from '@/components/visits/VisitCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { DeleteCustomerButton } from '@/components/customers/DeleteCustomerButton'

export const metadata: Metadata = { title: 'Klant' }

export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
  const customer = await prisma.customer.findUnique({
    where: { id: params.id },
    include: {
      visits: { orderBy: [{ visitDate: 'desc' }, { visitTime: 'desc' }] },
      _count: { select: { visits: true } },
    },
  })

  if (!customer) notFound()

  return (
    <div className="pb-24">
      <PageHeader
        title={customer.companyName}
        backHref="/customers"
        backLabel="Klanten"
        action={
          <div className="flex items-center gap-1">
            <Link
              href={`/customers/${customer.id}/edit`}
              className="flex items-center justify-center w-10 h-10 text-brand-600 rounded-xl hover:bg-brand-50 active:bg-brand-100 transition-colors"
              aria-label="Bewerken"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
            </Link>
            <DeleteCustomerButton customerId={customer.id} customerName={customer.companyName} />
          </div>
        }
      />

      {/* Hero kaart */}
      <div className="mx-4 mt-4 bg-gradient-to-br from-brand-500 to-brand-700 rounded-3xl p-5 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
            <span className="text-white text-2xl font-bold">
              {customer.companyName.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-white text-xl leading-tight truncate">{customer.companyName}</h2>
            {customer.contactName && (
              <p className="text-brand-100 text-sm mt-0.5">{customer.contactName}</p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 bg-white/20 text-white text-xs font-medium px-2.5 py-1 rounded-full">
                🌱 {customer.cropType}
              </span>
              {customer.hectares && (
                <span className="inline-flex items-center bg-white/20 text-white text-xs font-medium px-2.5 py-1 rounded-full">
                  {customer.hectares} ha
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-white/15 rounded-2xl p-3 text-center">
            <div className="text-2xl font-bold text-white">{customer._count.visits}</div>
            <div className="text-brand-100 text-xs mt-0.5">Bezoeken</div>
          </div>
          <div className="bg-white/15 rounded-2xl p-3 text-center">
            <div className="text-sm font-semibold text-white leading-tight">
              {customer.visits[0]
                ? new Date(customer.visits[0].visitDate).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })
                : '—'}
            </div>
            <div className="text-brand-100 text-xs mt-0.5">Laatste bezoek</div>
          </div>
        </div>
      </div>

      {/* Contactgegevens */}
      <div className="mx-4 mt-4 bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
        {customer.email && (
          <a
            href={`mailto:${customer.email}`}
            className="flex items-center gap-3 px-4 py-4 border-b border-gray-50 active:bg-gray-50 transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              <svg className="w-4.5 h-4.5 text-blue-500" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400 font-medium">E-mail</p>
              <p className="text-sm text-gray-800 truncate">{customer.email}</p>
            </div>
            <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </a>
        )}
        {customer.phone && (
          <a
            href={`tel:${customer.phone}`}
            className="flex items-center gap-3 px-4 py-4 border-b border-gray-50 active:bg-gray-50 transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
              <svg className="w-4.5 h-4.5 text-green-500" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400 font-medium">Telefoon</p>
              <p className="text-sm text-gray-800">{customer.phone}</p>
            </div>
            <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </a>
        )}
        {customer.address && (
          <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-50">
            <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
              <svg className="w-4.5 h-4.5 text-orange-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400 font-medium">Adres</p>
              <p className="text-sm text-gray-800">{customer.address}</p>
            </div>
          </div>
        )}
        {customer.notes && (
          <div className="px-4 py-4">
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center mb-2">
              <svg className="w-4.5 h-4.5 text-amber-500" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
              </svg>
            </div>
            <p className="text-xs text-gray-400 font-medium mb-1">Notities</p>
            <p className="text-sm text-gray-600 leading-relaxed">{customer.notes}</p>
          </div>
        )}
      </div>

      {/* Actie knop – Nieuw bezoek */}
      <div className="mx-4 mt-4">
        <Link
          href={`/visits/new?customerId=${customer.id}`}
          className="flex items-center justify-center gap-2 w-full bg-brand-500 text-white rounded-2xl py-4 font-semibold text-base active:bg-brand-600 transition-colors shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nieuw bezoek registreren
        </Link>
      </div>

      {/* Bezoekhistorie */}
      <div className="mx-4 mt-6">
        <h2 className="text-base font-bold text-gray-900 mb-3">
          Bezoekhistorie
          {customer._count.visits > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-400">({customer._count.visits})</span>
          )}
        </h2>

        {customer.visits.length === 0 ? (
          <EmptyState
            icon="📝"
            title="Nog geen bezoeken"
            description="Registreer het eerste bezoek met de knop hierboven."
          />
        ) : (
          <div className="space-y-2">
            {customer.visits.map((visit) => (
              <VisitCard key={visit.id} visit={visit as any} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
