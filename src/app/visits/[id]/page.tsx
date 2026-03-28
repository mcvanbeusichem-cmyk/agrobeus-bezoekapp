'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Visit, Customer } from '@/types'

type VisitWithCustomer = Visit & { customer: Customer }

export default function VisitDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [visit, setVisit] = useState<VisitWithCustomer | null>(null)
  const [loading, setLoading] = useState(true)
  const [emailLoading, setEmailLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  useEffect(() => {
    fetch(`/api/visits/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        setVisit(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [params.id])

  async function handleSendEmail() {
    if (!visit) return
    setEmailLoading(true)
    try {
      const res = await fetch(`/api/visits/${visit.id}/email`, { method: 'POST' })
      if (res.ok) {
        setEmailSent(true)
        setVisit((prev) => prev ? { ...prev, status: 'verzonden' } : prev)
      } else {
        alert('Er ging iets mis bij het versturen van de e-mail')
      }
    } catch {
      alert('Er ging iets mis bij het versturen van de e-mail')
    } finally {
      setEmailLoading(false)
    }
  }

  async function handleDelete() {
    if (!visit || !confirm('Bezoek verwijderen?')) return
    await fetch(`/api/visits/${visit.id}`, { method: 'DELETE' })
    router.push(`/customers/${visit.customerId}`)
  }

  if (loading) {
    return (
      <div className="pb-24">
        <PageHeader title="Bezoek" backHref="/customers" />
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        </div>
      </div>
    )
  }

  if (!visit) {
    return (
      <div className="pb-24">
        <PageHeader title="Niet gevonden" backHref="/customers" />
        <div className="text-center py-20 text-gray-400">Bezoek niet gevonden</div>
      </div>
    )
  }

  const formattedDate = new Date(visit.visitDate).toLocaleDateString('nl-NL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="pb-24">
      <PageHeader
        title={visit.title}
        backHref={`/customers/${visit.customerId}`}
        backLabel={visit.customer.companyName}
        action={
          <Link
            href={`/visits/${visit.id}/edit`}
            className="text-sm font-medium text-brand-600 px-3 py-2 rounded-xl hover:bg-brand-50 active:bg-brand-100 transition-colors"
          >
            Bewerken
          </Link>
        }
      />

      <div className="px-4 mt-4 space-y-4">
        {/* Meta info */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <Link
                href={`/customers/${visit.customerId}`}
                className="text-brand-600 font-semibold text-base"
              >
                {visit.customer.companyName}
              </Link>
              <p className="text-sm text-gray-500">{visit.customer.contactName}</p>
            </div>
            <StatusBadge status={visit.status as any} />
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
            </svg>
            <span className="capitalize">{formattedDate}</span>
            <span>·</span>
            <span>{visit.visitTime} uur</span>
          </div>

          {visit.emailedAt && (
            <p className="text-xs text-gray-400 mt-2">
              Verstuurd op{' '}
              {new Date(visit.emailedAt).toLocaleDateString('nl-NL', {
                day: 'numeric',
                month: 'long',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          )}
        </div>

        {/* Verslag */}
        <Section title="Verslag">
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{visit.report}</p>
        </Section>

        {/* Advies */}
        {visit.advice && (
          <Section title="Advies">
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{visit.advice}</p>
          </Section>
        )}

        {/* Actiepunten */}
        {visit.actionPoints && (
          <Section title="Actiepunten">
            <div className="space-y-2">
              {visit.actionPoints.split('\n').filter(Boolean).map((point, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 flex-shrink-0" />
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {point.replace(/^[-•]\s*/, '')}
                  </p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Vervolgafspraak */}
        {visit.followUpDate && (
          <div className="bg-brand-50 border border-brand-200 rounded-2xl p-4">
            <p className="text-xs font-semibold text-brand-700 uppercase tracking-wide mb-1">Vervolgafspraak</p>
            <p className="text-sm font-semibold text-brand-800">
              {new Date(visit.followUpDate).toLocaleDateString('nl-NL', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
        )}

        {/* Mail knop */}
        {emailSent ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
            <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-green-800">E-mail verstuurd</p>
              <p className="text-xs text-green-600">Naar {visit.customer.email}</p>
            </div>
          </div>
        ) : (
          <Button
            onClick={handleSendEmail}
            loading={emailLoading}
            size="lg"
            fullWidth
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
            Verslag mailen naar {visit.customer.contactName}
          </Button>
        )}

        {/* Verwijder knop */}
        <button
          onClick={handleDelete}
          className="w-full text-center text-sm text-red-500 py-3 rounded-xl hover:bg-red-50 active:bg-red-100 transition-colors"
        >
          Bezoek verwijderen
        </button>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">{title}</h3>
      {children}
    </div>
  )
}
