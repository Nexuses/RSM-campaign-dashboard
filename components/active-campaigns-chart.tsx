"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { Activity } from "lucide-react"
import { useFilterContext } from "@/contexts/filter-context"

const mockData = [
  { name: "Active", value: 14, fill: "#0db14b" }, // RSM green
  { name: "Completed", value: 0, fill: "#58595b" }, // RSM grey
]

export function ActiveCampaignsChart() {
  const { projectFilter, dateRangeFilter, customStartDate, customEndDate } = useFilterContext()
  const [oneOnOneData, setOneOnOneData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Fetch data from "1-1 RSM : All Campaign" sheet (same as original API)
  const fetchOneOnOneData = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/sheets?sheet=oneOnOne')
      const result = await response.json()
      
      if (response.ok) {
        if (result.success) {
          setOneOnOneData(result.data || [])
          console.log('[ActiveCampaigns] Fetched data:', result.data?.length || 0, 'rows')
        } else {
          console.error('[ActiveCampaigns] API error:', result.error || result.message)
          setOneOnOneData([]) // Set empty data on error
        }
      } else {
        // Handle 400 Bad Request and other errors
        const errorMessage = result.error || result.message || `${response.status} ${response.statusText}`
        console.error('[ActiveCampaigns] Fetch error:', response.status, response.statusText, errorMessage)
        
        // If it's a configuration error (400), log helpful message
        if (response.status === 400) {
          console.error('[ActiveCampaigns] Configuration error:', errorMessage)
          console.error('[ActiveCampaigns] Suggestion: Check that GOOGLE_SHEET_ID is set in .env.local file in the project root')
        }
        
        setOneOnOneData([]) // Set empty data on error
      }
    } catch (error) {
      console.error('[ActiveCampaigns] Error fetching 1-1 campaigns:', error)
      setOneOnOneData([]) // Set empty data on error
    } finally {
      setLoading(false)
    }
  }, [])
  
  useEffect(() => {
    fetchOneOnOneData()
    // Poll every 5 minutes to avoid quota limits
    const interval = setInterval(fetchOneOnOneData, 300000)
    return () => clearInterval(interval)
  }, [fetchOneOnOneData])

  // Helper function to find column value with flexible name matching (same as API)
  const getColumnValue = useCallback((row: any, possibleNames: string[]): any => {
    for (const name of possibleNames) {
      // Try exact match first
      if (row[name] !== undefined && row[name] !== null && row[name] !== '') {
        return row[name];
      }
      // Try case-insensitive match
      const foundKey = Object.keys(row).find(
        key => key.toLowerCase() === name.toLowerCase()
      );
      if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null && row[foundKey] !== '') {
        return row[foundKey];
      }
    }
    return null;
  }, []);

  const data = useMemo(() => {
    // Use only oneOnOne data (matches original API behavior)
    const allData = oneOnOneData || []
    
    if (allData.length === 0) {
      // Return mock data when no data is available
      return mockData
    }

    // Count ALL Active and Completed entries from Status column (don't apply filters)
    // The Active Campaigns card should show total counts regardless of project/date filters
    let active = 0
    let completed = 0
    
    // Debug: Log first row to see structure
    console.log('[ActiveCampaigns] Total rows:', allData.length)
    if (allData.length > 0) {
      console.log('[ActiveCampaigns] Sample row keys:', Object.keys(allData[0]))
      console.log('[ActiveCampaigns] Sample row:', allData[0])
    }
    
    // Count all active/completed campaigns (no filtering)
    allData.forEach((row: any, index: number) => {
      // Check both normalized field (status) and original column names (Status, Status.)
      const status = row.status || getColumnValue(row, ['Status', 'status', 'STATUS', 'Status.', 'status.']);
      
      // Debug: Log all rows to see what we're getting
      console.log(`[ActiveCampaigns] Row ${index + 1}/${allData.length}:`, {
        status: status,
        statusType: typeof status,
        normalizedStatus: row.status,
        allKeys: Object.keys(row),
        hasStatusField: !!row.status,
        statusFromGetColumnValue: getColumnValue(row, ['Status', 'status', 'STATUS', 'Status.', 'status.'])
      })
      
      if (!status) {
        // Debug: Log rows without status
        console.log('[ActiveCampaigns] Row without status field. Available keys:', Object.keys(row))
        return
      }
      
      const statusStr = status.toString().trim()
      const statusLower = statusStr.toLowerCase()
      // Count entries where status is "Active" or "active" (case-insensitive, from dropdown)
      if (statusLower === 'active') {
        active++
        console.log(`[ActiveCampaigns] Found active entry #${active}:`, statusStr)
      } else if (statusLower === 'completed') {
        completed++
        console.log(`[ActiveCampaigns] Found completed entry #${completed}:`, statusStr)
      } else {
        // Debug: Log unrecognized status values
        console.log('[ActiveCampaigns] Unrecognized status value:', statusStr, 'Raw value:', status, 'Type:', typeof status)
      }
    })
    
    // Debug: Log counts
    console.log('[ActiveCampaigns] Results - Total rows:', allData.length, 'Active:', active)

    // Always return valid data structure with actual counts
    const result = [
      { name: "Active", value: active, fill: "#0db14b" }, // RSM green
      { name: "Completed", value: completed, fill: "#58595b" }, // RSM grey
    ]
    
    console.log('[ActiveCampaigns] Final data:', result)
    console.log('[ActiveCampaigns] oneOnOneData length:', oneOnOneData?.length || 0)
    console.log('[ActiveCampaigns] Active count:', active, 'Completed count:', completed)
    console.log('[ActiveCampaigns] Total rows:', allData.length)
    
    return result
  }, [oneOnOneData, getColumnValue])
  return (
    <Card className="h-full flex flex-col border-0 bg-white shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
      <CardHeader className="pb-4 px-6 pt-6 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-[#58595b] to-[#4a4b4d] shadow-lg p-2.5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold text-slate-900">Active Campaigns</CardTitle>
            <CardDescription className="text-sm text-slate-600 mt-0.5">Campaign status distribution</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col items-center justify-center px-6 pb-6 pt-6">
        {loading && (
          <div className="h-[350px] flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-slate-200"></div>
              <p className="text-sm text-slate-500">Loading active campaigns data...</p>
            </div>
          </div>
        )}
        {!loading && (
          <>
            {(!oneOnOneData || oneOnOneData.length === 0) ? (
              <div className="w-full h-[350px] flex items-center justify-center">
                <div className="text-center">
                  <p className="text-slate-500 text-sm">No data available</p>
                  <p className="text-slate-400 text-xs mt-1">Loading from "1-1 RSM : All Campaign" sheet</p>
                </div>
              </div>
            ) : data.reduce((sum, item) => sum + item.value, 0) === 0 ? (
              <div className="w-full h-[350px] flex items-center justify-center">
                <div className="text-center">
                  <p className="text-slate-500 text-sm">No Active campaigns found</p>
                  <p className="text-slate-400 text-xs mt-1">Data loaded: {oneOnOneData.length} rows</p>
                </div>
              </div>
            ) : (
              <div className="w-full h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <defs>
                      <filter id="pieShadow">
                        <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.1"/>
                      </filter>
                    </defs>
                    <Pie
                      data={data}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius="55%"
                      innerRadius="30%"
                      fill="#8884d8"
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={800}
                      animationEasing="ease-out"
                    >
                      {data.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.fill}
                          style={{ filter: "url(#pieShadow)" }}
                          className="transition-all duration-300 hover:opacity-90"
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05)",
                        padding: "12px",
                      }}
                      formatter={(value: number) => [value, "Count"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            <div className="w-full mt-6 pt-6 border-t border-slate-100">
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center justify-center gap-6 flex-wrap">
                  {data.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2.5">
                      <div 
                        className="w-4 h-4 rounded-md flex-shrink-0 shadow-sm" 
                        style={{ backgroundColor: entry.fill }}
                      />
                      <span className="text-sm font-medium text-slate-700">
                        {entry.name}: {entry.value}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-1">1-1 Campaigns</p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
