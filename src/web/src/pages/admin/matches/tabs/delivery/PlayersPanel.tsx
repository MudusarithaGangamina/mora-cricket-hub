import { clsx } from 'clsx'
import { BowlingStyleLabels } from '@/types/enums'
import type { SquadMember, OpponentSquadMember } from '@/api/matches'
import type { LivePitchState } from './pitchState'

interface Props {
  isMoraBatting:        boolean
  pitch:                LivePitchState
  setPitch:             React.Dispatch<React.SetStateAction<LivePitchState>>
  availableMoraBatters: SquadMember[]
  availableMoraBowlers: SquadMember[]
  oppSquad:             OpponentSquadMember[]
  lastOverBowlerId:     string | null
  retiredHurtIds:       Set<string>
  moraSquad:            SquadMember[]
  willRotate:           boolean
  isEndOfOver:          boolean
  bowlingSide:          string
  setBowlingSide:       (val: string) => void
}

export function PlayersPanel({
  isMoraBatting, pitch, setPitch,
  availableMoraBatters, availableMoraBowlers,
  oppSquad, lastOverBowlerId, retiredHurtIds,
  moraSquad, willRotate, isEndOfOver,
  bowlingSide, setBowlingSide,
}: Props) {
  const set = (key: keyof LivePitchState, val: string) =>
    setPitch((p: LivePitchState) => ({ ...p, [key]: val }))

  // When a known opponent batter is typed/selected from autocomplete,
  // auto-fill their batting style from the squad
  const handleOppStrikerName = (name: string) => {
    set('oppStrikerName', name)
    const known = oppSquad.find(
      p => p.playerName.toLowerCase() === name.toLowerCase()
    )
    if (known?.battingStyle) {
      set('oppStrikerStyle', known.battingStyle)
    }
  }

  // When a known opponent bowler is typed, auto-fill their style
  const handleOppBowlerName = (name: string) => {
    set('oppBowlerName', name)
    const known = oppSquad.find(
      p => p.playerName.toLowerCase() === name.toLowerCase()
    )
    if (known?.bowlingStyle) {
      set('oppBowlerStyle', known.bowlingStyle)
    }
  }

  const swapStrike = () => {
  if (isMoraBatting) {
    setPitch((p: LivePitchState) => ({
      ...p,
      strikerId:    p.nonStrikerId,
      nonStrikerId: p.strikerId,
    }))
  } else {
    setPitch((p: LivePitchState) => ({
      ...p,
      oppStrikerName:    p.oppNonStrikerName,
      oppNonStrikerName: p.oppStrikerName,
    }))
  }
}

  // Batting players from opp squad (for striker autocomplete)
  const oppBatters = oppSquad
  // Bowling players from opp squad (for bowler autocomplete when Mora bats)
  const oppBowlers = oppSquad.filter(p => p.bowlingStyle)

  return (
    <div className="space-y-4">

      {/* ── Batters ─────────────────────────────────────────────────────── */}
      <div className="bg-slate-800/60 border border-slate-700/50
                      rounded-xl p-4 space-y-3">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
          Batters on Pitch
        </p>

        {/* Striker */}
        <div>
          <label className="text-xs text-slate-400 mb-1 block">
            🏏 Striker *
            {isMoraBatting && pitch.strikerId && (
              <span className="text-slate-500 ml-1">
                ({moraSquad.find(p => p.playerId === pitch.strikerId)
                  ?.battingStyle ?? ''})
              </span>
            )}
          </label>

          {isMoraBatting ? (
            <select
              value={pitch.strikerId}
              onChange={e => set('strikerId', e.target.value)}
              className="input-base w-full"
            >
              <option value="">
                {pitch.strikerId === ''
                  ? '⚠ Select striker...'
                  : 'Select...'}
              </option>
              {availableMoraBatters.map(p => (
                <option
                  key={p.playerId}
                  value={p.playerId}
                  disabled={p.playerId === pitch.nonStrikerId}
                >
                  {p.fullName}
                  {p.battingStyle ? ` (${p.battingStyle})` : ''}
                  {retiredHurtIds.has(p.playerId) ? ' [RH - can return]' : ''}
                  {p.playerId === pitch.nonStrikerId ? ' — non-striker' : ''}
                </option>
              ))}
            </select>
          ) : (
            <div className="space-y-1">
              {/* Text input with datalist autocomplete from saved opp squad */}
              <input
                value={pitch.oppStrikerName}
                onChange={e => handleOppStrikerName(e.target.value)}
                className="input-base w-full"
                placeholder="Type or pick striker name"
                list="opp-batters-striker"
              />
              <datalist id="opp-batters-striker">
                {oppBatters.map((p, i) => (
                  <option key={i} value={p.playerName}>
                    {p.battingStyle ? `${p.playerName} (${p.battingStyle})` : p.playerName}
                  </option>
                ))}
              </datalist>

              <select
                value={pitch.oppStrikerStyle}
                onChange={e => set('oppStrikerStyle', e.target.value)}
                className="input-base w-full"
              >
                <option value="">Batting hand?</option>
                <option value="RHB">Right-hand (RHB)</option>
                <option value="LHB">Left-hand (LHB)</option>
              </select>

              {/* Quick select from saved squad */}
              {oppBatters.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {oppBatters.map((p, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleOppStrikerName(p.playerName)}
                      className={clsx(
                        'text-xs px-2 py-0.5 rounded border transition-colors',
                        pitch.oppStrikerName === p.playerName
                          ? 'bg-blue-700 border-blue-500 text-white'
                          : 'bg-slate-800 border-slate-600 text-slate-400',
                        'hover:border-slate-400'
                      )}
                    >
                      {p.playerName}
                      {p.battingStyle ? ` (${p.battingStyle})` : ''}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Non-striker */}
        <div>
          <label className="text-xs text-slate-400 mb-1 block">
            Non-Striker
          </label>

          {isMoraBatting ? (
            <select
              value={pitch.nonStrikerId}
              onChange={e => set('nonStrikerId', e.target.value)}
              className="input-base w-full"
            >
              <option value="">Select non-striker...</option>
              {availableMoraBatters.map(p => (
                <option
                  key={p.playerId}
                  value={p.playerId}
                  disabled={p.playerId === pitch.strikerId}
                >
                  {p.fullName}
                  {retiredHurtIds.has(p.playerId) ? ' [RH]' : ''}
                  {p.playerId === pitch.strikerId ? ' — on strike' : ''}
                </option>
              ))}
            </select>
          ) : (
            <div>
              <input
                value={pitch.oppNonStrikerName}
                onChange={e => set('oppNonStrikerName', e.target.value)}
                className="input-base w-full"
                placeholder="Non-striker name"
                list="opp-batters-nonstriker"
              />
              <datalist id="opp-batters-nonstriker">
                {oppBatters
                  .filter(p => p.playerName !== pitch.oppStrikerName)
                  .map((p, i) => (
                    <option key={i} value={p.playerName} />
                  ))}
              </datalist>

              {oppBatters.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {oppBatters
                    .filter(p => p.playerName !== pitch.oppStrikerName)
                    .map((p, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => set('oppNonStrikerName', p.playerName)}
                        className={clsx(
                          'text-xs px-2 py-0.5 rounded border transition-colors',
                          pitch.oppNonStrikerName === p.playerName
                            ? 'bg-blue-700 border-blue-500 text-white'
                            : 'bg-slate-800 border-slate-600 text-slate-400',
                          'hover:border-slate-400'
                        )}
                      >
                        {p.playerName}
                      </button>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Swap + rotation indicator */}
        <button
          type="button"
          onClick={swapStrike}
          className="w-full text-xs py-1.5 bg-slate-700 hover:bg-slate-600
                     text-slate-300 rounded-lg transition-colors"
        >
          ⇄ Swap Strike Manually
        </button>

        <div className={clsx(
          'text-xs px-3 py-2 rounded-lg border',
          (willRotate || isEndOfOver)
            ? 'bg-green-950/40 border-green-800/40 text-green-400'
            : 'bg-slate-900/40 border-slate-700/30 text-slate-500'
        )}>
          {isEndOfOver
            ? '⇄ End of over — strike swaps automatically'
            : willRotate
              ? '⇄ Strike will rotate after this ball'
              : '— Strike stays the same after this ball'}
        </div>
      </div>

      {/* ── Bowler ──────────────────────────────────────────────────────── */}
      <div className="bg-slate-800/60 border border-slate-700/50
                      rounded-xl p-4 space-y-3">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
          Bowler
        </p>

        {!isMoraBatting ? (
          <div className="space-y-2">
            <select
              value={pitch.moraBowlerId}
              onChange={e => set('moraBowlerId', e.target.value)}
              className="input-base w-full"
            >
              <option value="">Select Mora bowler *</option>
              {availableMoraBowlers.map(p => (
                <option
                  key={p.playerId}
                  value={p.playerId}
                  disabled={p.playerId === lastOverBowlerId}
                >
                  {p.fullName}
                  {p.primaryBowlingStyle ? ` (${p.primaryBowlingStyle})` : ''}
                  {p.playerId === lastOverBowlerId
                    ? ' — bowled last over' : ''}
                </option>
              ))}
            </select>
            {lastOverBowlerId && (
              <p className="text-xs text-amber-400">
                ⚠{' '}
                {moraSquad.find(p => p.playerId === lastOverBowlerId)?.fullName}
                {' '}cannot bowl consecutive overs
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <input
              value={pitch.oppBowlerName}
              onChange={e => handleOppBowlerName(e.target.value)}
              className="input-base w-full"
              placeholder="Opponent bowler name *"
              list="opp-bowlers-list"
            />
            <datalist id="opp-bowlers-list">
              {oppBowlers.map((p, i) => (
                <option key={i} value={p.playerName}>
                  {p.bowlingStyle
                    ? `${p.playerName} (${p.bowlingStyle})`
                    : p.playerName}
                </option>
              ))}
            </datalist>

            {/* Quick pick buttons for known bowlers */}
            {oppBowlers.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {oppBowlers.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleOppBowlerName(p.playerName)}
                    className={clsx(
                      'text-xs px-2 py-0.5 rounded border transition-colors',
                      pitch.oppBowlerName === p.playerName
                        ? 'bg-purple-800 border-purple-600 text-white'
                        : 'bg-slate-800 border-slate-600 text-slate-400',
                      'hover:border-slate-400'
                    )}
                  >
                    {p.playerName}
                    {p.bowlingStyle
                      ? <span className="text-purple-400 ml-1">
                          {p.bowlingStyle}
                        </span>
                      : null}
                  </button>
                ))}
              </div>
            )}

            <select
              value={pitch.oppBowlerStyle}
              onChange={e => set('oppBowlerStyle', e.target.value)}
              className="input-base w-full"
            >
              <option value="">
                {pitch.oppBowlerStyle
                  ? pitch.oppBowlerStyle
                  : 'Bowling style? (important for analytics)'}
              </option>
              {Object.entries(BowlingStyleLabels).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
        )}

        {/* Over/Around the wicket */}
        <div>
          <label className="text-xs text-slate-400 mb-1 block">
            Over / Around the wicket
          </label>
          <div className="flex gap-2">
            {[
              { val: '',       label: '—'      },
              { val: 'OVER',   label: 'Over'   },
              { val: 'AROUND', label: 'Around' },
            ].map(opt => (
              <button
                key={opt.val}
                type="button"
                onClick={() => setBowlingSide(opt.val)}
                className={clsx(
                  'flex-1 py-1.5 rounded text-xs font-medium transition-colors',
                  bowlingSide === opt.val
                    ? 'bg-slate-500 text-white'
                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}