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

/**
 * Parse open rate value from various formats
 */
function parseOpenRate(value: any): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  
  if (typeof value === 'number') {
    return value >= 0 ? value : null;
  }
  
  const strValue = value.toString().trim();
  if (strValue === '' || strValue === '-' || strValue === 'N/A' || strValue.toLowerCase() === 'na') {
    return null;
  }
  
  // Remove % sign, commas, and whitespace
  const cleaned = strValue.replace(/[%,\s]/g, '');
  const parsed = parseFloat(cleaned);
  
  return !isNaN(parsed) && parsed >= 0 ? parsed : null;
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
    
    const allCampaigns: Array<{
      name: string;
      openRate: number;
      clickRate: number;
      date?: string;
    }> = [];
    
    // Process each sheet
    for (const sheetName of sheetNames) {
      try {
        const sheetRange = `${sheetName}!${range}`;
        const rawData = await getSheetData(spreadsheetId, sheetRange);
        
        if (!rawData || rawData.length === 0) {
          console.log(`[Open Rate] ${sheetName} sheet is empty or not found`);
          continue;
        }

        const headers = rawData[0] as string[];
        const parsedData = parseSheetData(rawData, headers);
        
        // Extract data from this sheet
        parsedData.forEach((row: any) => {
          // Get campaign name
          const name = getColumnValue(row, ['Name', 'name', 'NAME', 'Campaign Name', 'campaignName']);
          if (!name) return;
          
          // Get open rate from "Open" column
          const openValue = getColumnValue(row, [
            'Open', 'open', 'OPEN', 
            'Open Rate', 'open rate', 'OPEN RATE', 'openrate',
            'Open ', 'open ', 'OPEN ', // With trailing space
            ' Open', ' open', ' OPEN', // With leading space
          ]);
          
          // Get click rate (optional)
          const clickValue = getColumnValue(row, [
            'Click', 'click', 'CLICK',
            'Click Rate', 'click rate', 'CLICK RATE', 'clickrate',
            'Click ', 'click ', 'CLICK ',
            ' Click', ' click', ' CLICK',
          ]);
          
          // Get date (optional, for filtering)
          const dateValue = getColumnValue(row, [
            'Date', 'date', 'DATE',
            'Setup Date', 'setup date', 'SETUP DATE',
          ]);
          
          const openRate = parseOpenRate(openValue);
          const clickRate = parseOpenRate(clickValue);
          
          // Only include campaigns with at least an open rate
          if (openRate !== null) {
            allCampaigns.push({
              name: name.toString().trim(),
              openRate: openRate,
              clickRate: clickRate !== null ? clickRate : 0,
              date: dateValue ? dateValue.toString().trim() : undefined,
            });
          }
        });
        
        console.log(`[Open Rate] Processed ${parsedData.length} rows from ${sheetName}, found ${allCampaigns.length} campaigns with open rates`);
      } catch (error: any) {
        console.error(`[Open Rate] Error processing ${sheetName}:`, error);
        // Continue processing other sheets even if one fails
      }
    }
    
    return NextResponse.json({
      success: true,
      data: allCampaigns,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in open rate API route:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to fetch open rate data',
        data: [],
      },
      { status: 500 }
    );
  }
}
