"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { Layers } from "lucide-react"
import { useSheetsData } from "@/hooks/use-sheets-data"
import { useFilterContext } from "@/contexts/filter-context"

const mockData = [
  { name: "ESG", value: 5, fill: "#0b74bb" }, // RSM blue
  { name: "Transitional Advisory", value: 3, fill: "#0db14b" }, // RSM green
  { name: "VAPT", value: 5, fill: "#58595b" }, // RSM grey
]

/**
 * Normalize solution name to one of the allowed categories (ESG, VAPT, Transitional Advisory)
 */
function normalizeSolution(solution: string): string | null {
  if (!solution) return null;
  
  const solutionLower = solution.toString().trim().toLowerCase();
  
  // Check for VAPT (exact match or contains VAPT)
  if (solutionLower === 'vapt' || solutionLower.includes('vapt')) {
    return 'VAPT';
  }
  
  // Check for Transitional Advisory (TA, TAS, Transitional Advisory, etc.)
  if (solutionLower === 'ta' || 
      solutionLower === 'tas' ||
      solutionLower === 'transitional advisory' || 
      solutionLower.includes('transitional advisory') ||
      solutionLower.includes('transitional')) {
    return 'Transitional Advisory';
  }
  
  // Check for ESG (any variant: ESG, ESG General, ESG Cement, ESG Insurance, etc.)
  if (solutionLower === 'esg' || solutionLower.startsWith('esg')) {
    return 'ESG';
  }
  
  return null;
}

export function SolutionsDistributionChart() {
  const { data: sheetsData } = useSheetsData()
  const { projectFilter, dateRangeFilter, customStartDate, customEndDate } = useFilterContext()

  const data = useMemo(() => {
    if (!sheetsData || sheetsData.length === 0) return mockData

    // Apply filters
    let filteredData = sheetsData

    // Apply project filter
    if (projectFilter !== 'all') {
      filteredData = filteredData.filter((row) => {
        const solution = row.project || row.solutionArea || ''
        const normalizedSolution = normalizeSolution(solution)
        if (projectFilter === 'ESG') return normalizedSolution === 'ESG'
        if (projectFilter === 'TA') return normalizedSolution === 'Transitional Advisory'
        if (projectFilter === 'VAPT') return normalizedSolution === 'VAPT'
        return true
      })
    }

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
    
    if (dateRangeStart && dateRangeEnd) {
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
          return date >= dateRangeStart! && date <= dateRangeEnd!
        } catch (e) {
          return false
        }
      })
    }

    // Count solutions
    const solutionCounts: Record<string, number> = {}
    
    filteredData.forEach((row) => {
      const solution = row.project || row.solutionArea || ''
      const normalizedSolution = normalizeSolution(solution)
      if (normalizedSolution) {
        solutionCounts[normalizedSolution] = (solutionCounts[normalizedSolution] || 0) + 1
      }
    })

    // Define colors for the three allowed solutions (RSM brand colors)
    const colorMap: Record<string, string> = {
      'ESG': '#0b74bb', // RSM blue
      'Transitional Advisory': '#0db14b', // RSM green
      'VAPT': '#58595b', // RSM grey
    }

    // Return data in a consistent order: VAPT, TA, ESG
    const orderedSolutions = ['VAPT', 'Transitional Advisory', 'ESG']
    const result = orderedSolutions
      .filter(name => solutionCounts[name] > 0)
      .map((name) => ({
        name,
        value: solutionCounts[name],
        fill: colorMap[name],
      }))

    return result.length > 0 ? result : mockData
  }, [sheetsData, projectFilter, dateRangeFilter, customStartDate, customEndDate])

  const loading = !sheetsData
  return (
    <Card className="h-full flex flex-col shadow-md border-slate-200 bg-white">
      <CardHeader className="pb-4 px-5 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-gradient-to-br from-[#0b74bb] to-[#0a6ba8] shadow-md flex-shrink-0 flex items-center justify-center text-base" style={{ width: '1.2em', height: '1.2em' }}>
            <Layers className="text-white" style={{ width: '0.75em', height: '0.75em' }} />
          </div>
          <CardTitle className="text-base sm:text-lg font-semibold">Solutions</CardTitle>
        </div>
        <CardDescription className="mt-1.5 text-sm">Campaign count by solution type</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex items-center justify-center px-5 sm:px-6 pb-5 sm:pb-6">
        {loading && (
          <div className="h-[300px] sm:h-[350px] flex items-center justify-center text-slate-500 text-sm">
            Loading solutions data...
          </div>
        )}
        {!loading && (
          <div className="w-full h-[300px] sm:h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius="60%"
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
