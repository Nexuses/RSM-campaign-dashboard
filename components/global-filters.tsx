"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useFilterContext } from "@/contexts/filter-context"

export function GlobalFilters() {
  const {
    projectFilter,
    dateRangeFilter,
    customStartDate,
    customEndDate,
    setProjectFilter,
    setDateRangeFilter,
    setCustomStartDate,
    setCustomEndDate,
  } = useFilterContext()

  return (
    <Card className="border-0 bg-white shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="pb-3 border-b border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Filters</h3>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-semibold text-slate-700">Project</label>
              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger className="w-full h-11 border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <SelectValue placeholder="All Projects" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200">
                  <SelectItem value="all">All Projects</SelectItem>
                  <SelectItem value="ESG">ESG</SelectItem>
                  <SelectItem value="TA">Transitional Advisory</SelectItem>
                  <SelectItem value="VAPT">VAPT</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 space-y-2">
              <label className="text-sm font-semibold text-slate-700">Date Range</label>
              <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
                <SelectTrigger className="w-full h-11 border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200">
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="lastWeek">Last Week</SelectItem>
                  <SelectItem value="lastMonth">Last Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
