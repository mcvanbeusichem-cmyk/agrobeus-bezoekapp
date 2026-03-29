'use client'

import { useRouter } from 'next/navigation'

interface BackButtonProps {
  fallbackHref?: string
  label?: string
}

export function BackButton({ fallbackHref = '/', label }: BackButtonProps) {
  const router = useRouter()

  function handleBack() {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push(fallbackHref)
    }
  }

  return (
    <button
      onClick={handleBack}
      className="flex items-center justify-center w-10 h-10 -ml-2 text-brand-600 rounded-xl hover:bg-brand-50 active:bg-brand-100 transition-colors"
      aria-label={label ?? 'Terug'}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
      </svg>
    </button>
  )
}
