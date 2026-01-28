import { NextResponse } from 'next/server';
import { getSheetData, parseSheetData, convertToCampaignData, getMultipleSheetsData } from '@/lib/google-sheets';
import { getSheetConfig, getSheetRange } from '@/lib/sheet-config';

export async function GET(request: Request) {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'default'; // default, last7days, last30days, lastyear, custom
    const startDate = searchParams.get('startDate'); // For custom date range
    const endDate = searchParams.get('endDate'); // For custom date range
    
    if (!spreadsheetId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Spreadsheet ID is required',
          stats: {
            totalProspects: '0',
            hotLeads: '0',
            activePipeline: '0',
            avgOpenRate: '0%',
          }
        },
        { status: 400 }
      );
    }

    const sheetConfig = getSheetConfig();
    
    // Fetch data from different sources in parallel
    const [pipelineData, openRateData] = await Promise.all([
      fetchPipelineStats(spreadsheetId, sheetConfig.pipeline, filter, startDate, endDate),
      fetchOpenRateStats(spreadsheetId, ['1-1 RSM : All Campaign', 'RSM Stats - Drip'], filter, startDate, endDate),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalProspects: pipelineData.totalProspects,
        hotLeads: pipelineData.hotLeads,
        activePipeline: pipelineData.activePipeline,
        avgOpenRate: openRateData.avgOpenRate,
      },
      lastUpdated: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in stats API route:', error);
    
    let userMessage = 'Failed to fetch stats';
    if (error.message?.includes('Quota exceeded') || error.message?.includes('quota')) {
      userMessage = 'API quota exceeded. Please wait a few minutes.';
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: userMessage,
        stats: {
          totalProspects: '0',
          hotLeads: '0',
          activePipeline: '0',
          avgOpenRate: '0%',
        }
      },
      { status: 500 }
    );
  }
}

/**
 * Get date range based on filter
 */
function getDateRange(filter: string, startDate?: string | null, endDate?: string | null) {
  const today = new Date();
  today.setHours(23, 59, 59, 999); // End of today
  
  let start: Date;
  let end: Date = today;
  
  switch (filter) {
    case 'last7days':
      start = new Date(today);
      start.setDate(today.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      break;
    case 'last30days':
      start = new Date(today);
      start.setDate(today.getDate() - 30);
      start.setHours(0, 0, 0, 0);
      break;
    case 'lastyear':
      start = new Date(today);
      start.setFullYear(today.getFullYear() - 1);
      start.setHours(0, 0, 0, 0);
      break;
    case 'custom':
      if (startDate && endDate) {
        start = new Date(startDate);
        end = new Date(endDate);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
      } else {
        // Fallback to default if custom dates not provided
        return getDateRange('default');
      }
      break;
    default: // 'default'
      // Return null to indicate no date filtering (use default logic)
      return null;
  }
  
  return { start, end };
}

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
function parseMonth(monthStr: any, currentYear: number): number | null {
  if (!monthStr) return null;
  
  const monthStrClean = monthStr.toString().trim().toLowerCase();
  
  // Try numeric format (1-12 or 01-12)
  const numericMonth = parseInt(monthStrClean, 10);
  if (!isNaN(numericMonth) && numericMonth >= 1 && numericMonth <= 12) {
    return numericMonth;
  }
  
  // Try MM/YYYY format
  const dateParts = monthStrClean.split('/');
  if (dateParts.length === 2) {
    const month = parseInt(dateParts[0], 10);
    const year = parseInt(dateParts[1], 10);
    if (!isNaN(month) && month >= 1 && month <= 12 && year === currentYear) {
      return month;
    }
  }
  
  // Try month name format
  const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 
                     'july', 'august', 'september', 'october', 'november', 'december'];
  const monthAbbr = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 
                     'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  
  for (let i = 0; i < monthNames.length; i++) {
    if (monthStrClean.includes(monthNames[i]) || monthStrClean.includes(monthAbbr[i])) {
      // Check if year matches
      const yearMatch = monthStr.toString().match(/\d{4}/);
      if (yearMatch && parseInt(yearMatch[0], 10) === currentYear) {
        return i + 1;
      }
      // If no year specified, assume current year
      if (!yearMatch) {
        return i + 1;
      }
    }
  }
  
  return null;
}

/**
 * Fetch and calculate stats from Pipeline sheet
 */
