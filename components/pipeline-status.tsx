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
    <Card className="border-0 bg-white shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-900">Pipeline Status</h2>
            <p className="text-sm text-slate-600 mt-1.5">Current lead distribution across pipeline stages</p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {error && (
              <span className="text-sm text-red-600 truncate max-w-[200px]">⚠️ {error}</span>
            )}
            {lastUpdated && !error && (
              <span className="text-xs text-slate-500 whitespace-nowrap">
                Updated: {new Date(lastUpdated).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            <button
              onClick={refetch}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Leads */}
          <div className="group relative bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-[#0b74bb] transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-1 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#0b74bb]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-600 font-medium mb-2">Total Leads</p>
                <p className="text-4xl font-bold text-slate-900 leading-none">
                  {loading ? '...' : stats.totalLeads.toLocaleString()}
                </p>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-[#0b74bb] to-[#0a6ba8] shadow-lg p-3 ml-3 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                <Target className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          {/* Scheduled */}
          <div className="group relative bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-[#58595b] transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-1 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#58595b]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-600 font-medium mb-2">Scheduled</p>
                <p className="text-4xl font-bold text-slate-900 leading-none">
                  {loading ? '...' : stats.scheduled.toLocaleString()}
                </p>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-[#58595b] to-[#4a4b4d] shadow-lg p-3 ml-3 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                <Calendar className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          {/* Hot Leads */}
          <div className="group relative bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-[#0db14b] transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-1 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#0db14b]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-600 font-medium mb-2">Hot Leads</p>
                <p className="text-4xl font-bold text-slate-900 leading-none">
                  {loading ? '...' : stats.hotLeads.toLocaleString()}
                </p>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-[#0db14b] to-[#0a9f42] shadow-lg p-3 ml-3 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                <Flame className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          {/* Meeting Done */}
          <div className="group relative bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-[#0b74bb] transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-1 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#0b74bb]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-600 font-medium mb-2">Meeting Done</p>
                <p className="text-4xl font-bold text-slate-900 leading-none">
                  {loading ? '...' : stats.meetingDone.toLocaleString()}
                </p>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-[#0b74bb] to-[#0a6ba8] shadow-lg p-3 ml-3 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
