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

    // Convert to arrays and sort - include all months even if they have 0 leads
    const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
    const byMonth = monthOrder.map(monthName => ({
      name: monthName,
      value: monthData[monthName] || 0
    }));

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

  // Color palette for pie charts: blue, green, gray
  const pieChartColors = ['#0b74bb', '#0db14b', '#58595b'];

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
          ⚠️ {error}
        </div>
      )}

      {/* By Status and By Solution Cards - Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* By Status Card */}
        <Card className="border-0 bg-white shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
        <CardHeader className="pb-4 px-6 pt-6 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-[#0b74bb] to-[#0a6ba8] shadow-lg p-2.5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-slate-900">By Status</CardTitle>
              <CardDescription className="text-sm text-slate-600 mt-0.5">Pipeline distribution by status</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-6">
          {loading && (
            <div className="h-[350px] flex items-center justify-center">
              <div className="animate-pulse flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-slate-200"></div>
                <p className="text-sm text-slate-500">Loading status data...</p>
              </div>
            </div>
          )}
          {!loading && insights.byStatus.length > 0 && (
            <div className="w-full">
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <defs>
                      <filter id="statusShadow">
                        <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.1"/>
                      </filter>
                    </defs>
                    <Pie
                      data={insights.byStatus}
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
                      {insights.byStatus.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={pieChartColors[index % pieChartColors.length]}
                          style={{ filter: "url(#statusShadow)" }}
                          className="transition-all duration-300 hover:opacity-90"
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any, name: string) => [`${value} leads`, 'Number of Leads']}
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05)",
                        padding: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="text-center mt-4">
                <p className="text-sm font-medium text-slate-700">No. of Leads</p>
              </div>
            </div>
          )}
          {!loading && insights.byStatus.length === 0 && (
            <div className="w-full">
              <div className="h-[350px] flex items-center justify-center text-slate-500 text-sm">
                No status data available
              </div>
              <div className="text-center mt-4">
                <p className="text-sm font-medium text-slate-700">No. of Leads</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

        {/* By Solution Card */}
        <Card className="border-0 bg-white shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
        <CardHeader className="pb-4 px-6 pt-6 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-[#0db14b] to-[#0a9f42] shadow-lg p-2.5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-slate-900">By Solution</CardTitle>
              <CardDescription className="text-sm text-slate-600 mt-0.5">Pipeline distribution by solution type</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-6">
          {loading && (
            <div className="h-[350px] flex items-center justify-center">
              <div className="animate-pulse flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-slate-200"></div>
                <p className="text-sm text-slate-500">Loading solution data...</p>
              </div>
            </div>
          )}
          {!loading && insights.bySolution.length > 0 && (
            <div className="w-full">
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <defs>
                      <filter id="solutionShadow">
                        <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.1"/>
                      </filter>
                    </defs>
                    <Pie
                      data={insights.bySolution}
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
                      {insights.bySolution.map((entry, index) => {
                        const fillColor = colorMap[entry.name] || pieChartColors[index % pieChartColors.length];
                        return (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={fillColor}
                            style={{ filter: "url(#solutionShadow)" }}
                            className="transition-all duration-300 hover:opacity-90"
                          />
                        );
                      })}
                    </Pie>
                    <Tooltip
                      formatter={(value: any, name: string) => [`${value} leads`, 'Number of Leads']}
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05)",
                        padding: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="text-center mt-4">
                <p className="text-sm font-medium text-slate-700">No. of Leads</p>
              </div>
            </div>
          )}
          {!loading && insights.bySolution.length === 0 && (
            <div className="w-full">
              <div className="h-[350px] flex items-center justify-center text-slate-500 text-sm">
                No solution data available
              </div>
              <div className="text-center mt-4">
                <p className="text-sm font-medium text-slate-700">No. of Leads</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      </div>

      {/* By Month Card */}
      <Card className="border-0 bg-white shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
        <CardHeader className="pb-4 px-6 pt-6 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-[#58595b] to-[#4a4b4d] shadow-lg p-2.5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-slate-900">By Month</CardTitle>
              <CardDescription className="text-sm text-slate-600 mt-0.5">Pipeline distribution by month</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-6">
          {loading && (
            <div className="h-[300px] flex items-center justify-center">
              <div className="animate-pulse flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-slate-200"></div>
                <p className="text-sm text-slate-500">Loading month data...</p>
              </div>
            </div>
          )}
          {!loading && insights.byMonth.length > 0 && (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={insights.byMonth} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <defs>
                    <linearGradient id="monthGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0b74bb" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#0a6ba8" stopOpacity={0.8}/>
                    </linearGradient>
                    <filter id="monthBarShadow">
                      <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.15"/>
                    </filter>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }} 
                    angle={-45} 
                    textAnchor="end" 
                    height={80}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fill: "#64748b", fontSize: 13 }} 
                    label={{ value: 'Number of Leads', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#64748b', fontSize: 12 } }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value: any) => [`${value} leads`, 'Number of Leads']}
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
                    dataKey="value" 
                    fill="url(#monthGradient)" 
                    radius={[12, 12, 0, 0]} 
                    barSize={50}
                    animationBegin={0}
                    animationDuration={1000}
                    animationEasing="ease-out"
                    style={{ filter: "url(#monthBarShadow)" }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          {!loading && insights.byMonth.length === 0 && (
            <div className="h-[300px] flex items-center justify-center text-slate-500 text-sm">
              No month data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


