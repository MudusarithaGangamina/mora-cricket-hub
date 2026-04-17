import { useState } from 'react'
import { clsx } from 'clsx'
import { ShotType } from '@/types/enums'
import type { BallState } from './types'
import { RUN_BUTTONS, EXTRAS_OPTIONS } from './types'
import { WicketModal, type WicketData } from './WicketModal'
import type { SquadMember } from '@/api/matches'

interface Props {
  ball:                 BallState
  setBall:              React.Dispatch<React.SetStateAction<BallState>>
  isMoraBatting:        boolean
  strikerId:            string
  nonStrikerId:         string
  oppStrikerName:       string
  oppNonStrikerName:    string
  availableMoraBatters: SquadMember[]
  moraSquad:            SquadMember[]
  currentKeeperId:      string
  ballNumber: number
}

const SHOT_TYPES = Object.values(ShotType)

export function BallOutcomePanel({
  ball, setBall,
  isMoraBatting,
  strikerId, nonStrikerId,
  oppStrikerName, oppNonStrikerName,
  moraSquad,
  currentKeeperId,ballNumber
}: Props) {
  const [wicketModalOpen, setWicketModalOpen] = useState(false)

  const set = <K extends keyof BallState>(k: K, v: BallState[K]) =>
    setBall(b => ({ ...b, [k]: v }))

  const handleWicketConfirm = (data: WicketData) => {
    setBall(b => ({
      ...b,
      isWicket:       true,
      wicketType:     data.wicketType,
      dismissedId:    data.dismissedId,
      dismissedName:  data.dismissedName,
      moraFielderId:  isMoraBatting ? '' : data.fielderId,
      oppFielderName: isMoraBatting ? data.fielderName : '',
      runOutEnd:      data.runOutEnd,
    }))
    setWicketModalOpen(false)
  }

  const handleClearWicket = () => {
    setBall(b => ({
      ...b,
      isWicket:      false,
      wicketType:    '',
      dismissedId:   '',
      dismissedName: '',
      moraFielderId: '',
      oppFielderName:'',
    }))
  }

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
                // Clear wicket if new extras type makes it invalid
                if (ball.isWicket) handleClearWicket()
                set('extrasType', ex.val)
                set('extrasRuns',
                  ex.val === 'WIDE' || ex.val === 'NO_BALL' ? 1 : 0)
                // Wide and No-ball can't have runs off bat
                if (ex.val === 'WIDE') set('runsOffBat', 0)
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
              Total extra runs
              {ball.extrasType === 'WIDE' && (
                <span className="text-slate-500 ml-1">
                  (1 = standard wide, 2 = wide + 1 run, etc.)
                </span>
              )}
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

        {/* Wide can't have runs off bat */}
        {ball.extrasType === 'WIDE' && ball.runsOffBat > 0 && (
          <p className="text-xs text-amber-400 mt-1">
            ⚠ Wides cannot have runs off bat — runs off bat cleared.
          </p>
        )}
      </div>

      {/* ── Wicket ── */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
            Wicket
          </p>

          {ball.isWicket ? (
            /* Show what was selected */
            <div className="flex items-center gap-3">
              <div className="text-sm">
                <span className="text-red-400 font-bold">
                  🔴 {ball.wicketType.replace(/_/g, ' ')}
                </span>
                {ball.dismissedName && (
                  <span className="text-slate-400 ml-2 text-xs">
                    {ball.dismissedName}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setWicketModalOpen(true)}
                className="text-xs text-slate-400 hover:text-white
                           transition-colors border border-slate-600
                           rounded px-2 py-0.5"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={handleClearWicket}
                className="text-xs text-red-400 hover:text-red-300
                           transition-colors"
              >
                Clear
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setWicketModalOpen(true)}
              className="px-4 py-2 bg-red-900/40 hover:bg-red-800/60
                         text-red-300 border border-red-800/40 rounded-lg
                         text-sm font-semibold transition-colors"
            >
              🔴 Add Wicket
            </button>
          )}
        </div>
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

      {/* ── Wicket Modal ── */}
      <WicketModal
        open={wicketModalOpen}
        onClose={() => setWicketModalOpen(false)}
        onConfirm={handleWicketConfirm}
        extrasType={ball.extrasType}
        ballNumber={ballNumber} 
        isMoraBatting={isMoraBatting}
        strikerId={strikerId}
        nonStrikerId={nonStrikerId}
        oppStrikerName={oppStrikerName}
        oppNonStrikerName={oppNonStrikerName}
        moraSquad={moraSquad}
        currentKeeperId={currentKeeperId}
      />
    </div>
  )
}