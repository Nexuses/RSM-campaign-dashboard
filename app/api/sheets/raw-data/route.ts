import { NextResponse } from 'next/server';
import { getSheetData, parseSheetData } from '@/lib/google-sheets';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const spreadsheetId = searchParams.get('spreadsheetId') || process.env.GOOGLE_SHEET_ID;
    const sheetName = searchParams.get('sheetName');
    
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

    if (!sheetName) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Sheet name is required',
          data: [],
        },
        { status: 400 }
      );
    }

    // Fetch data from the specified sheet - use larger range to get all data
    const range = 'A1:ZZ10000'; // Increased range to capture more columns and rows
    const rangeStr = `${sheetName}!${range}`;
    
    try {
      const rawData = await getSheetData(spreadsheetId, rangeStr);
      
      if (!rawData || rawData.length === 0) {
        return NextResponse.json({
          success: true,
          data: [],
          message: `No data found in sheet "${sheetName}"`,
        });
      }

      const headers = rawData[0] as string[];
      const parsedData = parseSheetData(rawData, headers);
      
      // Return raw parsed data for ALL sheets to preserve all columns
      // This ensures the raw data table shows every column from the sheet
      return NextResponse.json({
        success: true,
        data: parsedData,
        headers: headers,
        lastUpdated: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error(`Error fetching data from sheet "${sheetName}":`, error);
      
      // Check if it's a "sheet not found" error
      if (error.message?.includes('Unable to parse range') || error.message?.includes('not found')) {
        return NextResponse.json(
          { 
            success: false,
            error: `Sheet "${sheetName}" not found. Please check the sheet name.`,
            data: [],
          },
          { status: 404 }
        );
      }
      
      throw error;
    }
  } catch (error: any) {
    console.error('Error in raw data API route:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to fetch raw data',
        data: [],
      },
      { status: 500 }
    );
  }
}


