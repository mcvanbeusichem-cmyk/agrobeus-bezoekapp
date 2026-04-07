'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'

interface PrintActionsProps {
  filename: string
}

export function PrintActions({ filename }: PrintActionsProps) {
  const params = useParams()
  const visitId = params?.id as string
  const [downloading, setDownloading] = useState(false)

  async function handleDownloadPdf() {
    setDownloading(true)
    try {
      const res = await fetch(`/api/visits/${visitId}/pdf`)
      if (!res.ok) throw new Error('PDF generatie mislukt')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert('PDF generatie mislukt. Probeer opnieuw.')
      console.error(err)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="no-print" style={{ display: 'flex', gap: '12px', padding: '16px', justifyContent: 'center' }}>
      <button
        onClick={() => window.close()}
        style={{
          padding: '10px 20px',
          border: '1px solid #ccc',
          borderRadius: '8px',
          background: 'white',
          cursor: 'pointer',
          fontSize: '14px',
        }}
      >
        Sluiten
      </button>
      <button
        onClick={handleDownloadPdf}
        disabled={downloading}
        style={{
          padding: '10px 20px',
          border: 'none',
          borderRadius: '8px',
          background: downloading ? '#6b9e6b' : '#2d6a2d',
          color: 'white',
          cursor: downloading ? 'not-allowed' : 'pointer',
          fontSize: '14px',
          fontWeight: '600',
        }}
      >
        {downloading ? 'PDF genereren...' : 'Opslaan als PDF'}
      </button>
    </div>
  )
}
