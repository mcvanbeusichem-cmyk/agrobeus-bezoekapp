import { VisitStatus } from '@/types'

const statusConfig: Record<VisitStatus, { label: string; classes: string }> = {
  concept:   { label: 'Concept',   classes: 'bg-amber-100 text-amber-800' },
  verzonden: { label: 'Verzonden', classes: 'bg-blue-100 text-blue-800' },
  afgerond:  { label: 'Afgerond', classes: 'bg-green-100 text-green-800' },
}

export function StatusBadge({ status }: { status: VisitStatus }) {
  const config = statusConfig[status] ?? statusConfig.concept
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.classes}`}>
      {config.label}
    </span>
  )
}
