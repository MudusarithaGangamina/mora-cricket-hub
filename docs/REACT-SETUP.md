# Mora Cricket Hub — React Frontend Setup Guide v2.0

---

## Step 1 — Scaffold & Dependencies

```bash
cd src
npm create vite@latest mora-cricket-hub-web -- --template react-ts
cd mora-cricket-hub-web
npm install

# Routing + data fetching
npm install react-router-dom @tanstack/react-query @tanstack/react-query-devtools

# Styling + components
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install -D @types/node
npx shadcn-ui@latest init

# Charts + visualisation
npm install recharts d3 @types/d3

# Forms + validation
npm install react-hook-form zod @hookform/resolvers

# HTTP + auth
npm install axios jwt-decode

# Utilities
npm install date-fns lucide-react clsx
```

---

## Step 2 — Folder Structure

```
src/
├── api/
│   ├── client.ts                    # Axios instances — .NET + FastAPI
│   ├── players.ts
│   ├── matches.ts
│   ├── opponents.ts
│   ├── tournaments.ts
│   └── analytics/
│       ├── batting.ts
│       ├── bowling.ts
│       ├── captaincy.ts
│       ├── team.ts
│       └── records.ts
│
├── components/
│   ├── ui/                          # shadcn/ui — do not hand-edit
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   └── PageLayout.tsx
│   ├── charts/
│   │   ├── QuadrantPlot.tsx         # Avg vs SR with team mean dividers
│   │   ├── WagonWheel.tsx           # D3 — 9 zone wagon wheel
│   │   ├── WagonWheelPicker.tsx     # Data entry — clickable zone selector
│   │   ├── WormChart.tsx            # Recharts — over-by-over score progression
│   │   ├── PhaseBarChart.tsx        # 3-phase or 4-phase toggle
│   │   ├── BowlingStyleBreakdown.tsx
│   │   ├── HomeAwayChart.tsx
│   │   ├── WinLossContextChart.tsx
│   │   └── ScoringPatternComparison.tsx
│   ├── scorecards/
│   │   ├── BattingScorecard.tsx
│   │   ├── BowlingScorecard.tsx
│   │   └── FallOfWickets.tsx
│   ├── player/
│   │   ├── PlayerCard.tsx
│   │   ├── MilestoneTimeline.tsx    # Career milestone event feed
│   │   ├── CaptaincyProfile.tsx
│   │   └── RoleBadge.tsx           # OPENER | FINISHER etc
│   └── shared/
│       ├── StatCard.tsx
│       ├── DataCoverageDisclaimer.tsx   # MANDATORY on delivery/shot charts
│       ├── BatchBadge.tsx
│       ├── PhaseToggle.tsx              # 3-phase / 4-phase switcher
│       ├── VenueTypeBadge.tsx           # HOME | AWAY | NEUTRAL
│       ├── SurfaceBadge.tsx             # MATTING | TURF
│       ├── FormatBadge.tsx              # ODI | T20
│       ├── BallColourIndicator.tsx      # Red / White ball indicator
│       └── LoadingSpinner.tsx
│
├── pages/
│   ├── public/
│   │   ├── HomePage.tsx
│   │   ├── MatchesPage.tsx
│   │   ├── MatchDetailPage.tsx          # Scorecard + worm chart + over comparison
│   │   ├── PlayersPage.tsx
│   │   ├── PlayerDetailPage.tsx         # Full profile — all splits + milestones
│   │   ├── TeamAnalyticsPage.tsx
│   │   ├── BatchAnalyticsPage.tsx
│   │   ├── RecordsPage.tsx              # Team + individual records
│   │   ├── CaptaincyPage.tsx            # Captaincy leaderboard + profiles
│   │   └── HeadToHeadPage.tsx           # W/L vs each opponent
│   └── admin/
│       ├── AdminDashboardPage.tsx
│       ├── matches/
│       │   ├── MatchListPage.tsx
│       │   ├── CreateMatchPage.tsx
│       │   └── MatchEntryPage.tsx
│       ├── players/
│       │   ├── PlayerListPage.tsx
│       │   └── CreateEditPlayerPage.tsx
│       └── opponents/
│           └── OpponentListPage.tsx
│
├── hooks/
│   ├── useAuth.ts
│   ├── usePhaseMode.ts       # Manages 3-phase / 4-phase toggle state
│   ├── usePlayers.ts
│   ├── useMatches.ts
│   └── useAnalytics.ts
│
├── types/
│   ├── enums.ts              # All enum definitions
│   ├── player.ts
│   ├── match.ts
│   ├── innings.ts
│   ├── delivery.ts
│   └── analytics.ts
│
├── utils/
│   ├── cricketCalculations.ts
│   ├── phaseUtils.ts         # Phase boundary helpers
│   ├── formatters.ts
│   └── constants.ts
│
├── App.tsx
├── main.tsx
└── index.css
```

