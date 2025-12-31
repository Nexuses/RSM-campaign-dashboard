"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface FilterContextType {
  projectFilter: string
  dateRangeFilter: string
  customStartDate: string
  customEndDate: string
  setProjectFilter: (value: string) => void
  setDateRangeFilter: (value: string) => void
  setCustomStartDate: (value: string) => void
  setCustomEndDate: (value: string) => void
  getDateRange: () => { start: Date | null; end: Date | null }
}

const FilterContext = createContext<FilterContextType | undefined>(undefined)

export function FilterProvider({ children }: { children: ReactNode }) {
  const [projectFilter, setProjectFilter] = useState<string>('all')
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('all')
  const [customStartDate, setCustomStartDate] = useState<string>('')
  const [customEndDate, setCustomEndDate] = useState<string>('')

  const getDateRange = useCallback((): { start: Date | null; end: Date | null } => {
    const today = new Date()
    today.setHours(23, 59, 59, 999)

    switch (dateRangeFilter) {
      case 'lastWeek':
        const lastWeek = new Date(today)
        lastWeek.setDate(today.getDate() - 7)
        lastWeek.setHours(0, 0, 0, 0)
        return { start: lastWeek, end: today }
      
      case 'lastMonth':
        const lastMonth = new Date(today)
        lastMonth.setMonth(today.getMonth() - 1)
        lastMonth.setHours(0, 0, 0, 0)
        return { start: lastMonth, end: today }
      
      case 'custom':
        if (customStartDate && customEndDate) {
          const start = new Date(customStartDate)
          const end = new Date(customEndDate)
          start.setHours(0, 0, 0, 0)
          end.setHours(23, 59, 59, 999)
          return { start, end }
        }
        return { start: null, end: null }
      
      default: // 'all'
        return { start: null, end: null }
    }
  }, [dateRangeFilter, customStartDate, customEndDate])

  return (
    <FilterContext.Provider
      value={{
        projectFilter,
        dateRangeFilter,
        customStartDate,
        customEndDate,
        setProjectFilter,
        setDateRangeFilter,
        setCustomStartDate,
        setCustomEndDate,
        getDateRange,
      }}
    >
      {children}
    </FilterContext.Provider>
  )
}

export function useFilterContext() {
  const context = useContext(FilterContext)
  if (context === undefined) {
    throw new Error('useFilterContext must be used within a FilterProvider')
  }
  return context
}


