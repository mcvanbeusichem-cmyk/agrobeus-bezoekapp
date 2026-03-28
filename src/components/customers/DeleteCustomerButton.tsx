'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface DeleteCustomerButtonProps {
  customerId: string
  customerName: string
}

export function DeleteCustomerButton({ customerId, customerName }: DeleteCustomerButtonProps) {
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleDelete() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/customers/${customerId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Verwijderen mislukt')
      router.push('/customers')
      router.refresh()
    } catch {
      setError('Er ging iets mis. Probeer opnieuw.')
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center justify-center w-10 h-10 text-red-400 rounded-xl hover:bg-red-50 active:bg-red-100 transition-colors"
        aria-label="Klant verwijderen"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden">
            <div className="p-6">
              <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 text-center mb-1">Klant verwijderen?</h3>
              <p className="text-sm text-gray-500 text-center mb-1">
                <span className="font-medium text-gray-700">{customerName}</span> wordt permanent verwijderd.
              </p>
              <p className="text-xs text-red-500 text-center mb-5">
                Alle bezoeken van deze klant worden ook verwijderd.
              </p>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 rounded-xl p-3 mb-4 text-center">{error}</p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                  className="flex-1 py-3.5 rounded-2xl border border-gray-200 text-gray-700 font-semibold text-sm active:bg-gray-50 transition-colors"
                >
                  Annuleren
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="flex-1 py-3.5 rounded-2xl bg-red-500 text-white font-semibold text-sm active:bg-red-600 transition-colors disabled:opacity-60"
                >
                  {loading ? 'Bezig...' : 'Verwijderen'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
