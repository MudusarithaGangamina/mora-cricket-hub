import { useState } from 'react'
import { useSeasons, useCreateSeason, useUpdateSeason } from '@/hooks/useSeasons'
import type { Season } from '@/api/seasons'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { FormField } from '@/components/shared/FormField'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

interface SeasonForm {
  name: string
  startDate: string
  endDate: string
}

const empty: SeasonForm = { name: '', startDate: '', endDate: '' }

export default function SeasonsPage() {
  const { data: seasons, isLoading } = useSeasons()
  // Debug: Log what the API returns
  console.log('Seasons data:', seasons)
  console.log('Is array:', Array.isArray(seasons))
  const createSeason = useCreateSeason()
  const updateSeason = useUpdateSeason()

  const [form, setForm]         = useState<SeasonForm>(empty)
  const [editing, setEditing]   = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [error, setError]       = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const data = {
        name: form.name,
        startDate: form.startDate,
        endDate: form.endDate || undefined,
      }
      if (editing) {
        await updateSeason.mutateAsync({ id: editing, data })
      } else {
        await createSeason.mutateAsync(data)
      }
      setForm(empty)
      setEditing(null)
      setShowForm(false)
    } catch {
      setError('Failed to save season. Check the details and try again.')
    }
  }

  const startEdit = (s: Season) => {
    setForm({ name: s.name, startDate: s.startDate, endDate: s.endDate ?? '' })
    setEditing(s.id)
    setShowForm(true)
  }

  if (isLoading) return <LoadingSpinner size="lg" />

  return (
    <div>
      <PageHeader
        title="Seasons"
        subtitle="Each season groups tournaments together (e.g. 2022/23)"
        action={
          <button
            onClick={() => { setShowForm(true); setEditing(null); setForm(empty) }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white
                       text-sm font-medium rounded-lg transition-colors"
          >
            + New Season
          </button>
        }
      />

      {showForm && (
        <div className="bg-slate-800/60 border border-slate-700 rounded-xl
                        p-6 mb-6 max-w-lg">
          <h3 className="font-semibold text-white mb-4">
            {editing ? 'Edit Season' : 'New Season'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Name" required hint='e.g. "2022/23"'>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="input-base w-full"
                placeholder="2022/23"
                required
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Start Date" required>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                  className="input-base w-full"
                  required
                />
              </FormField>
              <FormField label="End Date">
                <input
                  type="date"
                  value={form.endDate}
                  onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                  className="input-base w-full"
                />
              </FormField>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white
                           text-sm font-medium rounded-lg transition-colors"
              >
                {editing ? 'Save Changes' : 'Create Season'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditing(null) }}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300
                           text-sm rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {!seasons?.length ? (
        <EmptyState
          icon="📅"
          title="No seasons yet"
          description="Create your first season to get started."
        />
      ) : (
        <div className="space-y-2">
          {seasons.map(s => (
            <div
              key={s.id}
              className="flex items-center justify-between bg-slate-800/60
                         border border-slate-700/50 rounded-lg px-4 py-3"
            >
              <div>
                <span className="font-semibold text-white">{s.name}</span>
                <span className="text-slate-400 text-sm ml-3">
                  {s.startDate}
                  {s.endDate ? ` → ${s.endDate}` : ' → present'}
                </span>
              </div>
              <button
                onClick={() => startEdit(s)}
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                Edit
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}