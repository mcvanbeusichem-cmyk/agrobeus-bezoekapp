'use client'

interface PrintActionsProps {
  filename: string
}

export function PrintActions({ filename }: PrintActionsProps) {
  const handlePrint = () => {
    const original = document.title
    document.title = filename
    window.print()
    document.title = original
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
        onClick={handlePrint}
        style={{
          padding: '10px 20px',
          border: 'none',
          borderRadius: '8px',
          background: '#2d6a2d',
          color: 'white',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '600',
        }}
      >
        Afdrukken / Opslaan als PDF
      </button>
    </div>
  )
}
