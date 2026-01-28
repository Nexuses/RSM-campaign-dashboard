import { NextResponse } from 'next/server';
import { getSheetData, parseSheetData } from '@/lib/google-sheets';

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
          data: { active: 0, completed: 0 },
        },
        { status: 400 }
      );
    }

    // Fetch data from "1-1 RSM : All Campaign" sheet
    const sheetName = '1-1 RSM : All Campaign';
    const range = `${sheetName}!A1:ZZ10000`;
    const rawData = await getSheetData(spreadsheetId, range);
    
    if (!rawData || rawData.length === 0) {
      return NextResponse.json({
        success: true,
        data: { active: 0, completed: 0 },
        lastUpdated: new Date().toISOString(),
      });
    }

    const headers = rawData[0] as string[];
    const parsedData = parseSheetData(rawData, headers);
    
    // Count Active and Completed from Status column
    let active = 0;
    let completed = 0;
    
    parsedData.forEach((row: any) => {
      const status = getColumnValue(row, ['Status', 'status', 'STATUS']);
      if (!status) return;
      
      const statusStr = status.toString().trim().toLowerCase();
      if (statusStr === 'active') {
        active++;
      } else if (statusStr === 'completed') {
        completed++;
      }
    });
    
    return NextResponse.json({
      success: true,
      data: { active, completed },
      lastUpdated: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in active campaigns API route:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to fetch active campaigns data',
        data: { active: 0, completed: 0 },
      },
      { status: 500 }
    );
  }
}


