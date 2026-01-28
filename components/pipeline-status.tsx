"use client"

import { useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Target, Calendar, Flame, CheckCircle2, RefreshCw } from "lucide-react"
import { usePipelineData } from "@/hooks/use-pipeline-data"

export function PipelineStatus() {
  // Using default 2-minute interval to avoid API quota limits
  const { data, loading, error, lastUpdated, refetch } = usePipelineData()

  // Debug: Log data when it changes
  useMemo(() => {
    if (data && data.length > 0) {
      console.log('[Pipeline Status] Data received:', data.length, 'rows')
      console.log('[Pipeline Status] Sample row:', data[0])
      console.log('[Pipeline Status] Available columns:', Object.keys(data[0]))
    }
  }, [data])

  // Calculate pipeline stats from data
  const stats = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        totalLeads: 0,
        scheduled: 0,
        hotLeads: 0,
        meetingDone: 0,
      }
    }

    // Helper function to get value from row with flexible column name matching
    const getValue = (row: any, possibleKeys: string[]): any => {
      for (const key of possibleKeys) {
        // Try exact match (case-insensitive)
        const exactMatch = Object.keys(row).find(
          k => k.toLowerCase() === key.toLowerCase()
        )
        if (exactMatch !== undefined) {
          return row[exactMatch]
        }
      }
      return null
    }

    // Helper function to check if a value contains a search term (case-insensitive)
    const contains = (value: any, searchTerm: string): boolean => {
      if (!value) return false
      return value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    }

    // Helper function to check if a value equals a search term (case-insensitive)
    const equals = (value: any, searchTerm: string): boolean => {
      if (!value) return false
      return value.toString().toLowerCase() === searchTerm.toLowerCase()
    }

    // Total Leads: Count entries in "First Name" column
    const totalLeads = data.filter((row: any) => {
      const firstName = getValue(row, ['First Name', 'first name', 'FirstName', 'firstname', 'First_Name'])
      return firstName !== null && firstName !== undefined && firstName.toString().trim() !== ''
    }).length

    // Scheduled: Count entries where Status = "Meeting Scheduled" (exact match, case-insensitive)
    const scheduled = data.filter((row: any) => {
      const status = getValue(row, ['Status', 'status', 'STATUS'])
      if (!status) return false
      return status.toString().trim().toLowerCase() === 'meeting scheduled'
    }).length

    // Hot Leads: Count entries where Status = "hot" (exact match, case-insensitive)
    const hotLeads = data.filter((row: any) => {
      const status = getValue(row, ['Status', 'status', 'STATUS'])
      if (!status) return false
      return status.toString().trim().toLowerCase() === 'hot'
    }).length

    // Meeting Done: Count entries where Status = "Meeting Done" (exact match, case-insensitive)
    const meetingDone = data.filter((row: any) => {
      const status = getValue(row, ['Status', 'status', 'STATUS'])
      if (!status) return false
      return status.toString().trim().toLowerCase() === 'meeting done'
    }).length

    return {
      totalLeads,
      scheduled,
      hotLeads,
      meetingDone,
    }
  }, [data])

  return (
    <Card className="shadow-md border border-slate-200 bg-white">
      <CardContent className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-5 sm:mb-6">
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Pipeline Status</h2>
            <p className="text-sm text-slate-600 mt-1.5">Current lead distribution across pipeline stages</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {error && (
              <span className="text-xs sm:text-sm text-red-600 truncate max-w-[150px] sm:max-w-none">⚠️ <span className="hidden sm:inline">{error}</span><span className="sm:hidden">Error</span></span>
            )}
            {lastUpdated && !error && (
              <span className="text-xs text-slate-500 whitespace-nowrap">
                <span className="hidden sm:inline">Updated: </span>{new Date(lastUpdated).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            <button
              onClick={refetch}
              disabled={loading}
              className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-0 text-xs sm:text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md sm:rounded-none p-1 sm:p-0 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {/* Total Leads */}
          <div className="bg-white rounded-xl p-5 border border-[#0db14b] hover:border-[3px] hover:border-[#0db14b] transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-1">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700 font-medium mb-2">Total Leads</p>
                <p className="text-3xl sm:text-4xl font-bold text-slate-900 leading-none">
                  {loading ? '...' : stats.totalLeads.toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg p-2.5 ml-3 flex-shrink-0" style={{ backgroundColor: '#0b74bb' }}>
                <Target className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          {/* Scheduled */}
          <div className="bg-white rounded-xl p-5 border border-[#0db14b] hover:border-[3px] hover:border-[#0db14b] transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-1">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700 font-medium mb-2">Scheduled</p>
                <p className="text-3xl sm:text-4xl font-bold text-slate-900 leading-none">
                  {loading ? '...' : stats.scheduled.toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg p-2.5 ml-3 flex-shrink-0" style={{ backgroundColor: '#58595b' }}>
                <Calendar className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          {/* Hot Leads */}
          <div className="bg-white rounded-xl p-5 border border-[#0db14b] hover:border-[3px] hover:border-[#0db14b] transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-1">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700 font-medium mb-2">Hot Leads</p>
                <p className="text-3xl sm:text-4xl font-bold text-slate-900 leading-none">
                  {loading ? '...' : stats.hotLeads.toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg p-2.5 ml-3 flex-shrink-0" style={{ backgroundColor: '#0db14b' }}>
                <Flame className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          {/* Meeting Done */}
          <div className="bg-white rounded-xl p-5 border border-[#0db14b] hover:border-[3px] hover:border-[#0db14b] transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-1">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700 font-medium mb-2">Meeting Done</p>
                <p className="text-3xl sm:text-4xl font-bold text-slate-900 leading-none">
                  {loading ? '...' : stats.meetingDone.toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg p-2.5 ml-3 flex-shrink-0" style={{ backgroundColor: '#0b74bb' }}>
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
