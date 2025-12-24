"use client"

import { useMemo, useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Mail, MessageSquare, ChevronRight, ChevronLeft } from "lucide-react"
import { useSheetsData } from "@/hooks/use-sheets-data"
import { useFilterContext } from "@/contexts/filter-context"
import { Button } from "@/components/ui/button"

const campaignData = [
  {
    id: 1,
    name: "ESG Reporting",
    type: "Visual Email Campaign",
    campaigns: [
      { name: "Campaign 1", sent: 500, openRate: 35 },
      { name: "Campaign 2", sent: 450, openRate: 38 },
    ],
  },
  {
    id: 2,
    name: "VAPT Services",
    type: "Visual Email Campaign",
    campaigns: [
      { name: "Campaign 1", sent: 600, openRate: 42 },
      { name: "Campaign 2", sent: 550, openRate: 40 },
    ],
  },
  {
    id: 3,
    name: "Transitional Advisory",
    type: "1-1 Outreach Campaign",
    campaigns: [{ name: "Direct Outreach", sent: 1710, openRate: 32 }],
  },
]

const comparisonData = [
  { name: "ESG Campaign 1", openRate: 35, color: "#10b981" },
  { name: "ESG Campaign 2", openRate: 38, color: "#8b5cf6" },
  { name: "VAPT Campaign 1", openRate: 42, color: "#3b82f6" },
  { name: "VAPT Campaign 2", openRate: 40, color: "#f59e0b" },
  { name: "Advisory Outreach", openRate: 32, color: "#06b6d4" },
]

/**
 * Normalize solution name to one of the allowed categories (ESG, VAPT, Transitional Advisory)
 * Returns null if the solution should be excluded
 */
function normalizeSolution(solution: string): string | null {
  if (!solution) return null;
  
  const solutionLower = solution.toString().trim().toLowerCase();
  
  // Check for VAPT (exact match or contains VAPT)
  if (solutionLower === 'vapt' || solutionLower.includes('vapt')) {
    return 'VAPT';
  }
  
  // Check for Transitional Advisory (TA, Transitional Advisory, etc.)
  if (solutionLower === 'ta' || 
      solutionLower === 'transitional advisory' || 
      solutionLower.includes('transitional advisory') ||
      solutionLower.includes('transitional')) {
    return 'Transitional Advisory';
  }
  
  // Check for ESG (any variant: ESG, ESG General, ESG Cement, ESG Insurance, etc.)
  if (solutionLower === 'esg' || solutionLower.startsWith('esg')) {
    return 'ESG';
  }
  
  // Exclude all other solutions
  return null;
}

