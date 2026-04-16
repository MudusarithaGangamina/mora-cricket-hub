import { clsx } from 'clsx'

export interface InningsEventItem {
  id:                 string
  eventType:          string
  atOver:             number | null
  teamScoreAtEvent:   number | null
  teamWicketsAtEvent: number | null
  revisedOvers:       number | null
  description:        string
  playerId:           string | null
}

interface Props {
  events: InningsEventItem[]
}

const EVENT_ICONS: Record<string, string> = {
  DRINKS:           '☕',
  RAIN:             '🌧',
  BAD_LIGHT:        '🌑',
  INJURY:           '🚑',
  REVISED_OVERS:    '📋',
  TEAM_MILESTONE:   '🎯',
  BATTER_MILESTONE: '⭐',
  BOWLER_MILESTONE: '🎳',
  WICKET:           '🔴',
  INNINGS_END:      '✅',
  BOWLER_CHANGE:    '🔄',
  KEEPER_CHANGE:    '🧤',
  OTHER:            '📝',
}

const EVENT_COLORS: Record<string, string> = {
  TEAM_MILESTONE:   'text-amber-400',
  BATTER_MILESTONE: 'text-blue-400',
  BOWLER_MILESTONE: 'text-purple-400',
  WICKET:           'text-red-400',
  INNINGS_END:      'text-green-400',
  RAIN:             'text-slate-300',
  BAD_LIGHT:        'text-slate-300',
  REVISED_OVERS:    'text-orange-400',
  DRINKS:           'text-slate-400',
  INJURY:           'text-rose-400',
  BOWLER_CHANGE:    'text-cyan-400',
  KEEPER_CHANGE:    'text-teal-400',
}

export function InningsTimeline({ events }: Props) {
  if (events.length === 0) return null

  const sorted = [...events].sort(
    (a, b) => (a.atOver ?? 0) - (b.atOver ?? 0)
  )

  return (
    <div className="space-y-0.5">
      {sorted.map(e => (
        <div
          key={e.id}
          className={clsx(
            'flex items-start gap-2 text-xs py-1 px-1',
            EVENT_COLORS[e.eventType] ?? 'text-slate-400'
          )}
        >
          {/* Icon */}
          <span className="shrink-0 w-4 text-center">
            {EVENT_ICONS[e.eventType] ?? '📝'}
          </span>

          {/* Over */}
          {e.atOver !== null && (
            <span className="text-slate-500 shrink-0 w-10 font-mono">
              {e.atOver.toFixed(1)}
            </span>
          )}

          {/* Score */}
          {e.teamScoreAtEvent !== null &&
           e.teamWicketsAtEvent !== null && (
            <span className="text-slate-400 shrink-0 w-14 font-mono">
              {e.teamScoreAtEvent}/{e.teamWicketsAtEvent}
            </span>
          )}

          {/* Revised overs badge */}
          {e.revisedOvers !== null && (
            <span className="bg-orange-900/40 border border-orange-700/40
                             text-orange-300 px-1.5 rounded text-xs shrink-0">
              → {e.revisedOvers} ov
            </span>
          )}

          {/* Description */}
          <span className="flex-1 leading-relaxed">
            {e.description}
          </span>
        </div>
      ))}
    </div>
  )
}