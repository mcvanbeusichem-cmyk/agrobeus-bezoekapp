'use client'

import { useState, useEffect, useRef } from 'react'
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
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const [currentVisitId, setCurrentVisitId] = useState<string | undefined>(visitId)
  const [error, setError] = useState<string | null>(null)
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isSaving = useRef(false)
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationCaptured, setLocationCaptured] = useState(false)
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
    latitude: initialData?.latitude ?? null as number | null,
    longitude: initialData?.longitude ?? null as number | null,
  })

  // Auto-save: 3 seconden na laatste wijziging
  useEffect(() => {
    if (!form.customerId || !form.title) return
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(async () => {
      if (isSaving.current) return
      isSaving.current = true
      setSaving(true)
      try {
        const isUpdate = !!currentVisitId
        const url = isUpdate ? `/api/visits/${currentVisitId}` : '/api/visits'
        const method = isUpdate ? 'PUT' : 'POST'
        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, status: 'concept' }),
        })
        if (res.ok) {
          const visit = await res.json()
          setCurrentVisitId(visit.id)
          setSavedAt(new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }))
        }
      } finally {
        setSaving(false)
        isSaving.current = false
      }
    }, 3000)
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form])

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleGetLocation() {
    if (!navigator.geolocation) {
      alert('Geolocatie wordt niet ondersteund door deze browser')
      return
    }
    setLocationLoading(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((prev) => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }))
        setLocationLoading(false)
        setLocationCaptured(true)
      },
      (err) => {
        console.error(err)
        setLocationLoading(false)
        alert('Kon locatie niet bepalen. Controleer de locatierechten in de browserinstellingen.')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  async function handleSaveDraft() {
    setSaving(true)
    setError(null)
    try {
      const isUpdate = !!currentVisitId
      const url = isUpdate ? `/api/visits/${currentVisitId}` : '/api/visits'
      const method = isUpdate ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, status: 'concept' }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Er ging iets mis')
      }
      const visit = await res.json()
      setCurrentVisitId(visit.id)
      setSavedAt(new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er ging iets mis')
    } finally {
      setSaving(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const url = currentVisitId ? `/api/visits/${currentVisitId}` : '/api/visits'
      const method = currentVisitId ? 'PUT' : 'POST'

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

      {/* GPS Locatie */}
      <div>
        <label className={labelClass}>Locatie</label>
        {locationCaptured && form.latitude != null && form.longitude != null ? (
          <div className="flex items-center gap-3">
            <div className="flex-1 rounded-xl bg-green-50 border border-green-200 px-4 py-3 flex items-center gap-2">
              <span className="text-green-600">📍</span>
              <div>
                <p className="text-sm font-medium text-green-800">Locatie vastgelegd</p>
                <p className="text-xs text-green-600">
                  {form.latitude.toFixed(5)}, {form.longitude.toFixed(5)}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setForm((prev) => ({ ...prev, latitude: null, longitude: null }))
                setLocationCaptured(false)
              }}
              className="rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm text-gray-500 hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              Wissen
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleGetLocation}
            disabled={locationLoading}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-base text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-60"
          >
            {locationLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                <span>Locatie bepalen...</span>
              </>
            ) : (
              <>
                <span>📍</span>
                <span>Locatie vastleggen</span>
              </>
            )}
          </button>
        )}
        {initialData?.latitude != null && !locationCaptured && (
          <p className="mt-1.5 text-xs text-gray-400">
            Huidige locatie: {initialData.latitude?.toFixed(5)}, {initialData.longitude?.toFixed(5)}
          </p>
        )}
      </div>

      {/* Concept opslaan */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleSaveDraft}
          disabled={saving || !form.title || !form.customerId}
          className="inline-flex items-center gap-2 text-sm text-brand-600 font-medium disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
              Opslaan...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Concept opslaan
            </>
          )}
        </button>
        {saving && (
          <span className="text-xs text-gray-400">Opslaan...</span>
        )}
        {savedAt && !saving && (
          <span className="text-xs text-gray-400">Automatisch opgeslagen om {savedAt}</span>
        )}
      </div>

      <div className="pt-1 pb-safe-bottom flex gap-3">
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
