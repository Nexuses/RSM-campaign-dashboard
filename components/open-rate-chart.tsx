"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { useSheetsData } from "@/hooks/use-sheets-data"
import { useFilterContext } from "@/contexts/filter-context"
import { BarChart3 } from "lucide-react"

const mockData = [
  { name: "ESG Set 1", openRate: 28.5, clickRate: 23.0 },
  { name: "ESG Set 2", openRate: 40.12, clickRate: 34.17 },
  { name: "ESG Cement", openRate: 38.89, clickRate: 100 },
  { name: "ESG Insurance", openRate: 27.63, clickRate: 0 },
  { name: "ESG Set 3", openRate: 43.12, clickRate: 35.32 },
  { name: "TA Set 1", openRate: 47.9, clickRate: 26.64 },
  { name: "TA Set 2", openRate: 37.02, clickRate: 29.53 },
  { name: "TA Followup", openRate: 38.41, clickRate: 32.67 },
  { name: "VAPT Set 1", openRate: 42.46, clickRate: 31.99 },
  { name: "VAPT Set 2", openRate: 29.01, clickRate: 22.6 },
  { name: "VAPT Set 3", openRate: 16.52, clickRate: 13.26 },
  { name: "VAPT Set 4", openRate: 44.08, clickRate: 32.46 },
  { name: "VAPT Followup", openRate: 36.05, clickRate: 0 },
]

export function OpenRateChart() {
  // Using default 2-minute interval to avoid API quota limits
  const { data: sheetsData } = useSheetsData()
  const { projectFilter, dateRangeFilter, customStartDate, customEndDate, getDateRange } = useFilterContext()

  const data = useMemo(() => {
    if (sheetsData && sheetsData.length > 0) {
      // Apply filters
      let filteredData = sheetsData

      // Apply project filter
      if (projectFilter !== 'all') {
        filteredData = filteredData.filter((row) => {
          const solution = row.project || row.solutionArea || ''
          const solutionLower = solution.toString().toLowerCase()
          if (projectFilter === 'ESG') return solutionLower === 'esg' || solutionLower.startsWith('esg')
          if (projectFilter === 'TA') return solutionLower === 'ta' || solutionLower.includes('transitional')
          if (projectFilter === 'VAPT') return solutionLower === 'vapt' || solutionLower.includes('vapt')
          return true
        })
      }

      // Apply date filter
      const dateRange = getDateRange()
      if (dateRange.start && dateRange.end) {
        filteredData = filteredData.filter((row) => {
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
            return date >= dateRange.start! && date <= dateRange.end!
          } catch (e) {
            return false
          }
        })
      }

      return filteredData.map((row) => {
        const openRate = parseFloat(row.openRate?.toString().replace('%', '') || '0')
        const clickRate = parseFloat(row.clickRate?.toString().replace('%', '') || '0')
        return {
          name: row.campaignName.length > 20 
            ? row.campaignName.substring(0, 20) + '...' 
            : row.campaignName,
          openRate: isNaN(openRate) ? 0 : openRate,
          clickRate: isNaN(clickRate) ? 0 : clickRate,
        }
      }).slice(0, 20) // Limit to 20 items for better visualization
    }
    return mockData
  }, [sheetsData, projectFilter, dateRangeFilter, customStartDate, customEndDate, getDateRange])
  return (
    <Card className="shadow-md border-slate-200 bg-white">
      <CardHeader className="pb-4 px-5 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-gradient-to-br from-[#0db14b] to-[#0a9f42] shadow-md flex-shrink-0 flex items-center justify-center text-base" style={{ width: '1.2em', height: '1.2em' }}>
            <BarChart3 className="text-white" style={{ width: '0.75em', height: '0.75em' }} />
          </div>
          <CardTitle className="text-base sm:text-lg font-semibold">Campaign Open & Click Rates</CardTitle>
        </div>
        <CardDescription className="mt-1.5 text-sm">Comparison of campaign performance metrics</CardDescription>
      </CardHeader>
      <CardContent className="px-5 sm:px-6 pb-5 sm:pb-6">
        <div className="h-[350px] sm:h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={100}
                tick={{ fill: "#64748b", fontSize: 12 }}
              />
              <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
              <Bar dataKey="openRate" fill="#0b74bb" name="Open Rate %" radius={[8, 8, 0, 0]} /> {/* RSM blue */}
              <Bar dataKey="clickRate" fill="#58595b" name="Click Rate %" radius={[8, 8, 0, 0]} /> {/* RSM grey */}
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-4 sm:gap-6 mt-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded flex-shrink-0" style={{ backgroundColor: '#0b74bb' }}></div>
            <span className="text-sm text-slate-600">Open Rate %</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded flex-shrink-0" style={{ backgroundColor: '#58595b' }}></div>
            <span className="text-sm text-slate-600">Click Rate %</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
