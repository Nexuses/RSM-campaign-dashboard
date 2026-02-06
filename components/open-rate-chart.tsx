"use client"

import { useMemo, useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { useFilterContext } from "@/contexts/filter-context"
import { useRefreshContext } from "@/contexts/refresh-context"
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

interface CampaignRateData {
  name: string;
  openRate: number;
  clickRate: number;
  date?: string;
}

export function OpenRateChart() {
  const [campaignData, setCampaignData] = useState<CampaignRateData[]>([])
  const [loading, setLoading] = useState(true)
  const { dateRangeFilter, customStartDate, customEndDate, getDateRange } = useFilterContext()
  const { autoRefresh } = useRefreshContext()

  // Fetch open rate data from API
  useEffect(() => {
    const fetchOpenRateData = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/open-rate')
        
        if (!response.ok) {
          throw new Error('Failed to fetch open rate data')
        }

        const result = await response.json()
        
        if (result.success && result.data) {
          setCampaignData(result.data)
        } else {
          setCampaignData([])
        }
      } catch (error) {
        console.error('Error fetching open rate data:', error)
        setCampaignData([])
      } finally {
        setLoading(false)
      }
    }

    // Initial fetch
    fetchOpenRateData()

    // Set up polling if auto-refresh is enabled (every 5 minutes)
    if (autoRefresh) {
      const interval = setInterval(fetchOpenRateData, 300000) // 5 minutes
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  // Listen for manual refresh events
  useEffect(() => {
    const handleRefresh = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/open-rate')
        
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            setCampaignData(result.data)
          }
        }
      } catch (error) {
        console.error('Error refreshing open rate data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    window.addEventListener('dashboard-refresh', handleRefresh)
    return () => window.removeEventListener('dashboard-refresh', handleRefresh)
  }, [])

  const data = useMemo(() => {
    if (!campaignData || campaignData.length === 0) return mockData

    // Apply date filter
    let filteredData = campaignData
    const dateRange = getDateRange()
    
    if (dateRange.start && dateRange.end) {
      filteredData = campaignData.filter((campaign) => {
        if (!campaign.date) return true // Include campaigns without dates
        
        try {
          const dateStr = campaign.date.toString()
          const dateParts = dateStr.split('/')
          let date: Date | null = null
          
          if (dateParts.length === 3) {
            const month = parseInt(dateParts[0], 10) - 1
            const day = parseInt(dateParts[1], 10)
            const year = parseInt(dateParts[2], 10)
            date = new Date(year, month, day)
          } else {
            date = new Date(dateStr)
          }
          
          if (!date || isNaN(date.getTime())) return true // Include if date parsing fails
          date.setHours(0, 0, 0, 0)
          return date >= dateRange.start! && date <= dateRange.end!
        } catch (e) {
          return true // Include if date parsing fails
        }
      })
    }

    return filteredData
      .map((campaign) => ({
        name: campaign.name.length > 20 
          ? campaign.name.substring(0, 20) + '...' 
          : campaign.name,
        openRate: campaign.openRate,
        clickRate: campaign.clickRate,
      }))
      .slice(0, 20) // Limit to 20 items for better visualization
  }, [campaignData, dateRangeFilter, customStartDate, customEndDate, getDateRange])
  return (
    <Card className="border-0 bg-white shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
      <CardHeader className="pb-4 px-6 pt-6 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-[#0db14b] to-[#0a9f42] shadow-lg p-2.5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold text-slate-900">Campaign Open & Click Rates</CardTitle>
            <CardDescription className="text-sm text-slate-600 mt-0.5">Comparison of campaign performance metrics</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-6 pt-6">
        {loading && (
          <div className="h-[400px] flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-slate-200"></div>
              <p className="text-sm text-slate-500">Loading open rate data...</p>
            </div>
          </div>
        )}
        {!loading && (
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
              <defs>
                <linearGradient id="openRateGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0b74bb" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#0a6ba8" stopOpacity={0.8}/>
                </linearGradient>
                <linearGradient id="clickRateGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#58595b" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#4a4b4d" stopOpacity={0.8}/>
                </linearGradient>
                <filter id="barShadow">
                  <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.15"/>
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={100}
                tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
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
                cursor={{ fill: 'rgba(11, 116, 187, 0.1)' }}
              />
              <Bar 
                dataKey="openRate" 
                fill="url(#openRateGradient)" 
                name="Open Rate %" 
                radius={[12, 12, 0, 0]}
                animationBegin={0}
                animationDuration={1000}
                animationEasing="ease-out"
                style={{ filter: "url(#barShadow)" }}
              />
              <Bar 
                dataKey="clickRate" 
                fill="url(#clickRateGradient)" 
                name="Click Rate %" 
                radius={[12, 12, 0, 0]}
                animationBegin={200}
                animationDuration={1000}
                animationEasing="ease-out"
                style={{ filter: "url(#barShadow)" }}
              />
            </BarChart>
          </ResponsiveContainer>
          </div>
        )}
        <div className="flex items-center justify-center gap-6 mt-6 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="w-4 h-4 rounded-md flex-shrink-0 shadow-sm" style={{ backgroundColor: '#0b74bb' }}></div>
            <span className="text-sm font-medium text-slate-700">Open Rate %</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-4 h-4 rounded-md flex-shrink-0 shadow-sm" style={{ backgroundColor: '#58595b' }}></div>
            <span className="text-sm font-medium text-slate-700">Click Rate %</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
