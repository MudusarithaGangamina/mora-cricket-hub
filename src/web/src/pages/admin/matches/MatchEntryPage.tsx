import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useMatch, useMatchScorecards } from '@/hooks/useMatches'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { PageHeader } from '@/components/shared/PageHeader'
import { InningsSetupTab } from './tabs/InningsSetupTab'
import { ScorecardTab }    from './tabs/ScorecardTab'
import { DeliveryEntryTab } from './tabs/DeliveryEntryTab'
import { SquadTab }        from './tabs/SquadTab'
import { InfoTab }         from './tabs/InfoTab'
import { SummaryTab }      from './tabs/SummaryTab'
import {
  type LivePitchState,
  EMPTY_LIVE_PITCH,
} from './tabs/delivery/pitchState'
import { clsx } from 'clsx'

type Tab =
  | 'info'
  | 'summary'
  | 'squad'
  | 'setup'
  | 'innings1-scorecard'
  | 'innings2-scorecard'
  | 'innings1-delivery'
  | 'innings2-delivery'

export default function MatchEntryPage() {
  const { id } = useParams<{ id: string }>()
  const { data: match, isLoading } = useMatch(id!)
  const { data: scorecards }       = useMatchScorecards(id!)
  const [tab, setTab]              = useState<Tab>('info')

  const [pitch1, setPitch1] = useState<LivePitchState>(EMPTY_LIVE_PITCH)
  const [pitch2, setPitch2] = useState<LivePitchState>(EMPTY_LIVE_PITCH)

  if (isLoading) return <LoadingSpinner size="lg" />
  if (!match)    return <div className="text-red-400">Match not found</div>

  const innings1 = scorecards?.[0]
  const innings2 = scorecards?.[1]

  const tabs: { id: Tab; label: string; disabled?: boolean }[] = [
    { id: 'info',               label: 'ℹ Info'             },
    { id: 'summary',            label: '📺 Summary'          },
    { id: 'squad',              label: '👥 Playing XI'        },
    { id: 'setup',              label: '📝 Innings Setup'     },
    { id: 'innings1-scorecard', label: '1st Scorecard',
      disabled: !innings1 },
    { id: 'innings2-scorecard', label: '2nd Scorecard',
      disabled: !innings2 },
    { id: 'innings1-delivery',  label: '1st Balls',
      disabled: !innings1 || innings1.commentaryCoverage === 'NONE' },
    { id: 'innings2-delivery',  label: '2nd Balls',
      disabled: !innings2 || innings2.commentaryCoverage === 'NONE' },
  ]

  return (
    <div>
      <PageHeader
        title={`vs ${match.opponentName}`}
        subtitle={`${match.matchDate} · ${match.venueName ?? 'Unknown'} · ${match.surfaceType}`}
        action={
          <Link to="/admin/matches"
            className="text-sm text-slate-400 hover:text-white transition-colors">
            ← All matches
          </Link>
        }
      />

      {/* Confirmed banner */}
      {match.isConfirmed && (
        <div className="bg-green-950/30 border border-green-800/40 rounded-xl
                        px-5 py-2 mb-4 flex items-center gap-3">
          <span>🔒</span>
          <span className="text-green-300 text-sm font-medium">
            Match confirmed and locked — view only
          </span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 flex-wrap">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => !t.disabled && setTab(t.id)}
            disabled={t.disabled}
            className={clsx(
              'px-3 py-1.5 rounded-lg text-sm transition-colors',
              t.disabled
                ? 'text-slate-600 cursor-not-allowed'
                : tab === t.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'info' && (
        <InfoTab match={match} matchId={id!} />
      )}
      {tab === 'summary' && (
        <SummaryTab matchId={id!} match={match} />
      )}
      {tab === 'squad' && (
        <SquadTab matchId={id!} opponentId={match.opponentId} />
      )}
      {tab === 'setup' && (
        <InningsSetupTab
          matchId={id!}
          existingInnings={scorecards ?? []}
          matchScheduledOvers={match.scheduledOvers ?? 50}
        />
      )}
      {tab === 'innings1-scorecard' && innings1 && (
        <ScorecardTab innings={innings1} matchId={id!} />
      )}
      {tab === 'innings2-scorecard' && innings2 && (
        <ScorecardTab innings={innings2} matchId={id!} />
      )}
      {tab === 'innings1-delivery' && innings1 && (
        <DeliveryEntryTab
          innings={innings1}
          matchId={id!}
          pitch={pitch1}
          setPitch={setPitch1}
        />
      )}
      {tab === 'innings2-delivery' && innings2 && (
        <DeliveryEntryTab
          innings={innings2}
          matchId={id!}
          pitch={pitch2}
          setPitch={setPitch2}
        />
      )}
    </div>
  )
}