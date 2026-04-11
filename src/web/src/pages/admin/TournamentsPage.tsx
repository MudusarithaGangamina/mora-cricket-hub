import { useState } from 'react'
import { useTournaments, useCreateTournament } from '@/hooks/useTournaments'
import { useSeasons } from '@/hooks/useSeasons'
import { PageHeader } from '@/components/shared/PageHeader'
import { FormField } from '@/components/shared/FormField'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

export default function TournamentsPage() {
  const { data: tournaments, isLoading } = useTournaments()
  const { data: seasons }                = useSeasons()
  const createTournament                 = useCreateTournament()

  const [showForm, setShowForm] = useState(false)
  const [error, setError]       = useState('')
  const [form, setForm]         = useState({
    seasonId: '', name: '', format: 'ODI', oversPerSide: 50
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await createTournament.mutateAsync({
        ...form, oversPerSide: Number(form.oversPerSide)
      })
      setShowForm(false)
      setForm({ seasonId: '', name: '', format: 'ODI', oversPerSide: 50 })
    } catch {
      setError('Failed to create tournament.')
    }
  }

  if (isLoading) return <LoadingSpinner size="lg" />

  return (
    <div>
      <PageHeader
        title="Tournaments"
        subtitle="IUCC, CDCA Div 3, and any future competitions"
        action={
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white
                       text-sm font-medium rounded-lg transition-colors"
          >
            + New Tournament
          </button>
        }
      />

      {showForm && (
        <div className="bg-slate-800/60 border border-slate-700 rounded-xl
                        p-6 mb-6 max-w-lg">
          <h3 className="font-semibold text-white mb-4">New Tournament</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Season" required>
              <select
                value={form.seasonId}
                onChange={e => setForm(f => ({ ...f, seasonId: e.target.value }))}
                className="input-base w-full"
                required
              >
                <option value="">Select season...</option>
                {seasons?.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </FormField>

            <FormField label="Tournament Name" required
              hint='e.g. "CDCA Division III Tournament 2026"'>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="input-base w-full"
                required
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Format" required>
                <select
                  value={form.format}
                  onChange={e => setForm(f => ({ ...f, format: e.target.value }))}
                  className="input-base w-full"
                >
                  <option value="ODI">ODI (50-over)</option>
                  <option value="T20">T20</option>
                  <option value="Other">Other</option>
                </select>
              </FormField>

              <FormField label="Overs Per Side" required>
                <input
                  type="number"
                  min={10} max={50}
                  value={form.oversPerSide}
                  onChange={e => setForm(f => ({
                    ...f, oversPerSide: Number(e.target.value)
                  }))}
                  className="input-base w-full"
                />
              </FormField>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <div className="flex gap-3">
              <button type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white
                           text-sm font-medium rounded-lg transition-colors">
                Create Tournament
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300
                           text-sm rounded-lg transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {!tournaments?.length ? (
        <EmptyState icon="🏆" title="No tournaments yet"
          description="Create a season first, then add tournaments." />
      ) : (
        <div className="space-y-2">
          {tournaments.map(t => (
            <div key={t.id}
              className="flex items-center justify-between bg-slate-800/60
                         border border-slate-700/50 rounded-lg px-4 py-3">
              <div>
                <span className="font-semibold text-white">{t.name}</span>
                <span className="text-slate-500 text-sm ml-3">
                  {t.seasonName} · {t.format} · {t.oversPerSide} ov
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}