---

## Step 3 — Complete Enums

### src/types/enums.ts
```typescript
export enum BattingStyle {
  RHB = 'RHB',
  LHB = 'LHB',
}

export enum BowlingStyle {
  RF  = 'RF',   RFM = 'RFM', RM  = 'RM',  RMF = 'RMF',
  OB  = 'OB',   LB  = 'LB',
  SLA = 'SLA',  SLO = 'SLO',
  LM  = 'LM',   LMF = 'LMF', LF  = 'LF',
}

export const BowlingStyleLabels: Record<BowlingStyle, string> = {
  [BowlingStyle.RF]:  'Right-arm Fast',
  [BowlingStyle.RFM]: 'Right-arm Fast-Medium',
  [BowlingStyle.RM]:  'Right-arm Medium',
  [BowlingStyle.RMF]: 'Right-arm Medium-Fast',
  [BowlingStyle.OB]:  'Off-break',
  [BowlingStyle.LB]:  'Leg-break',
  [BowlingStyle.SLA]: 'Slow Left-arm Orthodox',
  [BowlingStyle.SLO]: 'Slow Left-arm Unorthodox (Chinaman)',
  [BowlingStyle.LM]:  'Left-arm Medium',
  [BowlingStyle.LMF]: 'Left-arm Medium-Fast',
  [BowlingStyle.LF]:  'Left-arm Fast',
};

export type BowlingCategory = 'PACE' | 'SPIN';

export const toBowlingCategory = (style: BowlingStyle): BowlingCategory =>
  [BowlingStyle.OB, BowlingStyle.LB, BowlingStyle.SLA, BowlingStyle.SLO].includes(style)
    ? 'SPIN' : 'PACE';

export enum VenueType {
  HOME    = 'HOME',
  AWAY    = 'AWAY',
  NEUTRAL = 'NEUTRAL',
}

export enum MatchStatus {
  COMPLETED     = 'COMPLETED',
  ABANDONED     = 'ABANDONED',
  ABANDONED_MID = 'ABANDONED_MID',
  NO_RESULT     = 'NO_RESULT',
}

export enum ResultType {
  WIN          = 'WIN',
  LOSS         = 'LOSS',
  TIE_TOSS     = 'TIE_TOSS',
  TIE_BOWL_OUT = 'TIE_BOWL_OUT',
  NR           = 'NR',
  ABANDONED    = 'ABANDONED',
}

export enum RoundType {
  LEAGUE        = 'LEAGUE',
  GROUP_STAGE   = 'GROUP_STAGE',
  QUARTER_FINAL = 'QUARTER_FINAL',
  SEMI_FINAL    = 'SEMI_FINAL',
  FINAL         = 'FINAL',
  PLAYOFF       = 'PLAYOFF',
}

export enum CommentaryCoverage {
  NONE = 'NONE',
  KEY  = 'KEY',
  FULL = 'FULL',
}

export enum DirectionZone {
  FINE_LEG   = 'FINE_LEG',
  SQUARE_LEG = 'SQUARE_LEG',
  MIDWICKET  = 'MIDWICKET',
  MID_ON     = 'MID_ON',
  STRAIGHT   = 'STRAIGHT',
  MID_OFF    = 'MID_OFF',
  COVER      = 'COVER',
  POINT      = 'POINT',
  THIRD_MAN  = 'THIRD_MAN',
  OTHER      = 'OTHER',
}

export enum ShotType {
  DRIVE        = 'DRIVE',   PULL         = 'PULL',
  HOOK         = 'HOOK',    CUT          = 'CUT',
  SWEEP        = 'SWEEP',   REVERSE_SWEEP = 'REVERSE_SWEEP',
  GLANCE       = 'GLANCE',  FLICK        = 'FLICK',
  LOFT         = 'LOFT',    DEFENSIVE    = 'DEFENSIVE',
  LEAVE        = 'LEAVE',   PADDLE       = 'PADDLE',
  SCOOP        = 'SCOOP',   OTHER        = 'OTHER',
}

export enum BattingRole {
  OPENER       = 'OPENER',
  TOP_ORDER    = 'TOP_ORDER',
  MIDDLE_ORDER = 'MIDDLE_ORDER',
  FINISHER     = 'FINISHER',
  TAIL         = 'TAIL',
}

export const BattingRoleLabels: Record<BattingRole, string> = {
  [BattingRole.OPENER]:       'Opener',
  [BattingRole.TOP_ORDER]:    'Top Order',
  [BattingRole.MIDDLE_ORDER]: 'Middle Order',
  [BattingRole.FINISHER]:     'Finisher',
  [BattingRole.TAIL]:         'Tail',
};

export enum SurfaceType {
  MATTING = 'MATTING',
  TURF    = 'TURF',
}

export enum BallColour {
  RED   = 'RED',
  WHITE = 'WHITE',
}

export enum BowlingSide {
  OVER   = 'OVER',
  AROUND = 'AROUND',
}

export enum MatchStatus {
  COMPLETED           = 'COMPLETED',
  ABANDONED           = 'ABANDONED',
  ABANDONED_MID       = 'ABANDONED_MID',
  NO_RESULT           = 'NO_RESULT',
  PRE_TOSS_ABANDONED  = 'PRE_TOSS_ABANDONED', // Washed out before toss — team record only
}

export enum RoundType {
  FIRST_ROUND      = 'FIRST_ROUND',
  SECOND_ROUND     = 'SECOND_ROUND',
  PRE_QUARTER_FINAL = 'PRE_QUARTER_FINAL',
  QUARTER_FINAL    = 'QUARTER_FINAL',
  SEMI_FINAL       = 'SEMI_FINAL',
  FINAL            = 'FINAL',
  CONSOLATION_FINAL = 'CONSOLATION_FINAL',
  GROUP_STAGE      = 'GROUP_STAGE',
  LEAGUE           = 'LEAGUE',
  PLAYOFF          = 'PLAYOFF',
}

export const RoundTypeLabels: Record<RoundType, string> = {
  [RoundType.FIRST_ROUND]:       'First Round',
  [RoundType.SECOND_ROUND]:      'Second Round',
  [RoundType.PRE_QUARTER_FINAL]: 'Pre-Quarter Final',
  [RoundType.QUARTER_FINAL]:     'Quarter Final',
  [RoundType.SEMI_FINAL]:        'Semi Final',
  [RoundType.FINAL]:             'Final',
  [RoundType.CONSOLATION_FINAL]: 'Consolation Final',
  [RoundType.GROUP_STAGE]:       'Group Stage',
  [RoundType.LEAGUE]:            'League Match',
  [RoundType.PLAYOFF]:           'Playoff',
};

export enum MilestoneType {
  DEBUT         = 'DEBUT',
  FIRST_30      = 'FIRST_30',
  FIRST_50      = 'FIRST_50',
  FIRST_100     = 'FIRST_100',
  FIRST_4FER    = 'FIRST_4FER',
  FIRST_5FER    = 'FIRST_5FER',
  FIRST_HATTRICK = 'FIRST_HATTRICK',
  FIRST_MOTM    = 'FIRST_MOTM',
}
```

