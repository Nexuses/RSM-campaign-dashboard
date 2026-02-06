"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { useSheetsData } from "@/hooks/use-sheets-data"
import { useFilterContext } from "@/contexts/filter-context"
import { TrendingUp } from "lucide-react"

const mockData = [
  { name: "1-1 Campaigns", openRate: 32.0 },
  { name: "Drip", openRate: 36.8 },
]

export function CampaignPerformanceChart() {
  const { projectFilter, dateRangeFilter, customStartDate, customEndDate } = useFilterContext()
  const { data: oneOnOneData, loading: loadingOneOnOne } = useSheetsData({ sheetType: 'oneOnOne' })
  const { data: dripData, loading: loadingDrip } = useSheetsData({ sheetType: 'drip' })
  
  const loading = loadingOneOnOne || loadingDrip

  const chartData = useMemo(() => {
    // Apply date filter
    let dateRangeStart: Date | null = null
    let dateRangeEnd: Date | null = null
    
    if (dateRangeFilter !== 'all') {
      const today = new Date()
      today.setHours(23, 59, 59, 999)
      
      switch (dateRangeFilter) {
        case 'lastWeek':
          const lastWeek = new Date(today)
          lastWeek.setDate(today.getDate() - 7)
          lastWeek.setHours(0, 0, 0, 0)
          dateRangeStart = lastWeek
          dateRangeEnd = today
          break
        case 'lastMonth':
          const lastMonth = new Date(today)
          lastMonth.setMonth(today.getMonth() - 1)
          lastMonth.setHours(0, 0, 0, 0)
          dateRangeStart = lastMonth
          dateRangeEnd = today
          break
        case 'custom':
          if (customStartDate && customEndDate) {
            const start = new Date(customStartDate)
            const end = new Date(customEndDate)
            start.setHours(0, 0, 0, 0)
            end.setHours(23, 59, 59, 999)
            dateRangeStart = start
            dateRangeEnd = end
          }
          break
      }
    }

    // Helper function to filter and calculate average open rate
    const calculateAverageOpenRate = (data: any[], isOneOnOne: boolean) => {
      let filtered = data

      // Apply project filter (only for drip campaigns, 1-1 campaigns don't have project filter)
      if (!isOneOnOne && projectFilter !== 'all') {
        filtered = filtered.filter((row) => {
          const solution = row.project || row.solutionArea || ''
          const solutionLower = solution.toString().toLowerCase()
          if (projectFilter === 'ESG') return solutionLower === 'esg' || solutionLower.startsWith('esg')
          if (projectFilter === 'TA') return solutionLower === 'ta' || solutionLower === 'tas' || solutionLower.includes('transitional')
          if (projectFilter === 'VAPT') return solutionLower === 'vapt' || solutionLower.includes('vapt')
          return true
        })
      }

      // Apply date filter
      if (dateRangeStart && dateRangeEnd) {
        filtered = filtered.filter((row) => {
          const dateStr = row.date || ''
          if (!dateStr) return false
          
          try {
            const dateParts = dateStr.toString().split('/')
            let date: Date | null = null
            if (dateParts.length === 3) {
              const month = parseInt(dateParts[0], 10) - 1
              const day = parseInt(dateParts[1], 10)
              const year = parseInt(dateParts[2], 10)
              date = new Date(year, month, day)
            } else {
              date = new Date(dateStr)
            }
            
            if (!date || isNaN(date.getTime())) return false
            date.setHours(0, 0, 0, 0)
            return date >= dateRangeStart! && date <= dateRangeEnd!
          } catch (e) {
            return false
          }
        })
      }

      // Calculate average open rate - ignore empty cells
      let sum = 0
      let count = 0
      
      filtered.forEach((row) => {
        const openRateValue = row.openRate || row.open || row['Open Rate']
        
        // Skip empty cells: null, undefined, empty string
        if (openRateValue === null || openRateValue === undefined || openRateValue === '') {
          return
        }
        
        // Check if it's a string that's empty or represents "no value"
        const openRateStr = openRateValue.toString().trim()
        if (openRateStr === '' || openRateStr === '-' || openRateStr === 'N/A' || openRateStr.toLowerCase() === 'na' || openRateStr === 'null') {
          return
        }
        
        try {
          const cleaned = openRateStr.replace(/[%,\s]/g, '')
          const numValue = parseFloat(cleaned)
          if (!isNaN(numValue) && numValue >= 0) {
            sum += numValue
            count++
          }
        } catch (e) {
          // Skip invalid values
        }
      })

      return count > 0 ? parseFloat((sum / count).toFixed(1)) : 0
    }

    const oneOnOneRate = calculateAverageOpenRate(oneOnOneData, true)
    const dripRate = calculateAverageOpenRate(dripData, false)

    return [
      { name: '1-1 Campaigns', openRate: oneOnOneRate },
      { name: 'Drip', openRate: dripRate },
    ]
  }, [oneOnOneData, dripData, projectFilter, dateRangeFilter, customStartDate, customEndDate])
  return (
    <Card className="border-0 bg-white shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
      <CardHeader className="pb-4 px-6 pt-6 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-[#0db14b] to-[#0a9f42] shadow-lg p-2.5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold text-slate-900">Campaign Performance</CardTitle>
            <CardDescription className="text-sm text-slate-600 mt-0.5">Open rates by campaign type</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-6 pt-6">
        {loading && (
          <div className="h-[350px] flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center gap-3">
              <div className="w-32 h-32 rounded-lg bg-slate-200"></div>
              <p className="text-sm text-slate-500">Loading campaign performance data...</p>
            </div>
          </div>
        )}
        {!loading && (
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={chartData} 
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }} 
                barCategoryGap="25%"
              >
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0b74bb" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#0a6ba8" stopOpacity={0.8}/>
                  </linearGradient>
                  <filter id="barShadow">
                    <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.15"/>
                  </filter>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: "#64748b", fontSize: 13, fontWeight: 500 }} 
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fill: "#64748b", fontSize: 13 }} 
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05)",
                    padding: "12px",
                  }}
                  formatter={(value: number) => [`${value}%`, "Open Rate"]}
                  cursor={{ fill: 'rgba(11, 116, 187, 0.1)' }}
                />
                <Bar 
                  dataKey="openRate" 
                  fill="url(#barGradient)" 
                  name="Open Rate %" 
                  radius={[12, 12, 0, 0]} 
                  barSize={60}
                  animationBegin={0}
                  animationDuration={1000}
                  animationEasing="ease-out"
                  style={{ filter: "url(#barShadow)" }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
