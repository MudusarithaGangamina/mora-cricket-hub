import { useMemo } from 'react'
import type { SquadMember } from '@/api/matches'
import { clsx } from 'clsx'

interface Props {
  open:              boolean
  onClose:           () => void
  onConfirm:         (data: WicketData) => void
  // Context
  extrasType:        string
  ballNumber:        number
  isMoraBatting:     boolean
  strikerId:         string
  nonStrikerId:      string
  oppStrikerName:    string
  oppNonStrikerName: string
  moraSquad:         SquadMember[]
  // Current keeper
  currentKeeperId:   string
}

export interface WicketData {
  wicketType:            string
  dismissedId:           string    // playerId or name
  dismissedName:         string
  dismissedWasStriker:   boolean
  fielderId:             string    // for caught/stumped/run-out
  fielderName:           string
  runOutEnd:             'STRIKER' | 'NON_STRIKER'
  countsForBowler:       boolean
  isRetiredHurt:         boolean   // special — not a dismissal
}

// ── Which dismissals are valid for each extras type ────────────────────────
const VALID_DISMISSALS: Record<string, string[]> = {
  '':         [
    'BOWLED', 'CAUGHT', 'LBW', 'RUN_OUT', 'STUMPED',
    'HIT_WICKET', 'RETIRED_HURT', 'RETIRED_OUT',
    'OBSTRUCTING', 'TIMED_OUT', 'HIT_BALL_TWICE',
  ],
  'WIDE':     ['RUN_OUT', 'STUMPED', 'HIT_WICKET', 'RETIRED_HURT', 'RETIRED_OUT', 'OBSTRUCTING'],
  'NO_BALL':  ['RUN_OUT', 'RETIRED_HURT', 'RETIRED_OUT', 'OBSTRUCTING'],
  'BYE':      ['RUN_OUT', 'RETIRED_HURT', 'RETIRED_OUT', 'OBSTRUCTING'],
  'LEG_BYE':  ['RUN_OUT', 'RETIRED_HURT', 'RETIRED_OUT', 'OBSTRUCTING'],
  'PENALTY':  [],
}

// ── Whether a dismissal type counts for the bowler ─────────────────────────
const COUNTS_FOR_BOWLER: Record<string, boolean> = {
  BOWLED:          true,
  CAUGHT:          true,
  LBW:             true,
  STUMPED:         true,
  HIT_WICKET:      true,
  RUN_OUT:         false,
  TIMED_OUT:       false,
  OBSTRUCTING:     false,
  HIT_BALL_TWICE:  false,
  RETIRED_OUT:     false,
  RETIRED_HURT:    false,
}

// ── Whether a dismissal auto-selects the striker ───────────────────────────
const AUTO_SELECTS_STRIKER = [
  'BOWLED', 'CAUGHT', 'LBW', 'HIT_WICKET',
  'TIMED_OUT', 'HIT_BALL_TWICE', 'STUMPED',
]

// ── Whether a dismissal needs a fielder ───────────────────────────────────
const NEEDS_FIELDER = ['CAUGHT', 'RUN_OUT', 'STUMPED']

const ALL_DISMISSAL_LABELS: Record<string, string> = {
  BOWLED:         'Bowled',
  CAUGHT:         'Caught',
  LBW:            'LBW',
  RUN_OUT:        'Run Out',
  STUMPED:        'Stumped',
  HIT_WICKET:     'Hit Wicket',
  RETIRED_HURT:   'Retired Hurt',
  RETIRED_OUT:    'Retired Out',
  OBSTRUCTING:    'Obstructing',
  TIMED_OUT:      'Timed Out',
  HIT_BALL_TWICE: 'Hit Ball Twice',
}

import { useState, useEffect } from 'react'

