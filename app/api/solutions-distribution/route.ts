import { NextResponse } from 'next/server';
import { getSheetData, parseSheetData } from '@/lib/google-sheets';

/**
 * Helper function to normalize solution name
 * Returns normalized name for known categories, or original name for others
 */
function normalizeSolution(solution: string): string {
  if (!solution) return '';
  
  const solutionTrimmed = solution.toString().trim();
  const solutionLower = solutionTrimmed.toLowerCase();
  
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
  
  // Return original solution name for other entries
  return solutionTrimmed;
}

/**
 * Generate a color for unknown solutions based on a hash of the name
 */
function generateColorForSolution(solutionName: string): string {
  // RSM brand colors for known solutions
  const brandColors: Record<string, string> = {
    'ESG': '#0b74bb', // RSM blue
    'Transitional Advisory': '#0db14b', // RSM green
    'VAPT': '#58595b', // RSM grey
  };
  
  if (brandColors[solutionName]) {
    return brandColors[solutionName];
  }
  
  // Generate a consistent color for unknown solutions using a simple hash
  let hash = 0;
  for (let i = 0; i < solutionName.length; i++) {
    hash = solutionName.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Generate a color in a pleasant range (avoid too dark or too light)
  const hue = Math.abs(hash % 360);
  const saturation = 60 + (Math.abs(hash) % 20); // 60-80%
  const lightness = 45 + (Math.abs(hash) % 15); // 45-60%
  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
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

    // Fetch data from both sheets: "RSM Stats - Drip" and "1-1 RSM : All Campaign"
    const sheetNames = ['RSM Stats - Drip', '1-1 RSM : All Campaign'];
    const range = 'A1:ZZ10000';
    
    // Count solutions from all sheets
    const solutionCounts: Record<string, number> = {};
    
    // Process each sheet
    for (const sheetName of sheetNames) {
      try {
        const sheetRange = `${sheetName}!${range}`;
        const rawData = await getSheetData(spreadsheetId, sheetRange);
        
        if (!rawData || rawData.length === 0) {
          console.log(`[Solutions Distribution] ${sheetName} sheet is empty or not found`);
          continue;
        }

        const headers = rawData[0] as string[];
        const parsedData = parseSheetData(rawData, headers);
        
        // Count solutions from this sheet
        parsedData.forEach((row: any) => {
          const solution = getColumnValue(row, ['Solution', 'solution', 'SOLUTION']);
          if (!solution) return;
          
          const normalizedSolution = normalizeSolution(solution.toString());
          // Include all solutions, including unknown ones
          if (normalizedSolution && normalizedSolution.trim() !== '') {
            solutionCounts[normalizedSolution] = (solutionCounts[normalizedSolution] || 0) + 1;
          }
        });
        
        console.log(`[Solutions Distribution] Processed ${parsedData.length} rows from ${sheetName}`);
      } catch (error: any) {
        console.error(`[Solutions Distribution] Error processing ${sheetName}:`, error);
        // Continue processing other sheets even if one fails
      }
    }

    // Get all solution names
    const allSolutions = Object.keys(solutionCounts);
    
    // Define preferred order: VAPT, Transitional Advisory, ESG first, then others alphabetically
    const preferredOrder = ['VAPT', 'Transitional Advisory', 'ESG'];
    const orderedSolutions = [
      ...preferredOrder.filter(name => solutionCounts[name] > 0),
      ...allSolutions
        .filter(name => !preferredOrder.includes(name))
        .sort()
    ];
    
    // Create data array with colors
    const data = orderedSolutions.map((name) => ({
      name,
      value: solutionCounts[name],
      fill: generateColorForSolution(name),
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