---

## Step 4 — Phase Utilities

### src/utils/phaseUtils.ts
```typescript
export type PhaseMode = '3-phase' | '4-phase';

export interface Phase {
  label: string;
  startOver: number;
  endOver: number;
  color: string;
}

export const PHASES: Record<PhaseMode, Phase[]> = {
  '3-phase': [
    { label: 'Powerplay',    startOver: 1,  endOver: 10, color: '#4fc3f7' },
    { label: 'Middle Overs', startOver: 11, endOver: 40, color: '#66bb6a' },
    { label: 'Death Overs',  startOver: 41, endOver: 50, color: '#ef5350' },
  ],
  '4-phase': [
    { label: 'Powerplay',    startOver: 1,  endOver: 6,  color: '#4fc3f7' },
    { label: 'Early Middle', startOver: 7,  endOver: 15, color: '#66bb6a' },
    { label: 'Late Middle',  startOver: 16, endOver: 40, color: '#ffa726' },
    { label: 'Death Overs',  startOver: 41, endOver: 50, color: '#ef5350' },
  ],
};

export const getPhaseForOver = (over: number, mode: PhaseMode): Phase =>
  PHASES[mode].find(p => over >= p.startOver && over <= p.endOver)!;

// Passed as query params to FastAPI
export const phaseParams = (mode: PhaseMode) =>
  PHASES[mode].map((p, i) => `phase${i+1}_start=${p.startOver}&phase${i+1}_end=${p.endOver}`).join('&');
```