export function WicketModal({
  open, onClose, onConfirm,
  extrasType, ballNumber,
  isMoraBatting,
  strikerId, nonStrikerId,
  oppStrikerName, oppNonStrikerName,
  moraSquad,
  currentKeeperId,
}: Props) {
  const [wicketType,   setWicketType]   = useState('')
  const [dismissedId,  setDismissedId]  = useState('')
  const [fielderId,    setFielderId]    = useState('')
  const [runOutEnd,    setRunOutEnd]    = useState<'STRIKER' | 'NON_STRIKER'>('STRIKER')
  const [oppDismissed, setOppDismissed] = useState('')
  const [oppFielder,   setOppFielder]   = useState('')
  const [error,        setError]        = useState('')

  // Valid dismissals for current extras type
  const validDismissals = useMemo(
    () => VALID_DISMISSALS[extrasType] ?? VALID_DISMISSALS[''],
    [extrasType]
  )

  // Auto-select striker when dismissal type auto-selects it
  useEffect(() => {
    if (!wicketType) return
    if (AUTO_SELECTS_STRIKER.includes(wicketType)) {
      setDismissedId(strikerId)
      setOppDismissed(oppStrikerName)
    }
    // Auto-select keeper for stumped
    if (wicketType === 'STUMPED' && currentKeeperId) {
      setFielderId(currentKeeperId)
    }
    setError('')
  }, [wicketType, strikerId, oppStrikerName, currentKeeperId])

  // Reset on open
  useEffect(() => {
    if (open) {
      setWicketType('')
      setDismissedId('')
      setFielderId('')
      setRunOutEnd('STRIKER')
      setOppDismissed('')
      setOppFielder('')
      setError('')
    }
  }, [open])

  const handleConfirm = () => {
    if (!wicketType) {
      setError('Select the type of dismissal.')
      return
    }
    if (!dismissedId && !oppDismissed && isMoraBatting) {
      setError('Select the dismissed batter.')
      return
    }
    if (NEEDS_FIELDER.includes(wicketType) && !fielderId && !oppFielder) {
      setError('Select the fielder.')
      return
    }

    const dismissedWasStriker = isMoraBatting
      ? dismissedId === strikerId
      : oppDismissed === oppStrikerName

    // Resolve dismissed name for Mora
    const moraPlayer = moraSquad.find(p => p.playerId === dismissedId)

    onConfirm({
      wicketType,
      dismissedId:         isMoraBatting ? dismissedId : oppDismissed,
      dismissedName:       isMoraBatting
        ? (moraPlayer?.fullName ?? '')
        : oppDismissed,
      dismissedWasStriker,
      fielderId:           isMoraBatting ? oppFielder : fielderId,
      fielderName:         isMoraBatting ? oppFielder : (
        moraSquad.find(p => p.playerId === fielderId)?.fullName ?? ''
      ),
      runOutEnd,
      countsForBowler:     COUNTS_FOR_BOWLER[wicketType] ?? false,
      isRetiredHurt:       wicketType === 'RETIRED_HURT',
    })
  }

  if (!open) return null

  // Determine if ball is the last legal delivery of the over
  const isLastBallOfOver =
    ballNumber === 6 &&
    extrasType !== 'WIDE' &&
    extrasType !== 'NO_BALL'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center
                    bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl
                w-full max-w-md shadow-2xl
                max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between
                        px-6 py-4 border-b border-slate-800">
          <h3 className="text-lg font-bold text-white">
            🔴 Wicket
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors text-xl"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto flex-1">

          {/* Last ball of over notice */}
          {isLastBallOfOver && (
            <div className="bg-amber-950/40 border border-amber-700/40
                            rounded-lg px-4 py-2 text-amber-300 text-xs">
              ℹ This is ball 6 — if dismissed, the new batter will be at the
              non-striker end for the next over.
            </div>
          )}

          {/* Dismissal type grid */}
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase
                          tracking-wide mb-2">
              How Out
            </p>
            
<div className="grid grid-cols-3 gap-1.5">
  {validDismissals.map(d => (
    <button
      key={d}
      type="button"
      onClick={() => setWicketType(d)}
      className={clsx(
        'py-2 px-2 rounded-xl text-xs text-center',
        'border transition-all',
        wicketType === d
          ? 'bg-red-700 border-red-500 text-white font-semibold'
          : 'bg-slate-800 border-slate-700 text-slate-300',
        'hover:border-slate-500'
      )}
    >
      {ALL_DISMISSAL_LABELS[d]}
    </button>
  ))}
</div>
          </div>

          {/* Special notes per dismissal type */}
          {wicketType === 'RETIRED_HURT' && (
            <div className="bg-blue-950/40 border border-blue-700/40
                            rounded-lg px-4 py-2 text-blue-300 text-xs">
              ℹ Retired Hurt is not a dismissal — the batter leaves temporarily
              and can return later. Not counted for bowler or fielder.
            </div>
          )}
          {wicketType === 'RETIRED_OUT' && (
            <div className="bg-orange-950/40 border border-orange-700/40
                            rounded-lg px-4 py-2 text-orange-300 text-xs">
              ℹ Retired Out — batter cannot return. Not counted for bowler.
            </div>
          )}
          {wicketType === 'TIMED_OUT' && (
            <div className="bg-slate-800/60 border border-slate-700/40
                            rounded-lg px-4 py-2 text-slate-300 text-xs">
              ℹ Timed Out — incoming batter failed to take the crease in time.
              Not counted for the bowler.
            </div>
          )}

          {/* Dismissed batter */}
          {wicketType && (
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase
                            tracking-wide mb-2">
                {AUTO_SELECTS_STRIKER.includes(wicketType)
                  ? 'Dismissed (striker — auto selected)'
                  : 'Who was dismissed?'}
              </p>

              {isMoraBatting ? (
                <div className="grid grid-cols-2 gap-2">
                  {/* Striker */}
                  <button
                    type="button"
                    onClick={() => setDismissedId(strikerId)}
                    disabled={AUTO_SELECTS_STRIKER.includes(wicketType)}
                    className={clsx(
                      'py-2 px-3 rounded-lg text-sm border transition-all',
                      dismissedId === strikerId
                        ? 'bg-red-800/60 border-red-600 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-300',
                      AUTO_SELECTS_STRIKER.includes(wicketType)
                        ? 'opacity-70 cursor-not-allowed'
                        : 'hover:border-slate-500'
                    )}
                  >
                    <div className="font-medium">
                      {moraSquad.find(p => p.playerId === strikerId)
                        ?.fullName ?? 'Striker'}
                    </div>
                    <div className="text-xs text-slate-400">On strike *</div>
                  </button>

                  {/* Non-striker */}
                  <button
                    type="button"
                    onClick={() => setDismissedId(nonStrikerId)}
                    disabled={AUTO_SELECTS_STRIKER.includes(wicketType)}
                    className={clsx(
                      'py-2 px-3 rounded-lg text-sm border transition-all',
                      dismissedId === nonStrikerId
                        ? 'bg-red-800/60 border-red-600 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-300',
                      AUTO_SELECTS_STRIKER.includes(wicketType)
                        ? 'opacity-70 cursor-not-allowed'
                        : 'hover:border-slate-500'
                    )}
                  >
                    <div className="font-medium">
                      {moraSquad.find(p => p.playerId === nonStrikerId)
                        ?.fullName ?? 'Non-striker'}
                    </div>
                    <div className="text-xs text-slate-400">
                      Non-striker †
                    </div>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setOppDismissed(oppStrikerName)}
                    disabled={AUTO_SELECTS_STRIKER.includes(wicketType)}
                    className={clsx(
                      'py-2 px-3 rounded-lg text-sm border transition-all',
                      oppDismissed === oppStrikerName
                        ? 'bg-red-800/60 border-red-600 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-300',
                      AUTO_SELECTS_STRIKER.includes(wicketType)
                        ? 'opacity-70 cursor-not-allowed'
                        : 'hover:border-slate-500'
                    )}
                  >
                    <div className="font-medium truncate">
                      {oppStrikerName || 'Striker'}
                    </div>
                    <div className="text-xs text-slate-400">On strike *</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOppDismissed(oppNonStrikerName)}
                    disabled={AUTO_SELECTS_STRIKER.includes(wicketType)}
                    className={clsx(
                      'py-2 px-3 rounded-lg text-sm border transition-all',
                      oppDismissed === oppNonStrikerName
                        ? 'bg-red-800/60 border-red-600 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-300',
                      AUTO_SELECTS_STRIKER.includes(wicketType)
                        ? 'opacity-70 cursor-not-allowed'
                        : 'hover:border-slate-500'
                    )}
                  >
                    <div className="font-medium truncate">
                      {oppNonStrikerName || 'Non-striker'}
                    </div>
                    <div className="text-xs text-slate-400">Non-striker †</div>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Run-out end selection */}
          {wicketType === 'RUN_OUT' && (
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase
                            tracking-wide mb-2">
                Run out at which end?
              </p>
              <div className="grid grid-cols-2 gap-2">
                {(['STRIKER', 'NON_STRIKER'] as const).map(end => (
                  <button
                    key={end}
                    type="button"
                    onClick={() => setRunOutEnd(end)}
                    className={clsx(
                      'py-2 px-3 rounded-lg text-sm border transition-all',
                      runOutEnd === end
                        ? 'bg-red-800/60 border-red-600 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-300',
                      'hover:border-slate-500'
                    )}
                  >
                    {end === 'STRIKER' ? "Striker's end" : "Non-striker's end"}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {runOutEnd === 'STRIKER'
                  ? 'Striker is out → non-striker safely at striker end → new batter at non-striker end'
                  : 'Non-striker is out → striker stays on strike → new batter at non-striker end'}
              </p>
            </div>
          )}

          {/* Fielder selection */}
          {wicketType && NEEDS_FIELDER.includes(wicketType) && (
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase
                            tracking-wide mb-2">
                {wicketType === 'STUMPED'
                  ? 'Keeper (auto-selected)'
                  : 'Fielder'}
              </p>

              {isMoraBatting ? (
                /* Opponent fielder — free text */
                <input
                  value={oppFielder}
                  onChange={e => setOppFielder(e.target.value)}
                  className="input-base w-full"
                  placeholder="Opponent fielder name"
                  disabled={wicketType === 'STUMPED'}
                />
              ) : (
                /* Mora fielder — dropdown from squad */
                <select
                  value={fielderId}
                  onChange={e => setFielderId(e.target.value)}
                  className="input-base w-full"
                  disabled={wicketType === 'STUMPED'}
                >
                  <option value="">Select fielder...</option>
                  {moraSquad.map(p => (
                    <option key={p.playerId} value={p.playerId}>
                      {p.fullName}
                      {p.playerId === currentKeeperId ? ' (keeper)' : ''}
                    </option>
                  ))}
                </select>
              )}

              {wicketType === 'STUMPED' && currentKeeperId && (
                <p className="text-xs text-slate-500 mt-1">
                  Keeper:{' '}
                  {moraSquad.find(p => p.playerId === currentKeeperId)
                    ?.fullName ?? 'current keeper'}
                </p>
              )}
            </div>
          )}

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!wicketType}
            className="flex-1 py-3 bg-red-700 hover:bg-red-600 text-white
                       font-bold rounded-xl transition-colors
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Confirm Wicket
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600
                       text-slate-300 rounded-xl transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}