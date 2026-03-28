import Link from 'next/link'
import { Customer } from '@/types'

interface CustomerCardProps {
  customer: Customer & { _count?: { visits: number } }
  lastVisitDate?: string
}

export function CustomerCard({ customer, lastVisitDate }: CustomerCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 p-4">
        <Link
          href={`/customers/${customer.id}`}
          className="flex items-center gap-3 flex-1 min-w-0"
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-white text-base font-bold">
              {customer.companyName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{customer.companyName}</h3>
            <p className="text-sm text-gray-500 truncate">{customer.contactName}</p>
          </div>
        </Link>

        {/* Nieuw tabblad knop */}
        <Link
          href={`/customers/${customer.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-8 h-8 rounded-xl text-gray-300 hover:text-brand-500 hover:bg-brand-50 active:bg-brand-100 transition-colors flex-shrink-0"
          aria-label="Open in nieuw tabblad"
          title="Open in nieuw tabblad"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
        </Link>
      </div>

      <div className="flex items-center gap-3 px-4 pb-3 -mt-1">
        <span className="inline-block text-xs font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
          {customer.cropType}
        </span>
        {customer.hectares && (
          <span className="text-xs text-gray-400">🌾 {customer.hectares} ha</span>
        )}
        {customer._count !== undefined && (
          <span className="text-xs text-gray-400 ml-auto">
            {customer._count.visits} bezoek{customer._count.visits !== 1 ? 'en' : ''}
          </span>
        )}
        {lastVisitDate && (
          <span className="text-xs text-gray-400">{formatDate(lastVisitDate)}</span>
        )}
      </div>
    </div>
  )
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'short',
  })
}
