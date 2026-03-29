'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Visit, Customer, Photo } from '@/types'

type VisitWithCustomer = Visit & { customer: Customer; photos: Photo[] }

export default function VisitDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [visit, setVisit] = useState<VisitWithCustomer | null>(null)
  const [loading, setLoading] = useState(true)
  const [emailLoading, setEmailLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [photoUploading, setPhotoUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  function handleWhatsApp() {
    if (!visit) return
    const formattedDate = new Date(visit.visitDate).toLocaleDateString('nl-NL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

    let text = `*Bezoekverslag Agrobeus Consulting*\n\n`
    text += `*Bedrijf:* ${visit.customer.companyName}\n`
    text += `*Contactpersoon:* ${visit.customer.contactName}\n`
    text += `*Datum:* ${formattedDate} om ${visit.visitTime} uur\n`
    text += `*Onderwerp:* ${visit.title}\n\n`
    text += `*Verslag:*\n${visit.report}\n`
    if (visit.advice) {
      text += `\n*Advies:*\n${visit.advice}\n`
    }
    if (visit.actionPoints) {
      text += `\n*Actiepunten:*\n${visit.actionPoints}\n`
    }
    if (visit.followUpDate) {
      const followUp = new Date(visit.followUpDate).toLocaleDateString('nl-NL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
      text += `\n*Vervolgafspraak:* ${followUp}\n`
    }
    text += `\n_Agrobeus Consulting_`

    const encoded = encodeURIComponent(text)
    window.open(`https://wa.me/?text=${encoded}`, '_blank')
  }

  function handlePrint() {
    if (!visit) return
    window.open(`/visits/${visit.id}/print`, '_blank')
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !visit) return

    setPhotoUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('visitId', visit.id)

      const res = await fetch('/api/photos', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error ?? 'Fout bij uploaden foto')
        return
      }

      const photo: Photo = await res.json()
      setVisit((prev) =>
        prev ? { ...prev, photos: [...(prev.photos ?? []), photo] } : prev
      )
    } catch {
      alert('Er ging iets mis bij het uploaden van de foto')
    } finally {
      setPhotoUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleDeletePhoto(photoId: string) {
    if (!confirm('Foto verwijderen?')) return
    try {
      await fetch(`/api/photos/${photoId}`, { method: 'DELETE' })
      setVisit((prev) =>
        prev ? { ...prev, photos: prev.photos.filter((p) => p.id !== photoId) } : prev
      )
    } catch {
      alert('Er ging iets mis bij het verwijderen van de foto')
    }
  }

  if (loading) {
    return (
      <div className="pb-24">
        <PageHeader title="Bezoek" backHref="/customers" useBackButton={true} />
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        </div>
      </div>
    )
  }

  if (!visit) {
    return (
      <div className="pb-24">
        <PageHeader title="Niet gevonden" backHref="/customers" useBackButton={true} />
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
        useBackButton={true}
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

          {/* GPS Locatie link */}
          {visit.latitude != null && visit.longitude != null && (
            <a
              href={`https://www.google.com/maps?q=${visit.latitude},${visit.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center gap-2 text-sm text-brand-600 hover:underline"
            >
              <span>📍</span>
              <span>Bekijk locatie op Google Maps</span>
            </a>
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

        {/* Foto's sectie */}
        <Section title={`Foto's${visit.photos && visit.photos.length > 0 ? ` (${visit.photos.length})` : ''}`}>
          {visit.photos && visit.photos.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mb-3">
              {visit.photos.map((photo) => (
                <div key={photo.id} className="relative group rounded-xl overflow-hidden aspect-square bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    alt={photo.filename}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => handleDeletePhoto(photo.id)}
                    className="absolute top-1.5 right-1.5 bg-black/60 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm hover:bg-black/80 transition-colors"
                    aria-label="Foto verwijderen"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <label
            className={`flex items-center justify-center gap-2 w-full rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-4 text-sm text-gray-600 cursor-pointer hover:bg-gray-100 active:bg-gray-200 transition-colors ${photoUploading ? 'opacity-60 pointer-events-none' : ''}`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handlePhotoUpload}
              disabled={photoUploading}
            />
            {photoUploading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                <span>Uploaden...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                </svg>
                <span>Foto toevoegen</span>
              </>
            )}
          </label>
        </Section>

        {/* WhatsApp knop */}
        <button
          onClick={handleWhatsApp}
          className="w-full flex items-center justify-center gap-3 rounded-2xl px-4 py-4 text-white text-base font-medium transition-opacity hover:opacity-90 active:opacity-80"
          style={{ backgroundColor: '#25D366' }}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Delen via WhatsApp
        </button>

        {/* PDF knop */}
        <button
          onClick={handlePrint}
          className="w-full flex items-center justify-center gap-3 rounded-2xl border border-gray-300 bg-white px-4 py-4 text-gray-700 text-base font-medium hover:bg-gray-50 active:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          Opslaan als PDF
        </button>

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
