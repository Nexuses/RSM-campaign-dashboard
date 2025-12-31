"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Download, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react"
import { useRawData } from "@/hooks/use-raw-data"

const mockData = [
  {
    date: "12/03/2025",
    campaignName: "RSM SAUDI ESG MARGED DATA LINZY 26 NOV 2025 SET 1",
    project: "ESG",
    solutionArea: "ESG General",
    emailTool: "Mailbluster",
    send: 1035,
    openRate: "28.50%",
    clickRate: "23.00%",
    bounceRate: "34.63%",
    unsubscribeRate: "0.00%",
    leads: 0,
  },
  {
    date: "12/04/2025",
    campaignName: "RSM SAUDI ESG MARGED DATA LINZY 26 NO",
    project: "ESG",
    solutionArea: "ESG",
    emailTool: "Mailbluster",
    send: 992,
    openRate: "40.12%",
    clickRate: "34.17%",
    bounceRate: "11.20%",
    unsubscribeRate: "0.30%",
    leads: 1,
  },
  {
    date: "12/07/2025",
    campaignName: "ESG Cement Data",
    project: "ESG",
    solutionArea: "ESG Cement",
    emailTool: "Brevo",
    send: 36,
    openRate: "38.89%",
    clickRate: "100.00%",
    bounceRate: "2.63%",
    unsubscribeRate: "0.00%",
    leads: 0,
  },
  {
    date: "12/08/2025",
    campaignName: "RSM Saudi ESG Insurance",
    project: "ESG",
    solutionArea: "ESG Insurance",
    emailTool: "Brevo",
    send: 78,
    openRate: "27.63%",
    clickRate: "0.00%",
    bounceRate: "0.00%",
    unsubscribeRate: "1.28%",
    leads: 0,
  },
  {
    date: "12/10/2025",
    campaignName: "RSM SAUDI ESG MARGED DATA LINZY 26 NOV",
    project: "ESG",
    solutionArea: "ESG",
    emailTool: "Mailbluster",
    send: 989,
    openRate: "43.12%",
    clickRate: "35.32%",
    bounceRate: "3.74%",
    unsubscribeRate: "0.40%",
    leads: 0,
  },
  {
    date: "12/02/2025",
    campaignName: "RSM Fin Visual EDM",
    project: "Transitional Advisory",
    solutionArea: "TA",
    emailTool: "Mailbluster",
    send: 1693,
    openRate: "47.90%",
    clickRate: "26.64%",
    bounceRate: "7.01%",
    unsubscribeRate: "0.95%",
    leads: 0,
  },
  {
    date: "12/03/2025",
    campaignName: "RSM Fin Visual EDM",
    project: "Transitional Advisory",
    solutionArea: "TA",
    emailTool: "Mailbluster",
    send: 1910,
    openRate: "37.02%",
    clickRate: "29.53%",
    bounceRate: "15.60%",
    unsubscribeRate: "1.10%",
    leads: 0,
  },
  {
    date: "12/07/2025",
    campaignName: "RSM Fin Visual Followup EDM",
    project: "Transitional Advisory",
    solutionArea: "TA",
    emailTool: "Mailbluster",
    send: 453,
    openRate: "38.41%",
    clickRate: "32.67%",
    bounceRate: "2.63%",
    unsubscribeRate: "0.22%",
    leads: 0,
  },
  {
    date: "12/02/2025",
    campaignName: "RSM VAPT Visual EDM",
    project: "VAPT",
    solutionArea: "VAPT",
    emailTool: "Mailbluster",
    send: 750,
    openRate: "42.46%",
    clickRate: "31.99%",
    bounceRate: "28.39%",
    unsubscribeRate: "1.07%",
    leads: 0,
  },
  {
    date: "12/02/2025",
    campaignName: "RSM VAPT Visual EDM",
    project: "VAPT",
    solutionArea: "VAPT",
    emailTool: "Mailbluster",
    send: 750,
    openRate: "29.01%",
    clickRate: "22.60%",
    bounceRate: "24.80%",
    unsubscribeRate: "0.93%",
    leads: 0,
  },
  {
    date: "12/03/2025",
    campaignName: "RSM VAPT Visual EDM",
    project: "VAPT",
    solutionArea: "VAPT",
    emailTool: "Mailbluster",
    send: 750,
    openRate: "16.52%",
    clickRate: "13.26%",
    bounceRate: "24.40%",
    unsubscribeRate: "0.80%",
    leads: 0,
  },
  {
    date: "12/03/2025",
    campaignName: "RSM VAPT Visual EDM",
    project: "VAPT",
    solutionArea: "VAPT",
    emailTool: "Mailbluster",
    send: 750,
    openRate: "44.08%",
    clickRate: "32.46%",
    bounceRate: "31.44%",
    unsubscribeRate: "1.20%",
    leads: 0,
  },
  {
    date: "12/10/2025",
    campaignName: "VAPT text EDM 1 - folow up",
    project: "VAPT",
    solutionArea: "VAPT",
    emailTool: "Mailbluster",
    send: 763,
    openRate: "36.05%",
    clickRate: "-",
    bounceRate: "6.29%",
    unsubscribeRate: "0.52%",
    leads: 0,
  },
]

