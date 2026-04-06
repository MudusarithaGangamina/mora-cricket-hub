import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

interface Props {
  requiredRole?: 'Admin' | 'Player'
}

export function ProtectedRoute({ requiredRole = 'Player' }: Props) {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) return <Navigate to="/login" replace />

  if (requiredRole === 'Admin' && user?.role !== 'Admin')
    return <Navigate to="/" replace />

  return <Outlet />
}