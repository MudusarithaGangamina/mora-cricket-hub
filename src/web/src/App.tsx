import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ProtectedRoute } from '@/components/shared/ProtectedRoute'

// ── Public pages ──────────────────────────────────────────────────────────────
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

// ── Admin pages ───────────────────────────────────────────────────────────────
import AdminDashboardPage    from '@/pages/admin/AdminDashboardPage'
import CreateMatchPage       from '@/pages/admin/matches/CreateMatchPage'
import MatchEntryPage        from '@/pages/admin/matches/MatchEntryPage'
import CreateEditPlayerPage  from '@/pages/admin/players/CreateEditPlayerPage'

// ── Auth ──────────────────────────────────────────────────────────────────────
import LoginPage from '@/pages/LoginPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,  // 5 minutes
      retry: 1,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/"                element={<HomePage />} />
          <Route path="/matches"         element={<MatchesPage />} />
          <Route path="/matches/:id"     element={<MatchDetailPage />} />
          <Route path="/players"         element={<PlayersPage />} />
          <Route path="/players/:id"     element={<PlayerDetailPage />} />
          <Route path="/analytics"       element={<TeamAnalyticsPage />} />
          <Route path="/batches"         element={<BatchAnalyticsPage />} />
          <Route path="/records"         element={<RecordsPage />} />
          <Route path="/captaincy"       element={<CaptaincyPage />} />
          <Route path="/head-to-head"    element={<HeadToHeadPage />} />

          {/* Auth */}
          <Route path="/login"           element={<LoginPage />} />

          {/* Admin — protected */}
          <Route element={<ProtectedRoute requiredRole="Admin" />}>
            <Route path="/admin"                    element={<AdminDashboardPage />} />
            <Route path="/admin/matches/new"        element={<CreateMatchPage />} />
            <Route path="/admin/matches/:id/entry"  element={<MatchEntryPage />} />
            <Route path="/admin/players/new"        element={<CreateEditPlayerPage />} />
            <Route path="/admin/players/:id/edit"   element={<CreateEditPlayerPage />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}