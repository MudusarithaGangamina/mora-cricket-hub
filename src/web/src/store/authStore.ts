import { create } from 'zustand'

interface AuthUser {
  id: string
  email: string
  role: 'Admin' | 'Player' | 'Public'
  fullName: string
}

interface AuthState {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: AuthUser, token: string) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('mora_token'),
  isAuthenticated: !!localStorage.getItem('mora_token'),

  setAuth: (user, token) => {
    localStorage.setItem('mora_token', token)
    set({ user, token, isAuthenticated: true })
  },

  clearAuth: () => {
    localStorage.removeItem('mora_token')
    set({ user: null, token: null, isAuthenticated: false })
  },
}))