"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Target, Flame, GitBranch, TrendingUp, RefreshCw, ChevronRight } from "lucide-react"
import { useStats } from "@/hooks/use-stats"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"

type FilterType = 'default' | 'last7days' | 'last30days' | 'lastyear' | 'custom'

const statConfigs = [
  {
    title: "Total Prospects",
    key: "totalProspects" as const,
    icon: Target,
    gradient: "from-[#0b74bb] to-[#0a6ba8]",
    bgGradient: "from-blue-50 to-blue-50",
    borderColor: "border border-[#0db14b]",
    hoverBorderColor: "hover:border-[3px] hover:border-[#0db14b]",
  },
  {
    title: "Hot Leads",
    key: "hotLeads" as const,
    icon: Flame,
    gradient: "from-[#58595b] to-[#4a4b4d]",
    bgGradient: "from-slate-50 to-slate-50",
    borderColor: "border border-[#0db14b]",
    hoverBorderColor: "hover:border-[3px] hover:border-[#0db14b]",
  },
  {
    title: "Active Pipeline",
    key: "activePipeline" as const,
    icon: GitBranch,
    gradient: "from-[#0db14b] to-[#0a9f42]",
    bgGradient: "from-green-50 to-green-50",
    borderColor: "border border-[#0db14b]",
    hoverBorderColor: "hover:border-[3px] hover:border-[#0db14b]",
  },
  {
    title: "Avg Open Rate",
    key: "avgOpenRate" as const,
    icon: TrendingUp,
    gradient: "from-[#0b74bb] to-[#0a6ba8]",
    bgGradient: "from-blue-50 to-blue-50",
    borderColor: "border border-[#0db14b]",
    hoverBorderColor: "hover:border-[3px] hover:border-[#0db14b]",
  },
]

// Quick filters that can be cycled with arrow button (includes default)
const quickFilters: FilterType[] = ['default', 'last7days', 'last30days', 'lastyear']

export function StatsCards() {
  const [filter, setFilter] = useState<FilterType>('default')
  
  // Using default 2-minute interval to avoid API quota limits
  // Stats are fetched from multiple sources: Pipeline sheet and specific campaign sheets
  const { stats, loading, lastUpdated, refetch, error } = useStats({
    filter: filter,
    autoPoll: true, // Ensure auto-polling is enabled
  })
  
  // Refetch when filter changes (in addition to auto-polling)
  useEffect(() => {
    // Always refetch when filter changes
    refetch()
  }, [filter, refetch])
  
  // Get current quick filter index for arrow cycling
  const currentQuickFilterIndex = useMemo(() => {
    return quickFilters.indexOf(filter)
  }, [filter])
  
  // Cycle to next quick filter (cycles through default, last7days, last30days, lastyear)
  const cycleToNextFilter = () => {
    if (currentQuickFilterIndex !== -1) {
      // Cycle to next quick filter
      const nextIndex = (currentQuickFilterIndex + 1) % quickFilters.length
      const nextFilter = quickFilters[nextIndex]
      setFilter(nextFilter)
      // Refetch will be triggered by useEffect when filter changes
    }
  }
  
  // Show arrow button for all filters
  const showArrowButton = true
  
  // Get filter display name
  const getFilterName = (f: FilterType) => {
    switch (f) {
      case 'default': return 'Default'
      case 'last7days': return 'Last 7 Days'
      case 'last30days': return 'Last 30 Days'
      case 'lastyear': return 'Last Year'
      default: return 'Default'
    }
  }
  
  // Get description based on filter
  const getDescription = (key: string, filter: FilterType) => {
    if (filter === 'default') {
      switch (key) {
        case 'totalProspects': return 'Total leads this year'
        case 'hotLeads': return 'This month'
        case 'activePipeline': return 'This month'
        case 'avgOpenRate': return 'This week (1-1 RSM & RSM Stats - Drip)'
        default: return ''
      }
    } else if (filter === 'last7days') {
      return 'Last 7 days'
    } else if (filter === 'last30days') {
      return 'Last 30 days'
    } else if (filter === 'lastyear') {
      return 'Last year'
    }
    return ''
  }

  return (
    <div className="space-y-5">
      {/* Filter controls - placed above the cards */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
        <Select 
          value={filter} 
          onValueChange={(value) => {
            setFilter(value as FilterType)
            // Refetch will be triggered by useEffect when filter changes
          }}
        >
          <SelectTrigger className="h-8 px-2 sm:px-3 text-xs sm:text-sm bg-white border-slate-200 shadow-sm w-[120px] sm:w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="default">Default</SelectItem>
            <SelectItem value="last7days">Last 7 Days</SelectItem>
            <SelectItem value="last30days">Last 30 Days</SelectItem>
            <SelectItem value="lastyear">Last Year</SelectItem>
          </SelectContent>
        </Select>
        
        {/* Arrow button to cycle through quick filters (last7days, last30days, lastyear) */}
        {showArrowButton && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 bg-white border border-slate-200 shadow-sm hover:bg-slate-50"
            onClick={cycleToNextFilter}
            title={
              currentQuickFilterIndex !== -1
                ? `Cycle to: ${getFilterName(quickFilters[(currentQuickFilterIndex + 1) % quickFilters.length])}`
                : 'Cycle to: Default'
            }
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
      
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {statConfigs.map((stat) => {
          const Icon = stat.icon
          const value = stats?.[stat.key] || (loading ? "..." : "0")
          
          return (
            <Card
              key={stat.title}
              className={`hover:shadow-xl transition-all duration-300 hover:-translate-y-1 shadow-md bg-white ${stat.borderColor} ${stat.hoverBorderColor}`}
            >
              <CardContent className="p-5 sm:p-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2.5 rounded-lg bg-gradient-to-br ${stat.gradient} shadow-md flex-shrink-0`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700 truncate">{stat.title}</p>
                  </div>
                  <p className="text-3xl sm:text-4xl font-bold text-slate-900 leading-none">{value}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