const ITEMS_PER_PAGE = 30 // Items per page

const SHEET_OPTIONS = [
  { value: "1-1 RSM : All Campaign", label: "1-1 RSM : All Campaign" },
  { value: "RSM Stats - Drip", label: "RSM Stats - Drip" },
  { value: "Pipeline", label: "Pipeline" },
  { value: "RSM Linkedin", label: "RSM Linkedin" },
  { value: "ESG Cement Manual Reach", label: "ESG Cement Manual Reach" },
  { value: "RSM - Data", label: "RSM - Data" },
]

export function RawDataTable() {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const selectedSheet = "ESG Cement Manual Reach" // Fixed to ESG Cement Manual Reach
  
  // Using default 2-minute interval to avoid API quota limits
  const { data: rawDataFromAPI, headers: apiHeaders, loading, error, refetch } = useRawData({
    sheetName: selectedSheet,
  })

  // Use Google Sheets data if available, otherwise fall back to empty array
  const rawData = useMemo(() => {
    if (rawDataFromAPI && rawDataFromAPI.length > 0) {
      return rawDataFromAPI
    }
    return []
  }, [rawDataFromAPI])

  // Use headers from API to preserve original column order
  // Handle duplicate column names by appending index to make them unique
  const allColumns = useMemo(() => {
    // If we have headers from API, use them (preserves original order from sheet)
    if (apiHeaders && apiHeaders.length > 0) {
      // Filter out empty headers but preserve order
      // Handle duplicates by making them unique
      const seen = new Map<string, number>()
      return apiHeaders
        .map((header, index) => {
          const headerStr = header ? header.toString().trim() : ''
          if (!headerStr) return null
          
          // Count occurrences of this header name
          const count = seen.get(headerStr) || 0
          seen.set(headerStr, count + 1)
          
          // If duplicate, append index to make it unique
          return count > 0 ? `${headerStr}_${index}` : headerStr
        })
        .filter((header): header is string => header !== null)
    }
    
    // Fallback: extract from data, preserving order from first row
    if (rawData.length > 0) {
      // Get columns in the order they appear in the first row
      const firstRowKeys = Object.keys(rawData[0]).filter(key => key && key.trim() !== '')
      
      // Also check all rows to ensure we don't miss any columns
      const allKeysSet = new Set<string>(firstRowKeys)
      rawData.forEach((row) => {
        Object.keys(row).forEach((key) => {
          if (key && key.trim() !== '') {
            allKeysSet.add(key)
          }
        })
      })
      
      // Preserve order: first row keys first, then any additional keys
      const orderedKeys = [...firstRowKeys]
      allKeysSet.forEach(key => {
        if (!orderedKeys.includes(key)) {
          orderedKeys.push(key)
        }
      })
      
      // Handle duplicates in fallback data
      const seen = new Map<string, number>()
      return orderedKeys.map((key, index) => {
        const count = seen.get(key) || 0
        seen.set(key, count + 1)
        return count > 0 ? `${key}_${index}` : key
      })
    }
    
    return []
  }, [apiHeaders, rawData])
  
  // Create a mapping from display column names to original column names
  // This helps us get the correct data even when columns have duplicate names
  const columnMapping = useMemo(() => {
    if (!apiHeaders || apiHeaders.length === 0) {
      // If no API headers, create mapping from allColumns
      const map = new Map<string, string>()
      allColumns.forEach((displayKey) => {
        const originalKey = displayKey.replace(/_\d+$/, '')
        map.set(displayKey, originalKey)
      })
      return map
    }
    
    const mapping = new Map<string, string>()
    const seen = new Map<string, number>()
    
    apiHeaders.forEach((header, index) => {
      const headerStr = header ? header.toString().trim() : ''
      if (!headerStr) return
      
      const count = seen.get(headerStr) || 0
      seen.set(headerStr, count + 1)
      
      const displayKey = count > 0 ? `${headerStr}_${index}` : headerStr
      mapping.set(displayKey, headerStr)
    })
    
    return mapping
  }, [apiHeaders, allColumns])

  // Determine if a column is numeric based on its data
  const isColumnNumeric = useMemo(() => {
    const columnNumericMap = new Map<string, boolean>()
    if (rawData.length > 0 && allColumns.length > 0) {
      allColumns.forEach((displayKey) => {
        const originalKey = columnMapping.get(displayKey) || displayKey.replace(/_\d+$/, '')
        const hasNumericData = rawData.some(row => {
          const value = row[originalKey] !== undefined ? row[originalKey] : row[displayKey]
          if (value === null || value === undefined) return false
          const valueStr = value.toString().trim()
          return valueStr !== '' && /^-?\d+\.?\d*%?$/.test(valueStr)
        })
        columnNumericMap.set(displayKey, hasNumericData)
      })
    }
    return columnNumericMap
  }, [rawData, allColumns, columnMapping])

  const filteredData = rawData.filter((row) => {
    if (!searchQuery) return true
    
    const searchLower = searchQuery.toLowerCase()
    
    // Search across all columns
    return Object.values(row).some((value) => 
      value?.toString().toLowerCase().includes(searchLower)
    )
  })

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedData = filteredData.slice(startIndex, endIndex)

  const handleExportCSV = () => {
    if (filteredData.length === 0) return
    
    // Export all columns
    const csvContent = [
      allColumns.join(","),
      ...filteredData.map((row) =>
        allColumns.map((header) => {
          const value = row[header] || ''
          return `"${value.toString().replace(/"/g, '""')}"`
        }).join(",")
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `ESG-Cement-Manual-Reach-data.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <Card className="shadow-md border border-slate-200 bg-white">
      <CardHeader className="border-b bg-white pb-4 px-5 sm:px-6">
        <div className="flex flex-col gap-3 sm:gap-0 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl sm:text-2xl font-bold text-slate-900">ESG Manual Reach</CardTitle>
            {error && (
              <p className="text-xs sm:text-sm text-red-600 mt-1 truncate">Error loading data: {error}</p>
            )}
            {loading && (
              <p className="text-xs sm:text-sm text-slate-500 mt-1">Loading data from Google Sheets...</p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-8 sm:pl-10 w-full sm:w-48 lg:w-64 border-slate-300 text-xs sm:text-sm h-8 sm:h-10"
              />
            </div>
            <Button 
              onClick={refetch} 
              variant="outline" 
              disabled={loading}
              className="gap-1.5 sm:gap-2 border-slate-300 bg-transparent text-xs sm:text-sm h-8 sm:h-10 px-2 sm:px-3"
            >
              <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Button 
              onClick={handleExportCSV} 
              variant="outline" 
              className="gap-1.5 sm:gap-2 border-slate-300 bg-transparent text-xs sm:text-sm h-8 sm:h-10 px-2 sm:px-3"
            >
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Export CSV</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto overflow-y-auto max-h-[600px] px-4">
          {rawData.length === 0 && !loading ? (
            <div className="p-8 text-center text-slate-500">
              No data available for the selected sheet.
            </div>
          ) : (
            <div className="min-w-full inline-block">
              <table className="min-w-full border-collapse">
                <thead className="sticky top-0 bg-white z-10 shadow-sm">
                  <tr className="border-b border-slate-200 bg-white">
                                    {allColumns.map((displayKey, colIndex) => {
                                      // Get original column name for display (remove _index suffix if added)
                                      const originalKey = columnMapping.get(displayKey) || displayKey.replace(/_\d+$/, '')
                                      
                                      // Check if this column typically contains numeric data
                                      const isNumericColumn = isColumnNumeric.get(displayKey) || false
                                      
                                      return (
                                        <th 
                                          key={`header-${colIndex}-${displayKey}`} 
                                          className={`${isNumericColumn ? 'text-right' : 'text-left'} py-3 px-5 font-semibold text-slate-900 text-sm whitespace-nowrap bg-white`}
                                        >
                                          {originalKey}
                                        </th>
                                      )
                                    })}
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((row, rowIndex) => (
                    <tr
                      key={`row-${rowIndex}`}
                      className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                        rowIndex % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                      }`}
                    >
                      {allColumns.map((displayKey, colIndex) => {
                        // Get the original column name to fetch data
                        const originalKey = columnMapping.get(displayKey) || displayKey.replace(/_\d+$/, '')
                        
                        // Try to get value using original key first, then try display key
                        const value = row[originalKey] !== undefined ? row[originalKey] : row[displayKey]
                        const cellValue = value !== null && value !== undefined 
                          ? value.toString().trim() 
                          : ''
                        
                        // Use the same numeric check as header for consistent alignment
                        const isNumericColumn = isColumnNumeric.get(displayKey) || false
                        
                        return (
                          <td 
                            key={`cell-${rowIndex}-${colIndex}-${displayKey}`} 
                            className={`py-3 px-5 text-slate-900 text-sm whitespace-nowrap ${isNumericColumn ? 'text-right' : 'text-left'}`}
                            title={cellValue} // Add tooltip for long values
                          >
                            {isNumericColumn && typeof value === 'number' 
                              ? value.toLocaleString() 
                              : cellValue || ''}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 px-6 py-4 border-t border-slate-200 bg-white">
                          <div className="text-xs sm:text-sm text-slate-600">
                            <span className="block sm:inline">Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} results</span>
                            {rawData.length > 0 && (
                              <span className="ml-0 sm:ml-2 text-slate-400 block sm:inline">
                                ({allColumns.length} columns)
                              </span>
                            )}
                          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="gap-1 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
            >
              <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Previous</span>
            </Button>
            <div className="text-xs sm:text-sm text-slate-700 px-2 sm:px-3 whitespace-nowrap">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="gap-1 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
