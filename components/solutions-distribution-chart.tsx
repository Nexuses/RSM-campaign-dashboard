"use client"

import { useMemo, useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { Layers } from "lucide-react"
import { useRefreshContext } from "@/contexts/refresh-context"

const mockData = [
  { name: "ESG", value: 5, fill: "#0b74bb" }, // RSM blue
  { name: "Transitional Advisory", value: 3, fill: "#0db14b" }, // RSM green
  { name: "VAPT", value: 5, fill: "#58595b" }, // RSM grey
]

interface SolutionsData {
  name: string;
  value: number;
  fill: string;
}

export function SolutionsDistributionChart() {
  const [solutionsData, setSolutionsData] = useState<SolutionsData[]>(mockData)
  const [loading, setLoading] = useState(true)
  const { autoRefresh } = useRefreshContext()

  // Fetch solutions data from API
  useEffect(() => {
    const fetchSolutionsData = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/solutions-distribution')
        
        if (!response.ok) {
          throw new Error('Failed to fetch solutions data')
        }

        const result = await response.json()
        
        if (result.success && result.data && result.data.length > 0) {
          setSolutionsData(result.data)
        } else {
          // Use mock data if API returns empty
          setSolutionsData(mockData)
        }
      } catch (error) {
        console.error('Error fetching solutions data:', error)
        // Use mock data on error
        setSolutionsData(mockData)
      } finally {
        setLoading(false)
      }
    }

    // Initial fetch
    fetchSolutionsData()

    // Set up polling if auto-refresh is enabled (every 5 minutes)
    if (autoRefresh) {
      const interval = setInterval(fetchSolutionsData, 300000) // 5 minutes
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  // Listen for manual refresh events
  useEffect(() => {
    const handleRefresh = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/solutions-distribution')
        
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data && result.data.length > 0) {
            setSolutionsData(result.data)
          }
        }
      } catch (error) {
        console.error('Error refreshing solutions data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    window.addEventListener('dashboard-refresh', handleRefresh)
    return () => window.removeEventListener('dashboard-refresh', handleRefresh)
  }, [])

  const data = useMemo(() => {
    return solutionsData.length > 0 ? solutionsData : mockData
  }, [solutionsData])
  return (
    <Card className="h-full flex flex-col border-0 bg-white shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
      <CardHeader className="pb-4 px-6 pt-6 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-[#0b74bb] to-[#0a6ba8] shadow-lg p-2.5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
            <Layers className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold text-slate-900">Solutions</CardTitle>
            <CardDescription className="text-sm text-slate-600 mt-0.5">Campaign count by solution type</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex items-center justify-center px-6 pb-6 pt-6">
        {loading && (
          <div className="h-[350px] flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-slate-200"></div>
              <p className="text-sm text-slate-500">Loading solutions data...</p>
            </div>
          </div>
        )}
        {!loading && (
          <div className="w-full h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <defs>
                  <filter id="shadow">
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
                      style={{ filter: "url(#shadow)" }}
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
                  formatter={(value: number) => [`${value} campaigns`, 'Count']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
