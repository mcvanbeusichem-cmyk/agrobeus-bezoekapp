import Link from 'next/link'
import { Visit, Customer } from '@/types'
import { StatusBadge } from '@/components/ui/Badge'

interface VisitCardProps {
  visit: Visit & { customer?: Customer }
  showCustomer?: boolean
}

export function VisitCard({ visit, showCustomer = false }: VisitCardProps) {
  const formattedDate = new Date(visit.visitDate).toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  const preview = visit.report.length > 100
    ? visit.report.slice(0, 100) + '...'
    : visit.report

  return (
    <Link
      href={`/visits/${visit.id}`}
      className="block bg-white rounded-2xl border border-gray-200 p-4 active:bg-gray-50 transition-colors"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 leading-snug">{visit.title}</h3>
          {showCustomer && visit.customer && (
            <p className="text-sm text-brand-600 font-medium mt-0.5">{visit.customer.companyName}</p>
          )}
        </div>
        <StatusBadge status={visit.status as any} />
      </div>

      <div className="flex items-center gap-3 mb-2">
        <span className="text-xs text-gray-400 flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
          </svg>
          {formattedDate}
        </span>
        <span className="text-xs text-gray-400">{visit.visitTime}</span>
      </div>

      <p className="text-sm text-gray-600 leading-relaxed">{preview}</p>

      {visit.actionPoints && (
        <div className="mt-2 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
          </svg>
          <span className="text-xs text-amber-600 font-medium">Actiepunten aanwezig</span>
        </div>
      )}
    </Link>
  )
}