### src/hooks/usePhaseMode.ts
```typescript
import { useState } from 'react';
import type { PhaseMode } from '../utils/phaseUtils';

export function usePhaseMode(defaultMode: PhaseMode = '3-phase') {
  const [mode, setMode] = useState<PhaseMode>(defaultMode);
  const toggle = () => setMode(m => m === '3-phase' ? '4-phase' : '3-phase');
  return { mode, toggle, setMode };
}
```

---

## Step 5 — API Client

### src/api/client.ts
```typescript
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const analyticsClient = axios.create({
  baseURL: import.meta.env.VITE_ANALYTICS_URL,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('mora_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('mora_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);
```

### src/api/analytics/batting.ts
```typescript
import { analyticsClient } from '../client';
import type { PhaseMode } from '../../utils/phaseUtils';
import { phaseParams } from '../../utils/phaseUtils';

export const battingAnalytics = {
  vsbowling Style: (playerId: string) =>
    analyticsClient.get(`/analytics/batting/vs-bowling-style/${playerId}`),

  phaseAnalysis: (playerId: string, mode: PhaseMode) =>
    analyticsClient.get(`/analytics/batting/phase/${playerId}?${phaseParams(mode)}`),

  homeAwaySplit: (playerId: string) =>
    analyticsClient.get(`/analytics/batting/home-away/${playerId}`),

  winLossSplit: (playerId: string) =>
    analyticsClient.get(`/analytics/batting/win-loss/${playerId}`),

  chasingSettingSplit: (playerId: string) =>
    analyticsClient.get(`/analytics/batting/chasing-setting/${playerId}`),

  wagonWheel: (playerId: string) =>
    analyticsClient.get(`/analytics/batting/wagon-wheel/${playerId}`),

  partnerships: (playerId: string) =>
    analyticsClient.get(`/analytics/batting/partnerships/${playerId}`),
};

export const teamAnalytics = {
  records: () =>
    analyticsClient.get('/analytics/team/records'),

  tossAnalysis: () =>
    analyticsClient.get('/analytics/team/toss'),

  headToHead: () =>
    analyticsClient.get('/analytics/team/head-to-head'),

  seasonTrends: () =>
    analyticsClient.get('/analytics/team/seasons'),
};

export const captaincyAnalytics = {
  leaderboard: () =>
    analyticsClient.get('/analytics/captaincy/leaderboard'),

  profile: (playerId: string) =>
    analyticsClient.get(`/analytics/captaincy/profile/${playerId}`),
};
```

---

## Step 6 — Key Components

### src/components/shared/PhaseToggle.tsx
```tsx
import { type PhaseMode } from '../../utils/phaseUtils';

interface Props {
  mode: PhaseMode;
  onToggle: () => void;
}

export function PhaseToggle({ mode, onToggle }: Props) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-400">Phase view:</span>
      <button
        onClick={onToggle}
        className="flex rounded-md overflow-hidden border border-slate-600 text-xs"
      >
        <span className={`px-3 py-1.5 transition-colors ${
          mode === '3-phase' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
        }`}>3-Phase</span>
        <span className={`px-3 py-1.5 transition-colors ${
          mode === '4-phase' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
        }`}>4-Phase</span>
      </button>
    </div>
  );
}
```

### src/components/shared/VenueTypeBadge.tsx
```tsx
import { VenueType } from '../../types/enums';

const styles: Record<VenueType, string> = {
  [VenueType.HOME]:    'bg-green-900/40 text-green-300 border-green-700/40',
  [VenueType.AWAY]:    'bg-red-900/40 text-red-300 border-red-700/40',
  [VenueType.NEUTRAL]: 'bg-slate-700/40 text-slate-300 border-slate-600/40',
};

export function VenueTypeBadge({ type }: { type: VenueType }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[type]}`}>
      {type}
    </span>
  );
}
```

### src/components/player/MilestoneTimeline.tsx
```tsx
import { format } from 'date-fns';
import { MilestoneType } from '../../types/enums';

interface Milestone {
  milestoneType: MilestoneType;
  achievedAt: string;
  detail: string;
  matchId: string;
}

const MILESTONE_ICONS: Record<MilestoneType, string> = {
  [MilestoneType.DEBUT]:          '🏏',
  [MilestoneType.FIRST_30]:       '🔸',
  [MilestoneType.FIRST_50]:       '⭐',
  [MilestoneType.FIRST_100]:      '💯',
  [MilestoneType.FIRST_4FER]:     '🎳',
  [MilestoneType.FIRST_5FER]:     '🏆',
  [MilestoneType.FIRST_HATTRICK]: '🎩',
  [MilestoneType.FIRST_MOTM]:     '🥇',
};

