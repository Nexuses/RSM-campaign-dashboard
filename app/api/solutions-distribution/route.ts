import { NextResponse } from 'next/server';
import { getSheetData, parseSheetData } from '@/lib/google-sheets';

/**
 * Helper function to normalize solution name
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

export async function GET(request: Request) {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    
    if (!spreadsheetId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Spreadsheet ID is required',
          data: [],
        },
        { status: 400 }
      );
    }

    // Fetch data from "RSM Stats - Drip" sheet
    const sheetName = 'RSM Stats - Drip';
    const range = `${sheetName}!A1:ZZ10000`;
    const rawData = await getSheetData(spreadsheetId, range);
    
    if (!rawData || rawData.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        lastUpdated: new Date().toISOString(),
      });
    }

    const headers = rawData[0] as string[];
    const parsedData = parseSheetData(rawData, headers);
    
    // Count solutions
    const solutionCounts: Record<string, number> = {};
    
    parsedData.forEach((row: any) => {
      const solution = getColumnValue(row, ['Solution', 'solution', 'SOLUTION']);
      if (!solution) return;
      
      const normalizedSolution = normalizeSolution(solution.toString());
      if (normalizedSolution) {
        solutionCounts[normalizedSolution] = (solutionCounts[normalizedSolution] || 0) + 1;
      }
    });

    // Define colors for the three allowed solutions (RSM brand colors)
    const colorMap: Record<string, string> = {
      'ESG': '#0b74bb', // RSM blue
      'Transitional Advisory': '#0db14b', // RSM green
      'VAPT': '#58595b', // RSM grey
    };

    // Return data in a consistent order: VAPT, TA, ESG
    const orderedSolutions = ['VAPT', 'Transitional Advisory', 'ESG'];
    const data = orderedSolutions
      .filter(name => solutionCounts[name] > 0)
      .map((name) => ({
        name,
        value: solutionCounts[name],
        fill: colorMap[name],
      }));
    
    return NextResponse.json({
      success: true,
      data,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in solutions distribution API route:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to fetch solutions distribution data',
        data: [],
      },
      { status: 500 }
    );
  }
}


