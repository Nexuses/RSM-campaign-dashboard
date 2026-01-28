import { NextResponse } from 'next/server';
import { getSheetData, parseSheetData, getSheetNames } from '@/lib/google-sheets';
import { getSheetConfig, getSheetRange } from '@/lib/sheet-config';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const spreadsheetId = searchParams.get('spreadsheetId') || process.env.GOOGLE_SHEET_ID;
    
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

    const sheetConfig = getSheetConfig();
    const sheetName = sheetConfig.pipeline;
    // Use larger range to ensure we get all data
    const range = `${sheetName}!A1:ZZ10000`;

    // Fetch raw data from Google Sheets
    const rawData = await getSheetData(spreadsheetId, range);

    if (!rawData || rawData.length === 0) {
      return NextResponse.json({ 
        success: true,
        data: [], 
        message: 'No pipeline data found',
      });
    }

    // Auto-detect headers from first row
    const headers = rawData[0] as string[];
    const parsedData = parseSheetData(rawData, headers);
    
    // Debug logging to help troubleshoot
    console.log(`[Pipeline API] Sheet: ${sheetName}, Rows fetched: ${parsedData.length}`);
    if (parsedData.length > 0) {
      console.log(`[Pipeline API] Headers:`, headers);
      console.log(`[Pipeline API] Sample row:`, parsedData[0]);
    }

    return NextResponse.json({
      success: true,
      data: parsedData,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in pipeline API route:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to fetch pipeline data',
        data: [],
      },
      { status: 500 }
    );
  }
}


