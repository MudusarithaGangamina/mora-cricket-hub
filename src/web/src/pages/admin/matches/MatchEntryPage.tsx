import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useMatch, useMatchScorecards } from '@/hooks/useMatches'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { PageHeader } from '@/components/shared/PageHeader'
import { InningsSetupTab } from './tabs/InningsSetupTab'
import { ScorecardTab }    from './tabs/ScorecardTab'
import { DeliveryEntryTab } from './tabs/DeliveryEntryTab'
import { SquadTab }        from './tabs/SquadTab'
import {
  type LivePitchState,
  EMPTY_LIVE_PITCH,
} from './tabs/delivery/pitchState'
import { clsx } from 'clsx'

type Tab =
  | 'overview'
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
  const [tab, setTab]              = useState<Tab>('overview')

  // ── Pitch state lives HERE so it survives tab switches ───────────────────
  const [pitch1, setPitch1] = useState<LivePitchState>(EMPTY_LIVE_PITCH)
  const [pitch2, setPitch2] = useState<LivePitchState>(EMPTY_LIVE_PITCH)

  if (isLoading) return <LoadingSpinner size="lg" />
  if (!match)    return <div className="text-red-400">Match not found</div>

  const innings1 = scorecards?.[0]
  const innings2 = scorecards?.[1]

  const tabs: { id: Tab; label: string; disabled?: boolean }[] = [
    { id: 'overview',           label: '📋 Overview'          },
    { id: 'squad',              label: '👥 Playing XI'         },
    { id: 'setup',              label: '📝 Create Innings'     },
    { id: 'innings1-scorecard', label: '1st Inn Scorecard', disabled: !innings1 },
    { id: 'innings2-scorecard', label: '2nd Inn Scorecard', disabled: !innings2 },
    { id: 'innings1-delivery',  label: '1st Inn Balls',    disabled: !innings1 },
    { id: 'innings2-delivery',  label: '2nd Inn Balls',    disabled: !innings2 },
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

      {/* Result banner */}
      <div className={clsx(
        'rounded-xl border px-5 py-3 mb-6 flex items-center gap-4',
        match.resultType === 'WIN'
          ? 'bg-green-950/30 border-green-800/40'
          : match.resultType === 'LOSS'
            ? 'bg-red-950/30 border-red-800/40'
            : 'bg-slate-800/40 border-slate-700/40'
      )}>
        <span className="text-2xl">
          {match.resultType === 'WIN' ? '🏆'
            : match.resultType === 'LOSS' ? '😔' : '🤝'}
        </span>
        <div>
          <p className="font-semibold text-white">
            {match.resultType === 'WIN'
              ? `Won by ${match.resultMargin} ${match.resultMarginType?.toLowerCase()}`
              : match.resultType === 'LOSS'
                ? `Lost by ${match.resultMargin} ${match.resultMarginType?.toLowerCase()}`
                : match.status.replace(/_/g, ' ')}
          </p>
          <p className="text-xs text-slate-400">
            {match.tournamentName} · {match.roundType.replace(/_/g, ' ')}
            {match.dlsApplied ? ' · DLS applied' : ''}
          </p>
        </div>
        {match.moraCaptainName && (
          <div className="ml-auto text-right text-xs text-slate-400">
            <div>
              Captain:{' '}
              <span className="text-slate-300">{match.moraCaptainName}</span>
            </div>
            {match.playerOfMatchName && (
              <div>
                POTM:{' '}
                <span className="text-slate-300">{match.playerOfMatchName}</span>
              </div>
            )}
          </div>
        )}
      </div>

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
      {tab === 'overview' && (
        <OverviewTab innings1={innings1} innings2={innings2} />
      )}
      {tab === 'squad' && (
        <SquadTab matchId={id!} opponentId={match.opponentId} />
      )}
      {tab === 'setup' && (
        <InningsSetupTab
          matchId={id!}
          existingInnings={scorecards ?? []}
          matchScheduledOvers={match.scheduledOvers}
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

function OverviewTab({
  innings1, innings2,
}: { innings1: any; innings2: any }) {
  return (
    <div className="grid grid-cols-2 gap-6">
      {innings1 && (
        <InningsSummaryCard innings={innings1} label="1st Innings" />
      )}
      {innings2 && (
        <InningsSummaryCard innings={innings2} label="2nd Innings" />
      )}
      {!innings1 && (
        <div className="col-span-2 text-slate-500 text-sm">
          No innings entered yet. Use the "Create Innings" tab to begin.
        </div>
      )}
    </div>
  )
}

function InningsSummaryCard({
  innings, label,
}: { innings: any; label: string }) {
  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-white">{label}</h3>
        <span className="text-xs text-slate-400">{innings.battingTeam}</span>
      </div>
      <div className="text-3xl font-bold text-white mb-1">
        {innings.totalRuns}/{innings.totalWickets}
      </div>
      <div className="text-slate-400 text-sm">
        ({innings.totalOversFaced} ov)
      </div>
      <div className="text-xs text-slate-500 mt-2">
        Extras: {innings.extrasWides}w {innings.extrasNoBalls}nb{' '}
        {innings.extrasLegByes}lb {innings.extrasByes}b
      </div>
      <div className="mt-3 flex gap-2">
        <span className={clsx(
          'text-xs px-2 py-0.5 rounded-full border',
          innings.hasDeliveryData
            ? 'bg-green-900/30 text-green-300 border-green-700/40'
            : 'bg-slate-700/40 text-slate-400 border-slate-600/40'
        )}>
          {innings.hasDeliveryData ? '✓ Ball-by-ball entered' : 'Scorecard only'}
        </span>
      </div>
    </div>
  )
}