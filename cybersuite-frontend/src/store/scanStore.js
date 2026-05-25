import { create } from 'zustand'

export const useScanStore = create((set, get) => ({
  history:    [],
  activeScans: 0,

  addToHistory: (entry) => set(state => ({
    history: [{ id: Date.now(), timestamp: new Date().toISOString(), ...entry }, ...state.history].slice(0, 100),
  })),

  clearHistory: () => set({ history: [] }),

  incrementScans: () => set(state => ({ activeScans: state.activeScans + 1 })),
  decrementScans: () => set(state => ({ activeScans: Math.max(0, state.activeScans - 1) })),
}))
