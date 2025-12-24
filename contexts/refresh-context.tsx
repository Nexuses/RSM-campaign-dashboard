"use client"

import { createContext, useContext, useState, ReactNode, useCallback } from 'react'

interface RefreshContextType {
  refreshAll: () => void
  autoRefresh: boolean
  setAutoRefresh: (value: boolean) => void
}

const RefreshContext = createContext<RefreshContextType | undefined>(undefined)

export function RefreshProvider({ children }: { children: ReactNode }) {
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true)
  const [refreshKey, setRefreshKey] = useState(0)

  const refreshAll = useCallback(() => {
    // Trigger refresh by updating key
    setRefreshKey(prev => prev + 1)
    // Dispatch custom event for components to listen to
    window.dispatchEvent(new CustomEvent('dashboard-refresh'))
  }, [])

  return (
    <RefreshContext.Provider
      value={{
        refreshAll,
        autoRefresh,
        setAutoRefresh,
      }}
    >
      {children}
    </RefreshContext.Provider>
  )
}

export function useRefreshContext() {
  const context = useContext(RefreshContext)
  if (context === undefined) {
    throw new Error('useRefreshContext must be used within a RefreshProvider')
  }
  return context
}


