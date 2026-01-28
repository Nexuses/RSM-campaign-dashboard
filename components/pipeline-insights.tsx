"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { usePipelineData } from "@/hooks/use-pipeline-data"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts"
import { TrendingUp } from "lucide-react"

/**
 * Helper function to find column value with flexible name matching
 */
function getColumnValue(row: any, possibleNames: string[]): any {
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
}

/**
 * Helper function to parse month from various formats
 */
function parseMonth(monthStr: any): string | null {
  if (!monthStr) return null;
  
  const monthStrClean = monthStr.toString().trim();
  
  // Try numeric format (1-12 or 01-12)
  const numericMonth = parseInt(monthStrClean, 10);
  if (!isNaN(numericMonth) && numericMonth >= 1 && numericMonth <= 12) {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
    return monthNames[numericMonth - 1];
  }
  
  // Try MM/YYYY format
  const dateParts = monthStrClean.split('/');
  if (dateParts.length === 2) {
    const month = parseInt(dateParts[0], 10);
    if (!isNaN(month) && month >= 1 && month <= 12) {
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                         'July', 'August', 'September', 'October', 'November', 'December'];
      return monthNames[month - 1];
    }
  }
  
  // Try month name format
  const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 
                     'july', 'august', 'september', 'october', 'november', 'december'];
  const monthStrLower = monthStrClean.toLowerCase();
  
  for (let i = 0; i < monthNames.length; i++) {
    if (monthStrLower.includes(monthNames[i])) {
      const monthNamesCapitalized = ['January', 'February', 'March', 'April', 'May', 'June', 
                                    'July', 'August', 'September', 'October', 'November', 'December'];
      return monthNamesCapitalized[i];
    }
  }
  
  return monthStrClean; // Return as-is if can't parse
}

/**
 * Normalize solution name
 */
function normalizeSolution(solution: string): string {
  if (!solution) return 'Other';
  
  const solutionLower = solution.toString().trim().toLowerCase();
  
  if (solutionLower === 'vapt' || solutionLower.includes('vapt')) {
    return 'VAPT';
  }
  
  if (solutionLower === 'ta' || 
      solutionLower === 'tas' ||
      solutionLower === 'transitional advisory' || 
      solutionLower.includes('transitional advisory') ||
      solutionLower.includes('transitional')) {
    return 'Transitional Advisory';
  }
  
  if (solutionLower === 'esg' || solutionLower.startsWith('esg')) {
    return 'ESG';
  }
  
  return solution.toString().trim() || 'Other';
}

export function PipelineInsights() {
  const { data, loading, error } = usePipelineData();

  // Process data to create insights
  const insights = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        byMonth: [],
        bySolution: [],
        byStatus: [],
      };
    }

    // Group by Month
    const monthData: Record<string, number> = {};
    // Group by Solution
    const solutionData: Record<string, number> = {};
    // Group by Status
    const statusData: Record<string, number> = {};

    data.forEach((row: any) => {
      // Process Month
      const month = getColumnValue(row, ['Month', 'month', 'MONTH']);
      if (month) {
        const monthName = parseMonth(month);
        if (monthName) {
          monthData[monthName] = (monthData[monthName] || 0) + 1;
        }
      }

      // Process Solution
      const solution = getColumnValue(row, ['Solution', 'solution', 'SOLUTION']);
      if (solution) {
        const normalizedSolution = normalizeSolution(solution.toString());
        solutionData[normalizedSolution] = (solutionData[normalizedSolution] || 0) + 1;
      }

      // Process Status
      const status = getColumnValue(row, ['Status', 'status', 'STATUS']);
      if (status) {
        const statusStr = status.toString().trim();
        statusData[statusStr] = (statusData[statusStr] || 0) + 1;
      }
    });

    // Convert to arrays and sort
    const byMonth = Object.entries(monthData)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => {
        const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June', 
                           'July', 'August', 'September', 'October', 'November', 'December'];
        return monthOrder.indexOf(a.name) - monthOrder.indexOf(b.name);
      });

    const bySolution = Object.entries(solutionData)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const byStatus = Object.entries(statusData)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return { byMonth, bySolution, byStatus };
  }, [data]);

  const colorMap: Record<string, string> = {
    'ESG': '#0b74bb',
    'Transitional Advisory': '#0db14b',
    'VAPT': '#58595b',
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="shadow-md border-slate-200 bg-white">
        <CardHeader className="pb-4 px-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gradient-to-br from-[#0b74bb] to-[#0a6ba8] shadow-md flex-shrink-0 flex items-center justify-center text-base" style={{ width: '1.2em', height: '1.2em' }}>
              <TrendingUp className="text-white" style={{ width: '0.75em', height: '0.75em' }} />
            </div>
            <CardTitle className="text-base sm:text-lg font-semibold">Pipeline Insights</CardTitle>
          </div>
          <CardDescription className="mt-1.5 text-sm">Analysis by Month, Solution, and Status</CardDescription>
        </CardHeader>
        <CardContent className="px-5 sm:px-6 pb-5 sm:pb-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
              ⚠️ {error}
            </div>
          )}
          
          {loading && (
            <div className="text-center py-8 text-slate-500 text-sm">
              Loading pipeline insights...
            </div>
          )}

          {!loading && !error && (
            <>
              {/* By Month */}
              {insights.byMonth.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">By Month</h3>
                  <div className="h-[250px] sm:h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={insights.byMonth} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
                        <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e2e8f0",
                            borderRadius: "8px",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                          }}
                        />
                        <Bar dataKey="value" fill="#0b74bb" radius={[8, 8, 0, 0]} barSize={40}>
                          {insights.byMonth.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill="#0b74bb" />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* By Solution - Pie Chart */}
              {insights.bySolution.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">By Solution</h3>
                  <div className="h-[250px] sm:h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <Pie
                          data={insights.bySolution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius="60%"
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {insights.bySolution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={colorMap[entry.name] || '#0b74bb'} />
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
                </div>
              )}

              {/* By Status - Pie Chart */}
              {insights.byStatus.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">By Status</h3>
                  <div className="h-[250px] sm:h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <Pie
                          data={insights.byStatus}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius="60%"
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {insights.byStatus.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill="#0db14b" />
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
                </div>
              )}

              {insights.byMonth.length === 0 && insights.bySolution.length === 0 && insights.byStatus.length === 0 && (
                <div className="text-center py-8 text-slate-500 text-sm">
                  No pipeline data available
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