async function fetchPipelineStats(
  spreadsheetId: string, 
  sheetName: string, 
  filter: string = 'default',
  startDate?: string | null,
  endDate?: string | null
) {
  try {
    const range = getSheetRange(sheetName);
    const rawData = await getSheetData(spreadsheetId, range);
    
    if (!rawData || rawData.length === 0) {
      return {
        totalProspects: '0',
        hotLeads: '0',
        activePipeline: '0',
      };
    }

    const headers = rawData[0] as string[];
    const parsedData = parseSheetData(rawData, headers);
    
    // Debug: Log headers and sample data
    console.log(`[Pipeline Stats] Sheet: ${sheetName}, Total rows: ${parsedData.length}`);
    console.log(`[Pipeline Stats] Headers:`, headers);
    if (parsedData.length > 0) {
      console.log(`[Pipeline Stats] Sample row:`, parsedData[0]);
    }
    
    // Get date range based on filter
    const dateRange = getDateRange(filter, startDate, endDate);
    
    // Helper function to check if a row's month is within date range
    const isRowInDateRange = (row: any, dateRange: { start: Date; end: Date } | null): boolean => {
      if (!dateRange) return true; // No date filtering
      
      const month = getColumnValue(row, ['Month', 'month', 'MONTH']);
      if (!month) return false;
      
      const monthStr = month.toString().trim();
      const currentYear = new Date().getFullYear();
      const parsedMonth = parseMonth(month, currentYear);
      
      if (!parsedMonth) return false;
      
      // Create a date for the first day of the parsed month
      const rowDate = new Date(currentYear, parsedMonth - 1, 1);
      
      // Check if the month falls within the date range
      const rangeStart = new Date(dateRange.start.getFullYear(), dateRange.start.getMonth(), 1);
      const rangeEnd = new Date(dateRange.end.getFullYear(), dateRange.end.getMonth() + 1, 0);
      
      return rowDate >= rangeStart && rowDate <= rangeEnd;
    };
    
    // Filter data by date range if filter is provided
    let filteredData = parsedData;
    if (dateRange) {
      filteredData = parsedData.filter((row: any) => isRowInDateRange(row, dateRange));
    }
    
    // 1. Total Prospects: Count entries in "First Name" column (from filtered data)
    const totalProspects = filteredData.filter((row: any) => {
      const firstName = getColumnValue(row, ['First Name', 'first name', 'FirstName', 'firstname', 'First Name', 'First_Name']);
      return firstName !== null && firstName !== undefined && firstName.toString().trim() !== '';
    }).length;
    
    // 2. Hot Leads: Count entries where Status column = "hot" (exact match, case-insensitive) (from filtered data)
    const hotLeads = filteredData.filter((row: any) => {
      const status = getColumnValue(row, ['Status', 'status', 'STATUS']);
      if (!status) return false;
      return status.toString().trim().toLowerCase() === 'hot';
    }).length;
    
    // 3. Active Pipeline: Count "First Name" entries for the current month (from filtered data)
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // 1-12
    const currentYear = currentDate.getFullYear();
    
    const activePipeline = filteredData.filter((row: any) => {
      // Check if First Name exists
      const firstName = getColumnValue(row, ['First Name', 'first name', 'FirstName', 'firstname', 'First Name', 'First_Name']);
      if (!firstName || firstName.toString().trim() === '') return false;
      
      // Check if Month column matches current month
      const month = getColumnValue(row, ['Month', 'month', 'MONTH']);
      if (!month) return false;
      
      const parsedMonth = parseMonth(month, currentYear);
      return parsedMonth === currentMonth;
    }).length;
    
    return {
      totalProspects: totalProspects.toLocaleString(),
      hotLeads: hotLeads.toString(),
      activePipeline: activePipeline.toString(),
    };
  } catch (error: any) {
    console.error('Error fetching pipeline stats:', error);
    return {
      totalProspects: '0',
      hotLeads: '0',
      activePipeline: '0',
    };
  }
}

/**
 * Fetch and calculate average open rate from specific campaign sheets
 * Avg Open Rate = Average of (Sum of Open column from RSM Stats - Drip + Sum of Open column from 1-1 RSM : All Campaign)
 */
