import { clsx } from 'clsx'
import { ShotType } from '@/types/enums'
import type { BallState } from './types'
import {
  RUN_BUTTONS,
  EXTRAS_OPTIONS,
  DISMISSAL_TYPES,
  NEEDS_FIELDER,
} from './types'
import { FormField } from '@/components/shared/FormField'
import type { SquadMember } from '@/api/matches'

interface Props {
  ball: BallState
  setBall: React.Dispatch<React.SetStateAction<BallState>>
  isMoraBatting: boolean
  strikerId: string
  availableMoraBatters: SquadMember[]
  moraSquad: SquadMember[]
}

const SHOT_TYPES = Object.values(ShotType)

export function BallOutcomePanel({
  ball, setBall, isMoraBatting, strikerId,
  availableMoraBatters, moraSquad,
}: Props) {
  const set = <K extends keyof BallState>(k: K, v: BallState[K]) =>
    setBall(b => ({ ...b, [k]: v }))

  return (
    <div className="space-y-4">

      {/* ── Runs off bat ── */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
        <p className="text-xs font-medium text-slate-400 uppercase
                      tracking-wide mb-3">
          Runs Off Bat
        </p>
        <div className="flex gap-2">
          {RUN_BUTTONS.map(r => (
            <button
              key={r}
              type="button"
              onClick={() => set('runsOffBat', r)}
              className={clsx(
                'flex-1 h-12 rounded-lg font-bold text-lg transition-colors',
                ball.runsOffBat === r
                  ? r === 4
                    ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                    : r === 6
                      ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                      : 'bg-blue-600 text-white'
                  : r === 4
                    ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50'
                    : r === 6
                      ? 'bg-purple-900/30 text-purple-400 hover:bg-purple-900/50'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* ── Extras ── */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
        <p className="text-xs font-medium text-slate-400 uppercase
                      tracking-wide mb-3">
          Extras
        </p>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {EXTRAS_OPTIONS.map(ex => (
            <button
              key={ex.val}
              type="button"
              onClick={() => {
                set('extrasType', ex.val)
                set('extrasRuns',
                  ex.val === 'WIDE' || ex.val === 'NO_BALL' ? 1 : 0)
              }}
              className={clsx(
                'py-2 rounded-lg text-xs font-medium transition-colors',
                ball.extrasType === ex.val
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              )}
            >
              {ex.label}
            </button>
          ))}
        </div>

        {ball.extrasType && (
          <div>
            <label className="text-xs text-slate-400 mb-1 block">
              Total extras runs
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5, 6].map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => set('extrasRuns', n)}
                  className={clsx(
                    'w-10 h-9 rounded text-sm font-semibold transition-colors',
                    ball.extrasRuns === n
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Wicket ── */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
            Wicket
          </p>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={ball.isWicket}
              onChange={e => {
                set('isWicket', e.target.checked)
                if (!e.target.checked) set('wicketType', '')
              }}
              className="accent-red-500 w-4 h-4"
            />
            <span className="text-sm font-semibold text-red-400">
              🔴 Wicket
            </span>
          </label>
        </div>

        {ball.isWicket && (
          <div className="space-y-3">
            {/* Dismissal type grid */}
            <div className="grid grid-cols-2 gap-2">
              {DISMISSAL_TYPES.map(d => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => set('wicketType', d.value)}
                  className={clsx(
                    'py-2 px-3 rounded-lg text-xs text-left transition-colors',
                    ball.wicketType === d.value
                      ? 'bg-red-700 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  )}
                >
                  {d.label}
                </button>
              ))}
            </div>

            {/* Info boxes */}
            {ball.wicketType === 'RETIRED_HURT' && (
              <p className="text-xs text-amber-400 bg-amber-950/30 border
                            border-amber-800/40 rounded-lg px-3 py-2">
                ℹ Retired Hurt — this batter can return later in the innings.
              </p>
            )}
            {ball.wicketType === 'RETIRED_OUT' && (
              <p className="text-xs text-red-400 bg-red-950/30 border
                            border-red-800/40 rounded-lg px-3 py-2">
                ℹ Retired Out — this batter cannot return.
              </p>
            )}

            {/* Dismissed batter */}
            <FormField label="Dismissed batter">
              {isMoraBatting ? (
                <select
                  value={ball.dismissedId}
                  onChange={e => set('dismissedId', e.target.value)}
                  className="input-base w-full"
                >
                  <option value="">Striker (default)</option>
                  {availableMoraBatters.map(p => (
                    <option key={p.playerId} value={p.playerId}>
                      {p.fullName}
                      {p.playerId === strikerId ? ' (striker)' : ' (non-striker)'}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  value={ball.dismissedName}
                  onChange={e => set('dismissedName', e.target.value)}
                  className="input-base w-full"
                  placeholder="Dismissed batter name"
                />
              )}
            </FormField>

            {/* Run-out end */}
            {ball.wicketType === 'RUN_OUT' && (
              <FormField label="Run out at which end?">
                <div className="flex gap-2">
                  {(['STRIKER', 'NON_STRIKER'] as const).map(end => (
                    <button
                      key={end}
                      type="button"
                      onClick={() => set('runOutEnd', end)}
                      className={clsx(
                        'flex-1 py-2 rounded-lg text-xs font-medium',
                        'transition-colors',
                        ball.runOutEnd === end
                          ? 'bg-red-700 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      )}
                    >
                      {end === 'STRIKER'
                        ? "Striker's end"
                        : "Non-striker's end"}
                    </button>
                  ))}
                </div>
              </FormField>
            )}

            {/* Fielder */}
            {NEEDS_FIELDER.includes(ball.wicketType) && (
              <FormField label="Fielder">
                {isMoraBatting ? (
                  <input
                    value={ball.oppFielderName}
                    onChange={e => set('oppFielderName', e.target.value)}
                    className="input-base w-full"
                    placeholder="Opponent fielder name"
                  />
                ) : (
                  <select
                    value={ball.moraFielderId}
                    onChange={e => set('moraFielderId', e.target.value)}
                    className="input-base w-full"
                  >
                    <option value="">Select fielder...</option>
                    {moraSquad
                      .filter(p => p.isPlayingXi)
                      .map(p => (
                        <option key={p.playerId} value={p.playerId}>
                          {p.fullName}
                        </option>
                      ))}
                  </select>
                )}
              </FormField>
            )}
          </div>
        )}
      </div>

      {/* ── Shot type ── */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
        <p className="text-xs font-medium text-slate-400 uppercase
                      tracking-wide mb-3">
          Shot Type
          <span className="normal-case text-slate-600 ml-1">(optional)</span>
        </p>
        <div className="flex flex-wrap gap-1.5">
          {SHOT_TYPES.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => set('shotType', ball.shotType === s ? null : s)}
              className={clsx(
                'px-2.5 py-1 rounded-lg text-xs transition-colors',
                ball.shotType === s
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
              )}
            >
              {s.toLowerCase().replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}