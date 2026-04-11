import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

interface Props {
  requiredRole?: 'Admin' | 'Player'
}

export function ProtectedRoute({ requiredRole = 'Player' }: Props) {
  const { isAuthenticated, user } = useAuthStore()

  // TODO: Remove this development bypass when auth is implemented
  const DEV_BYPASS = true
  
  if (DEV_BYPASS) {
    return <Outlet />
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />

  if (requiredRole === 'Admin' && user?.role !== 'Admin')
    return <Navigate to="/" replace />

  return <Outlet />
}