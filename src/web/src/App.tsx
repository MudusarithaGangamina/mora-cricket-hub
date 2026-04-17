import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ProtectedRoute } from '@/components/shared/ProtectedRoute'
import PageLayout from '@/components/layout/PageLayout'
import AdminLayout from '@/components/layout/AdminLayout'

// Public pages
import HomePage           from '@/pages/public/HomePage'
import MatchesPage        from '@/pages/public/MatchesPage'
import MatchDetailPage    from '@/pages/public/MatchDetailPage'
import PlayersPage        from '@/pages/public/PlayersPage'
import PlayerDetailPage   from '@/pages/public/PlayerDetailPage'
import TeamAnalyticsPage  from '@/pages/public/TeamAnalyticsPage'
import BatchAnalyticsPage from '@/pages/public/BatchAnalyticsPage'
import RecordsPage        from '@/pages/public/RecordsPage'
import CaptaincyPage      from '@/pages/public/CaptaincyPage'
import HeadToHeadPage     from '@/pages/public/HeadToHeadPage'

// Admin pages
import AdminDashboardPage    from '@/pages/admin/AdminDashboardPage'
import SeasonsPage           from '@/pages/admin/SeasonsPage'
import TournamentsPage       from '@/pages/admin/TournamentsPage'
import VenuesPage            from '@/pages/admin/VenuesPage'
import OpponentsPage         from '@/pages/admin/OpponentsPage'
import PlayerListPage        from '@/pages/admin/players/PlayerListPage'
import CreateEditPlayerPage  from '@/pages/admin/players/CreateEditPlayerPage'
import MatchListPage         from '@/pages/admin/matches/MatchListPage'
import CreateMatchPage       from '@/pages/admin/matches/CreateMatchPage'
import MatchEntryPage        from '@/pages/admin/matches/MatchEntryPage'

import LoginPage from '@/pages/LoginPage'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5 * 60 * 1000, retry: 1 } },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>

          {/* ── Public ── */}
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

          {/* ── Admin (protected + own layout) ── */}
          <Route element={<ProtectedRoute requiredRole="Admin" />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin"                     element={<AdminDashboardPage />} />
              <Route path="/admin/seasons"             element={<SeasonsPage />} />
              <Route path="/admin/tournaments"         element={<TournamentsPage />} />
              <Route path="/admin/venues"              element={<VenuesPage />} />
              <Route path="/admin/opponents"           element={<OpponentsPage />} />
              <Route path="/admin/players"             element={<PlayerListPage />} />
              <Route path="/admin/players/new"         element={<CreateEditPlayerPage />} />
              <Route path="/admin/players/:id/edit"    element={<CreateEditPlayerPage />} />
              <Route path="/admin/matches"             element={<MatchListPage />} />
              <Route path="/admin/matches/new"         element={<CreateMatchPage />} />
              <Route path="/admin/matches/:id/entry"   element={<MatchEntryPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}