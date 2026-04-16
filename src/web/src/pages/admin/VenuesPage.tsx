import { useState } from 'react'
import { useVenues, useCreateVenue, useDeleteVenue } from '@/hooks/useVenues'
import { PageHeader } from '@/components/shared/PageHeader'
import { FormField } from '@/components/shared/FormField'
import { EmptyState } from '@/components/shared/EmptyState'
import { ConfirmDeleteButton } from '@/components/shared/ConfirmDeleteButton'

export default function VenuesPage() {
  const { data: venues } = useVenues()
  const createVenue      = useCreateVenue()
  const deleteVenue      = useDeleteVenue()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    name: '', city: '', isMoraHomeGround: false
  })
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await createVenue.mutateAsync({
        name: form.name,
        city: form.city || undefined,
        isMoraHomeGround: form.isMoraHomeGround,
      })
      setShowForm(false)
      setForm({ name: '', city: '', isMoraHomeGround: false })
    } catch {
      setError('Failed to create venue.')
    }
  }

  return (
    <div>
      <PageHeader
        title="Venues"
        subtitle="Grounds where matches are played"
        action={
          <button onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white
                       text-sm font-medium rounded-lg transition-colors">
            + New Venue
          </button>
        }
      />

      {showForm && (
        <div className="bg-slate-800/60 border border-slate-700 rounded-xl
                        p-6 mb-6 max-w-lg">
          <h3 className="font-semibold text-white mb-4">New Venue</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Ground Name" required>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="input-base w-full"
                placeholder="University of Moratuwa Ground"
                required
              />
            </FormField>

            <FormField label="City">
              <input
                value={form.city}
                onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                className="input-base w-full"
                placeholder="Moratuwa"
              />
            </FormField>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isMoraHomeGround}
                onChange={e => setForm(f => ({
                  ...f, isMoraHomeGround: e.target.checked
                }))}
                className="w-4 h-4 rounded accent-blue-500"
              />
              <span className="text-sm text-slate-300">This is our home ground</span>
            </label>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <div className="flex gap-3">
              <button type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white
                           text-sm font-medium rounded-lg transition-colors">
                Create Venue
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-slate-700 text-slate-300
                           text-sm rounded-lg transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {!venues?.length ? (
        <EmptyState icon="📍" title="No venues yet" />
      ) : (
        <div className="space-y-2">
          {venues.map(v => (
            <div key={v.id}
              className="flex items-center gap-4 bg-slate-800/60
                         border border-slate-700/50 rounded-lg px-4 py-3">
              <div className="flex-1">
                <span className="font-semibold text-white">{v.name}</span>
                {v.city && (
                  <span className="text-slate-400 text-sm ml-2">{v.city}</span>
                )}
              </div>
              {v.isMoraHomeGround && (
                <span className="text-xs px-2 py-0.5 rounded-full
                                  bg-green-900/40 text-green-300 border border-green-700/40">
                  Home
                </span>
              )}
              <div className="flex items-center gap-3">
                <ConfirmDeleteButton
                  onConfirm={() => deleteVenue.mutate(v.id)}
                  itemName={v.name}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}