export function CampaignDetailView() {
  const { data: sheetsData } = useSheetsData()
  const { projectFilter, dateRangeFilter, customStartDate, customEndDate } = useFilterContext()
  
  // State for 1-1 campaigns data
  const [oneOnOneData, setOneOnOneData] = useState<any[]>([])
  const [loadingOneOnOne, setLoadingOneOnOne] = useState(true)
  
  // State to track the current page (offset) for each card (starts at 0, showing first 3)
  const [cardPages, setCardPages] = useState<Record<string, number>>({})
  
  // Fetch data from "1-1 RSM : All Campaign" sheet
  const fetchOneOnOneData = useCallback(async () => {
    try {
      setLoadingOneOnOne(true)
      const response = await fetch('/api/sheets?sheet=oneOnOne')
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setOneOnOneData(result.data || [])
        }
      }
    } catch (error) {
      console.error('Error fetching 1-1 campaigns:', error)
    } finally {
      setLoadingOneOnOne(false)
    }
  }, [])
  
  useEffect(() => {
    fetchOneOnOneData()
    // Poll every 2 minutes
    const interval = setInterval(fetchOneOnOneData, 120000)
    return () => clearInterval(interval)
  }, [fetchOneOnOneData])
  
  // Function to load next 3 campaigns for a specific card
  const loadNextCampaigns = (cardId: string, totalCampaigns: number) => {
    setCardPages((prev) => {
      const currentPage = prev[cardId] || 0
      const nextPage = currentPage + 1
      const maxPage = Math.floor((totalCampaigns - 1) / 3)
      return {
        ...prev,
        [cardId]: nextPage > maxPage ? maxPage : nextPage
      }
    })
  }
  
  // Function to load previous 3 campaigns for a specific card
  const loadPreviousCampaigns = (cardId: string) => {
    setCardPages((prev) => {
      const currentPage = prev[cardId] || 0
      const prevPage = currentPage - 1
      return {
        ...prev,
        [cardId]: prevPage < 0 ? 0 : prevPage
      }
    })
  }

  // Apply filters to data - ONLY show ESG, VAPT, and Transitional Advisory
  // Combine data from both campaignData sheets and "1-1 RSM : All Campaign" sheet
  const filteredData = useMemo(() => {
    // Combine data from both sources
    const allData = [...(sheetsData || []), ...oneOnOneData]
    
    if (allData.length === 0) return []

    let data = allData

    // First, filter to only include ESG, VAPT, and Transitional Advisory campaigns
    data = data.filter((row) => {
      const solution = row.project || row.solutionArea || ''
      const normalizedSolution = normalizeSolution(solution)
      return normalizedSolution !== null // Only include if it's one of the three allowed solutions
    })

    // Apply project filter (if set)
    if (projectFilter !== 'all') {
      data = data.filter((row) => {
        const solution = row.project || row.solutionArea || ''
        const normalizedSolution = normalizeSolution(solution)
        if (projectFilter === 'ESG') return normalizedSolution === 'ESG'
        if (projectFilter === 'TA') return normalizedSolution === 'Transitional Advisory'
        if (projectFilter === 'VAPT') return normalizedSolution === 'VAPT'
        return true
      })
    }

    // Apply date filter (if set) - compute date range directly from filter values
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
      data = data.filter((row) => {
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

    return data
  }, [sheetsData, oneOnOneData, projectFilter, dateRangeFilter, customStartDate, customEndDate])

  // Group campaigns by normalized solution (ESG, VAPT, Transitional Advisory)
  const groupedCampaigns = useMemo(() => {
    const groups: Record<string, any[]> = {}
    
    filteredData.forEach((row) => {
      const solution = row.project || row.solutionArea || ''
      const normalizedSolution = normalizeSolution(solution)
      
      // Only group if it's one of the three allowed solutions
      if (normalizedSolution) {
        if (!groups[normalizedSolution]) {
          groups[normalizedSolution] = []
        }
        groups[normalizedSolution].push({
          name: row.campaignName || 'Unnamed Campaign',
          sent: row.send || 0,
          openRate: parseFloat(row.openRate?.toString().replace('%', '') || '0'),
        })
      }
    })

    // Determine which solutions to show based on project filter
    let solutionsToShow: string[] = []
    if (projectFilter !== 'all') {
      // Show only the selected project
      if (projectFilter === 'ESG') {
        solutionsToShow = ['ESG']
      } else if (projectFilter === 'TA') {
        solutionsToShow = ['Transitional Advisory']
      } else if (projectFilter === 'VAPT') {
        solutionsToShow = ['VAPT']
      }
    } else {
      // Show all three solutions
      solutionsToShow = ['VAPT', 'Transitional Advisory', 'ESG']
    }

    // Return cards for solutions to show, even if they have no data
    return solutionsToShow.map((solution, index) => ({
      id: index + 1,
      name: solution,
      type: "Visual Email Campaign",
      campaigns: groups[solution] || [], // Empty array if no data
    }))
  }, [filteredData, projectFilter])

  // Prepare comparison data for chart - only show ESG, VAPT, and Transitional Advisory campaigns
  const comparisonData = useMemo(() => {
    const colors = ["#10b981", "#8b5cf6", "#3b82f6", "#f59e0b", "#06b6d4", "#ec4899", "#14b8a6"]
    // Filter to only include campaigns from the three allowed solutions
    const allowedCampaigns = filteredData.filter((row) => {
      const solution = row.project || row.solutionArea || ''
      const normalizedSolution = normalizeSolution(solution)
      return normalizedSolution !== null
    })
    
    return allowedCampaigns.slice(0, 20).map((row, index) => ({
      name: (row.campaignName || 'Unnamed').length > 20 
        ? (row.campaignName || 'Unnamed').substring(0, 20) + '...' 
        : (row.campaignName || 'Unnamed'),
      openRate: parseFloat(row.openRate?.toString().replace('%', '') || '0'),
      color: colors[index % colors.length],
    }))
  }, [filteredData])

  // Use filtered data directly - don't fall back to mock data when filters are applied
  const displayCampaigns = groupedCampaigns
  const displayComparison = comparisonData

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {displayCampaigns.map((campaign) => {
          const cardId = `card-${campaign.id}-${campaign.name}`
          const totalCampaigns = campaign.campaigns.length
          const currentPage = cardPages[cardId] || 0
          const startIndex = currentPage * 3
          const endIndex = startIndex + 3
          const displayedCampaigns = campaign.campaigns.slice(startIndex, endIndex)
          const hasNext = endIndex < totalCampaigns
          const hasPrevious = currentPage > 0
          
          return (
            <Card key={campaign.id} className="bg-white shadow-md hover:shadow-xl transition-shadow relative">
              <CardHeader className="pb-4 px-5 sm:px-6">
                <div className="flex items-center gap-3 mb-2">
                  {campaign.type === "Visual Email Campaign" ? (
                    <Mail className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  ) : (
                    <MessageSquare className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                  )}
                  <CardTitle className="text-lg font-semibold truncate">{campaign.name}</CardTitle>
                </div>
                <CardDescription className="text-xs mt-1">{campaign.type}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pb-12 min-h-[400px] px-6">
                {displayedCampaigns.length > 0 ? (
                  displayedCampaigns.map((subCampaign, idx) => (
                    <div key={idx} className="space-y-2.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-slate-700">{subCampaign.name}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Email sent</span>
                        <span className="font-bold text-slate-900">{subCampaign.sent.toLocaleString()}</span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">Open Rate</span>
                          <span className="font-bold text-blue-600">{subCampaign.openRate}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                            style={{ width: `${subCampaign.openRate}%` }}
                          />
                        </div>
                      </div>
                      {idx < displayedCampaigns.length - 1 && <div className="border-t border-slate-200 pt-3 mt-3" />}
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center text-center py-12 px-4">
                    <div className="text-slate-400 mb-2">
                      <Mail className="h-12 w-12 mx-auto opacity-50" />
                    </div>
                    <p className="text-slate-600 font-medium text-sm">No data available</p>
                    <p className="text-slate-500 text-xs mt-1">for the selected filter</p>
                  </div>
                )}
              </CardContent>
              {(hasNext || hasPrevious) && (
                <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 flex items-center gap-1.5 sm:gap-2">
                  {hasPrevious && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => loadPreviousCampaigns(cardId)}
                      className="h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-full hover:bg-slate-100 transition-colors"
                      title="Load previous campaigns"
                    >
                      <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-600" />
                    </Button>
                  )}
                  {hasNext && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => loadNextCampaigns(cardId, totalCampaigns)}
                      className="h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-full hover:bg-slate-100 transition-colors"
                      title="Load next campaigns"
                    >
                      <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-600" />
                    </Button>
                  )}
                </div>
              )}
            </Card>
          )
        })}
      </div>

      <Card className="bg-white shadow-md">
        <CardHeader className="pb-4 px-5 sm:px-6">
          <CardTitle className="text-2xl font-bold">Campaign Open Rates Comparison</CardTitle>
          <CardDescription className="mt-1.5 text-sm">Open rate performance across all campaigns</CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" angle={-15} textAnchor="end" height={80} tick={{ fill: "#64748b", fontSize: 12 }} />
              <YAxis
                label={{ value: "Open Rate (%)", angle: -90, position: "insideLeft" }}
                tick={{ fill: "#64748b" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                formatter={(value: number) => [`${value}%`, "Open Rate"]}
              />
              <Bar dataKey="openRate" radius={[8, 8, 0, 0]} fill="#3b82f6">
                {displayComparison.map((entry, index) => (
                  <Bar key={`bar-${index}`} dataKey="openRate" fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
