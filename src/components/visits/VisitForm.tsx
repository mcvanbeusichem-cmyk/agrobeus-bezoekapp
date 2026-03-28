'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Visit, Customer, VisitStatus } from '@/types'

interface VisitFormProps {
  initialData?: Partial<Visit>
  visitId?: string
  customers?: Customer[]
  preselectedCustomerId?: string
}

const today = new Date().toISOString().split('T')[0]
const now = new Date().toTimeString().slice(0, 5)

export function VisitForm({
  initialData,
  visitId,
  customers = [],
  preselectedCustomerId,
}: VisitFormProps) {
  const router = useRouter()
  const isEditing = !!visitId

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    customerId: initialData?.customerId ?? preselectedCustomerId ?? '',
    visitDate: initialData?.visitDate ?? today,
    visitTime: initialData?.visitTime ?? now,
    title: initialData?.title ?? '',
    report: initialData?.report ?? '',
    advice: initialData?.advice ?? '',
    actionPoints: initialData?.actionPoints ?? '',
    followUpDate: initialData?.followUpDate ?? '',
    status: (initialData?.status ?? 'concept') as VisitStatus,
  })

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const url = isEditing ? `/api/visits/${visitId}` : '/api/visits'
      const method = isEditing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Er ging iets mis')
      }

      const visit = await res.json()
      router.push(`/visits/${visit.id}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er ging iets mis')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = 'w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-colors'
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5'

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-5">
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Klant selecteren (alleen bij nieuw bezoek als niet vooraf geselecteerd) */}
      {!preselectedCustomerId && customers.length > 0 && (
        <div>
          <label htmlFor="customerId" className={labelClass}>Klant *</label>
          <select
            id="customerId"
            name="customerId"
            required
            value={form.customerId}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="">Kies een klant...</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.companyName} – {c.contactName}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Datum en tijd naast elkaar */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="visitDate" className={labelClass}>Datum *</label>
          <input
            id="visitDate"
            name="visitDate"
            type="date"
            required
            value={form.visitDate}
            onChange={handleChange}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="visitTime" className={labelClass}>Tijd *</label>
          <input
            id="visitTime"
            name="visitTime"
            type="time"
            required
            value={form.visitTime}
            onChange={handleChange}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="title" className={labelClass}>Onderwerp / titel *</label>
        <input
          id="title"
          name="title"
          type="text"
          required
          value={form.title}
          onChange={handleChange}
          className={inputClass}
          placeholder="Bijv. Schurftpreventie voorjaar"
        />
      </div>

      <div>
        <label htmlFor="report" className={labelClass}>Bezoekverslag *</label>
        <textarea
          id="report"
          name="report"
          required
          rows={5}
          value={form.report}
          onChange={handleChange}
          className={inputClass}
          placeholder="Wat is besproken, wat is gezien, hoe is de stand van het gewas..."
        />
      </div>

      <div>
        <label htmlFor="advice" className={labelClass}>Advies</label>
        <textarea
          id="advice"
          name="advice"
          rows={3}
          value={form.advice}
          onChange={handleChange}
          className={inputClass}
          placeholder="Aanbevelingen, te nemen maatregelen..."
        />
      </div>

      <div>
        <label htmlFor="actionPoints" className={labelClass}>Actiepunten</label>
        <textarea
          id="actionPoints"
          name="actionPoints"
          rows={3}
          value={form.actionPoints}
          onChange={handleChange}
          className={inputClass}
          placeholder="- Actie 1&#10;- Actie 2&#10;- Actie 3"
        />
      </div>

      <div>
        <label htmlFor="followUpDate" className={labelClass}>Vervolgafspraak</label>
        <input
          id="followUpDate"
          name="followUpDate"
          type="date"
          value={form.followUpDate}
          onChange={handleChange}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="status" className={labelClass}>Status</label>
        <select
          id="status"
          name="status"
          value={form.status}
          onChange={handleChange}
          className={inputClass}
        >
          <option value="concept">Concept</option>
          <option value="verzonden">Verzonden</option>
          <option value="afgerond">Afgerond</option>
        </select>
      </div>

      <div className="pt-2 pb-safe-bottom flex gap-3">
        <Button
          type="button"
          variant="secondary"
          size="lg"
          onClick={() => router.back()}
          className="flex-1"
        >
          Annuleren
        </Button>
        <Button type="submit" size="lg" loading={loading} className="flex-1">
          {isEditing ? 'Opslaan' : 'Bezoek opslaan'}
        </Button>
      </div>
    </form>
  )
}
