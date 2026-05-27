/**
 * F1 — Auth Store (Zustand)
 * Stores JWT token and user info, persists to localStorage.
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: () => !!get().token,

      login: (token, email) => set({ token, user: { email } }),
      logout: () => set({ token: null, user: null }),
    }),
    { name: 'cybersuite-auth' }
  )
)