async function fetchOpenRateStats(
  spreadsheetId: string, 
  sheetNames: string[],
  filter: string = 'default',
  startDate?: string | null,
  endDate?: string | null
) {
  try {
    // Get date range based on filter
    const dateRange = getDateRange(filter, startDate, endDate);
    
    // Use larger range to ensure we get all data
    const range = 'A1:ZZ10000';
    
    // Helper function to parse date from row
    const parseRowDate = (row: any, dateColumnKey: string): Date | null => {
      const dateStr = row[dateColumnKey];
      if (!dateStr) return null;
      
      try {
        const dateStrClean = dateStr.toString().trim();
        
        // Try MM/DD/YYYY or M/D/YYYY format
        const dateParts = dateStrClean.split('/');
        if (dateParts.length === 3) {
          const month = parseInt(dateParts[0], 10) - 1;
          const day = parseInt(dateParts[1], 10);
          const year = parseInt(dateParts[2], 10);
          if (!isNaN(month) && !isNaN(day) && !isNaN(year)) {
            return new Date(year, month, day);
          }
        }
        
        // Try parsing as ISO date string or standard date string
        const parsedDate = new Date(dateStrClean);
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate;
        }
        
        return null;
      } catch (e) {
        return null;
      }
    };
    
    // Fetch data from each sheet separately to calculate sums
    const sheetDataPromises = sheetNames.map(async (sheetName) => {
      try {
        const sheetRange = `${sheetName}!${range}`;
        const rawData = await getSheetData(spreadsheetId, sheetRange);
        
        if (!rawData || rawData.length === 0) {
          return { sheetName, sum: 0, count: 0 };
        }

        const headers = rawData[0] as string[];
        const parsedData = parseSheetData(rawData, headers);
        
        // Find "Open" column with flexible matching
        const openColumnKey = headers.find(
          h => h && (h.toLowerCase() === 'open' || h.toLowerCase().includes('open'))
        );
        
        // Find date column (Date, date, etc.)
        const dateColumnKey = headers.find(
          h => h && (h.toLowerCase() === 'date' || h.toLowerCase().includes('date'))
        );
        
        if (!openColumnKey) {
          console.log(`[Open Rate Stats] No "Open" column found in ${sheetName}`);
          return { sheetName, sum: 0, count: 0 };
        }
        
        // Filter by date range if provided
        let filteredData = parsedData;
        if (dateRange && dateColumnKey) {
          filteredData = parsedData.filter((row: any) => {
            const rowDate = parseRowDate(row, dateColumnKey);
            if (!rowDate || isNaN(rowDate.getTime())) return false;
            rowDate.setHours(0, 0, 0, 0);
            return rowDate >= dateRange.start && rowDate <= dateRange.end;
          });
        }
        
        // Calculate sum of Open column values from filtered data
        let sum = 0;
        let count = 0;
        
        filteredData.forEach((row: any) => {
          const openValue = row[openColumnKey];
          
          // Skip empty cells: null, undefined, empty string, whitespace-only, or common "no value" indicators
          if (openValue === null || openValue === undefined || openValue === '') {
            return; // Skip this cell
          }
          
          // Check if it's a string that's empty or represents "no value"
          const strValue = openValue.toString().trim();
          if (strValue === '' || strValue === '-' || strValue === 'N/A' || strValue.toLowerCase() === 'na' || strValue === 'null') {
            return; // Skip this cell
          }
          
          // Try to parse as number
          const numValue = typeof openValue === 'number' 
            ? openValue 
            : parseFloat(strValue.replace(/[^0-9.-]/g, ''));
          
          // Only count valid numbers (not NaN and >= 0)
          if (!isNaN(numValue) && numValue >= 0) {
            sum += numValue;
            count++;
          }
        });
        
        console.log(`[Open Rate Stats] ${sheetName}: Sum=${sum}, Count=${count}`);
        return { sheetName, sum, count };
      } catch (error: any) {
        console.error(`[Open Rate Stats] Error fetching ${sheetName}:`, error);
        return { sheetName, sum: 0, count: 0 };
      }
    });
    
    const sheetResults = await Promise.all(sheetDataPromises);
    
    // Calculate average open rate: sum all open values and divide by total count
    const totalSum = sheetResults.reduce((acc, result) => acc + result.sum, 0);
    const totalCount = sheetResults.reduce((acc, result) => acc + result.count, 0);
    
    // Calculate average as percentage
    const avgOpenRate = totalCount > 0 
      ? ((totalSum / totalCount)).toFixed(1) + '%'
      : '0%';
    
    console.log(`[Open Rate Stats] Total Sum: ${totalSum}, Total Count: ${totalCount}, Average: ${avgOpenRate}`);
    
    return { avgOpenRate };
  } catch (error: any) {
    console.error('Error fetching open rate stats:', error);
    return { avgOpenRate: '0%' };
  }
}


