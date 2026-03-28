'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Customer } from '@/types'

interface CustomerFormProps {
  initialData?: Partial<Customer>
  customerId?: string
}

export function CustomerForm({ initialData, customerId }: CustomerFormProps) {
  const router = useRouter()
  const isEditing = !!customerId

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    companyName: initialData?.companyName ?? '',
    contactName: initialData?.contactName ?? '',
    email: initialData?.email ?? '',
    phone: initialData?.phone ?? '',
    address: initialData?.address ?? '',
    cropType: initialData?.cropType ?? '',
    hectares: initialData?.hectares?.toString() ?? '',
    notes: initialData?.notes ?? '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const url = isEditing ? `/api/customers/${customerId}` : '/api/customers'
      const method = isEditing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          hectares: form.hectares ? parseFloat(form.hectares) : null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Er ging iets mis')
      }

      const customer = await res.json()
      router.push(`/customers/${customer.id}`)
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

      <div>
        <label htmlFor="companyName" className={labelClass}>Bedrijfsnaam *</label>
        <input
          id="companyName"
          name="companyName"
          type="text"
          required
          value={form.companyName}
          onChange={handleChange}
          className={inputClass}
          placeholder="Fruitbedrijf De Boomgaard"
          autoComplete="organization"
        />
      </div>

      <div>
        <label htmlFor="contactName" className={labelClass}>Contactpersoon *</label>
        <input
          id="contactName"
          name="contactName"
          type="text"
          required
          value={form.contactName}
          onChange={handleChange}
          className={inputClass}
          placeholder="Jan de Vries"
          autoComplete="name"
        />
      </div>

      <div>
        <label htmlFor="email" className={labelClass}>E-mailadres *</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={form.email}
          onChange={handleChange}
          className={inputClass}
          placeholder="jan@bedrijf.nl"
          autoComplete="email"
          inputMode="email"
        />
      </div>

      <div>
        <label htmlFor="phone" className={labelClass}>Telefoonnummer</label>
        <input
          id="phone"
          name="phone"
          type="tel"
          value={form.phone}
          onChange={handleChange}
          className={inputClass}
          placeholder="06-12345678"
          autoComplete="tel"
          inputMode="tel"
        />
      </div>

      <div>
        <label htmlFor="address" className={labelClass}>Adres</label>
        <input
          id="address"
          name="address"
          type="text"
          value={form.address}
          onChange={handleChange}
          className={inputClass}
          placeholder="Fruitlaan 14, 6674 BD Herveld"
          autoComplete="street-address"
        />
      </div>

      <div>
        <label htmlFor="cropType" className={labelClass}>Teelt / gewas *</label>
        <input
          id="cropType"
          name="cropType"
          type="text"
          required
          value={form.cropType}
          onChange={handleChange}
          className={inputClass}
          placeholder="Appels (Elstar, Jonagold)"
        />
      </div>

      <div>
        <label htmlFor="hectares" className={labelClass}>Aantal hectare</label>
        <input
          id="hectares"
          name="hectares"
          type="number"
          step="0.1"
          min="0"
          value={form.hectares}
          onChange={handleChange}
          className={inputClass}
          placeholder="42.5"
          inputMode="decimal"
        />
      </div>

      <div>
        <label htmlFor="notes" className={labelClass}>Notities</label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          value={form.notes}
          onChange={handleChange}
          className={inputClass}
          placeholder="Bijzonderheden, achtergrond, aandachtspunten..."
        />
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
        <Button
          type="submit"
          size="lg"
          loading={loading}
          className="flex-1"
        >
          {isEditing ? 'Opslaan' : 'Klant toevoegen'}
        </Button>
      </div>
    </form>
  )
}