export function MilestoneTimeline({ milestones }: { milestones: Milestone[] }) {
  const sorted = [...milestones].sort(
    (a, b) => new Date(a.achievedAt).getTime() - new Date(b.achievedAt).getTime()
  );

  return (
    <div className="relative ml-4 border-l border-slate-700 pl-6 space-y-6">
      {sorted.map((m) => (
        <div key={m.milestoneType} className="relative">
          <span className="absolute -left-9 flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 border border-slate-600 text-base">
            {MILESTONE_ICONS[m.milestoneType]}
          </span>
          <p className="text-sm font-semibold text-slate-200">{m.detail}</p>
          <p className="text-xs text-slate-500 mt-0.5">
            {format(new Date(m.achievedAt), 'd MMM yyyy')}
          </p>
        </div>
      ))}
    </div>
  );
}
```

### src/components/charts/WormChart.tsx
```tsx
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts';

interface OverData {
  over: number;
  moraRuns: number | null;
  oppRuns: number | null;
  moraWickets: number;
  oppWickets: number;
}

export function WormChart({ data, moraScore, oppScore }: {
  data: OverData[];
  moraScore: string;
  oppScore: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3e" />
        <XAxis
          dataKey="over"
          label={{ value: 'Over', position: 'insideBottom', offset: -2 }}
          stroke="#9aa3b0" tick={{ fontSize: 11 }}
        />
        <YAxis stroke="#9aa3b0" tick={{ fontSize: 11 }} />
        <Tooltip
          contentStyle={{ background: '#1e2130', border: '1px solid #2a2d3e', borderRadius: 8 }}
          labelFormatter={(v) => `Over ${v}`}
        />
        <Legend />
        <Line
          type="monotone" dataKey="moraRuns" name={`Mora (${moraScore})`}
          stroke="#4fc3f7" strokeWidth={2} dot={false} connectNulls
        />
        <Line
          type="monotone" dataKey="oppRuns" name={`Opponent (${oppScore})`}
          stroke="#ef5350" strokeWidth={2} dot={false} connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

---

## Step 7 — Router

### src/App.tsx
```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import PageLayout from './components/layout/PageLayout';
import { ProtectedRoute } from './components/shared/ProtectedRoute';

// Public
import HomePage from './pages/public/HomePage';
import MatchesPage from './pages/public/MatchesPage';
import MatchDetailPage from './pages/public/MatchDetailPage';
import PlayersPage from './pages/public/PlayersPage';
import PlayerDetailPage from './pages/public/PlayerDetailPage';
import TeamAnalyticsPage from './pages/public/TeamAnalyticsPage';
import BatchAnalyticsPage from './pages/public/BatchAnalyticsPage';
import RecordsPage from './pages/public/RecordsPage';
import CaptaincyPage from './pages/public/CaptaincyPage';
import HeadToHeadPage from './pages/public/HeadToHeadPage';

// Admin
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import CreateMatchPage from './pages/admin/matches/CreateMatchPage';
import MatchEntryPage from './pages/admin/matches/MatchEntryPage';
import CreateEditPlayerPage from './pages/admin/players/CreateEditPlayerPage';
import LoginPage from './pages/LoginPage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5 * 60 * 1000, retry: 1 } },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<PageLayout />}>
            <Route path="/"              element={<HomePage />} />
            <Route path="/matches"       element={<MatchesPage />} />
            <Route path="/matches/:id"   element={<MatchDetailPage />} />
            <Route path="/players"       element={<PlayersPage />} />
            <Route path="/players/:id"   element={<PlayerDetailPage />} />
            <Route path="/analytics"     element={<TeamAnalyticsPage />} />
            <Route path="/batches"       element={<BatchAnalyticsPage />} />
            <Route path="/records"       element={<RecordsPage />} />
            <Route path="/captaincy"     element={<CaptaincyPage />} />
            <Route path="/head-to-head"  element={<HeadToHeadPage />} />
          </Route>

          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute requiredRole="Admin" />}>
            <Route path="/admin"                       element={<AdminDashboardPage />} />
            <Route path="/admin/matches/new"           element={<CreateMatchPage />} />
            <Route path="/admin/matches/:id/entry"     element={<MatchEntryPage />} />
            <Route path="/admin/players/new"           element={<CreateEditPlayerPage />} />
            <Route path="/admin/players/:id/edit"      element={<CreateEditPlayerPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```
