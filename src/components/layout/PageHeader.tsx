import Link from 'next/link'
import Image from 'next/image'

interface PageHeaderProps {
  title: string
  backHref?: string
  backLabel?: string
  action?: React.ReactNode
  showLogo?: boolean
}

export function PageHeader({ title, backHref, backLabel, action, showLogo = false }: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 pt-safe">
      <div className="flex items-center gap-3 px-4 h-14">
        {backHref && (
          <Link
            href={backHref}
            className="flex items-center justify-center w-10 h-10 -ml-2 text-brand-600 rounded-xl hover:bg-brand-50 active:bg-brand-100 transition-colors"
            aria-label={backLabel ?? 'Terug'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>
        )}
        {showLogo && !backHref && (
          <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-brand-50 flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="Agrobeus"
              width={32}
              height={32}
              className="object-contain p-0.5"
            />
          </div>
        )}
        <h1 className="flex-1 text-lg font-semibold text-gray-900 truncate">{title}</h1>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </header>
  )
}
