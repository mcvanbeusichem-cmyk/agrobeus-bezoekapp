'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import * as XLSX from 'xlsx'

export default function ImportCustomersPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ message: string; created: string[]; skipped: string[] } | null>(null)
  const [error, setError] = useState<string | null>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) {
      setFile(f)
      setResult(null)
      setError(null)
    }
  }

  function downloadTemplate() {
    const template = [
      {
        Bedrijfsnaam: 'Voorbeeld Fruitteler BV',
        Contactpersoon: 'Jan de Vries',
        Email: 'jan@voorbeeld.nl',
        Telefoon: '06-12345678',
        Adres: 'Fruitlaan 1, 4000 AB Tiel',
        Teelt: 'Appels',
        Hectares: 15,
        Notities: 'Biologisch gecertificeerd',
      },
    ]
    const ws = XLSX.utils.json_to_sheet(template)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Klanten')
    XLSX.writeFile(wb, 'agrobeus-klanten-template.xlsx')
  }

  async function handleImport() {
    if (!file) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/customers/import', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Er ging iets mis')
        return
      }

      setResult(data)
    } catch {
      setError('Er ging iets mis bij het importeren')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pb-24">
      <PageHeader
        title="Klanten importeren"
        backHref="/customers"
        backLabel="Klanten"
        useBackButton={true}
      />

      <div className="px-4 mt-4 space-y-4">
        {/* Uitleg */}
        <div className="bg-brand-50 border border-brand-200 rounded-2xl p-4">
          <p className="text-sm font-semibold text-brand-800 mb-1">Hoe werkt het?</p>
          <ol className="text-sm text-brand-700 space-y-1 list-decimal list-inside">
            <li>Download het voorbeeldbestand</li>
            <li>Vul je klantgegevens in</li>
            <li>Upload het ingevulde bestand</li>
            <li>Klik op Importeren</li>
          </ol>
        </div>

        {/* Template downloaden */}
        <button
          onClick={downloadTemplate}
          className="w-full flex items-center justify-center gap-3 rounded-2xl border border-gray-300 bg-white px-4 py-4 text-gray-700 text-base font-medium hover:bg-gray-50 active:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Voorbeeldbestand downloaden (.xlsx)
        </button>

        {/* Bestand uploaden */}
        <div>
          <label
            className="flex items-center justify-center gap-3 w-full rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-base text-gray-600 cursor-pointer hover:bg-gray-100 active:bg-gray-200 transition-colors"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="sr-only"
              onChange={handleFileChange}
            />
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            {file ? (
              <span className="text-brand-600 font-medium">{file.name}</span>
            ) : (
              <span>Kies Excel bestand (.xlsx)</span>
            )}
          </label>
        </div>

        {/* Foutmelding */}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Resultaat */}
        {result && (
          <div className="rounded-2xl bg-green-50 border border-green-200 p-4 space-y-2">
            <p className="text-sm font-semibold text-green-800">{result.message}</p>
            {result.skipped.length > 0 && (
              <p className="text-xs text-green-600">
                Overgeslagen (onvolledige gegevens): {result.skipped.join(', ')}
              </p>
            )}
            <Button
              onClick={() => router.push('/customers')}
              size="lg"
              fullWidth
              className="mt-2"
            >
              Bekijk klanten
            </Button>
          </div>
        )}

        {/* Importeer knop */}
        {file && !result && (
          <Button
            onClick={handleImport}
            loading={loading}
            size="lg"
            fullWidth
          >
            {loading ? 'Importeren...' : `Importeer ${file.name}`}
          </Button>
        )}
      </div>
    </div>
  )
}
