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
    <Card className="shadow-sm border border-slate-200 bg-white">
      <CardContent className="p-4 sm:p-5">
        <div className="space-y-3">
          <div className="pb-2 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">Filters</h3>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-1 sm:flex-initial">
              <label className="text-sm font-medium text-slate-700 w-full sm:w-24 flex-shrink-0">Project</label>
              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger className="border-slate-300 bg-white w-full sm:w-48 h-10 text-sm">
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

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-1 sm:flex-initial">
              <label className="text-sm font-medium text-slate-700 w-full sm:w-24 flex-shrink-0">Date Range</label>
              <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
                <SelectTrigger className="border-slate-300 bg-white w-full sm:w-48 h-10 text-sm">
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
