import { NextResponse } from 'next/server';
import { getSheetData, parseSheetData, convertToCampaignData } from '@/lib/google-sheets';

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

    // Fetch data from the two specific sheets
    const sheetNames = ['1-1 RSM : All Campaign', 'RSM Stats - Drip'];
    const range = 'A1:ZZ10000';
    
    // Fetch data from each sheet separately and get "Open" column directly
    const results = [];
    
    // Helper function to find column index with flexible name matching
    const findColumnIndex = (headers: string[], possibleNames: string[]): number => {
      for (const name of possibleNames) {
        const index = headers.findIndex(
          h => {
            if (!h) return false;
            // Trim and compare (handles trailing/leading spaces)
            const headerTrimmed = h.trim().toLowerCase();
            const nameTrimmed = name.trim().toLowerCase();
            // Exact match
            if (headerTrimmed === nameTrimmed) return true;
            // Contains match (for variations like "Open Rate" matching "Open")
            if (headerTrimmed.includes(nameTrimmed) || nameTrimmed.includes(headerTrimmed)) return true;
            return false;
          }
        );
        if (index !== -1) return index;
      }
      return -1;
    };
    
    // Process "1-1 RSM : All Campaign" sheet
    try {
      const oneOnOneRange = `1-1 RSM : All Campaign!${range}`;
      const oneOnOneRawData = await getSheetData(spreadsheetId, oneOnOneRange);
      
      console.log(`[Campaign Performance] 1-1 Campaigns sheet data rows: ${oneOnOneRawData ? oneOnOneRawData.length : 0}`);
      
      if (oneOnOneRawData && oneOnOneRawData.length > 1) {
        const headers = oneOnOneRawData[0] as string[];
        console.log(`[Campaign Performance] 1-1 Campaigns sheet headers:`, headers);
        const openColumnIndex = findColumnIndex(headers, [
          'Open', 'open', 'OPEN', 
          'Open Rate', 'open rate', 'OPEN RATE', 'openrate',
          'Open ', 'open ', 'OPEN ', // With trailing space
          ' Open', ' open', ' OPEN', // With leading space
          'Opens', 'opens', // Plural variations
        ]);
        
        console.log(`[Campaign Performance] 1-1 Campaigns Open column index: ${openColumnIndex}`);
        console.log(`[Campaign Performance] 1-1 Campaigns - Sample header row:`, oneOnOneRawData[0]);
        if (oneOnOneRawData.length > 1) {
          console.log(`[Campaign Performance] 1-1 Campaigns - Sample data row:`, oneOnOneRawData[1]);
          console.log(`[Campaign Performance] 1-1 Campaigns - Sample row length:`, oneOnOneRawData[1]?.length);
        }
        
        if (openColumnIndex !== -1) {
          let sum = 0;
          let count = 0;
          let blankCount = 0;
          let invalidCount = 0;
          let shortRowCount = 0;
          
          console.log(`[Campaign Performance] 1-1 Campaigns - Processing ${oneOnOneRawData.length - 1} data rows`);
          
          // Process data rows (skip header)
          for (let i = 1; i < oneOnOneRawData.length; i++) {
            const row = oneOnOneRawData[i];
            
            // Ensure row exists
            if (!row || !Array.isArray(row)) {
              continue;
            }
            
            // Check if row has enough columns
            if (row.length <= openColumnIndex) {
              shortRowCount++;
              if (shortRowCount <= 3) {
                console.log(`[Campaign Performance] 1-1 Campaigns - Row ${i}: Too short (length=${row.length}, need index=${openColumnIndex})`);
              }
              continue;
            }
            
            const openValue = row[openColumnIndex];
            
            // Skip blank/empty cells - only process cells with actual values
            if (openValue === null || openValue === undefined || openValue === '') {
              blankCount++;
              continue; // Skip blank cells
            }
            
            // Try to parse as number (handle percentages, commas, etc.)
            let numValue: number;
            if (typeof openValue === 'number') {
              numValue = openValue;
            } else {
              const strValue = openValue.toString().trim();
              // Skip if the trimmed string is empty
              if (strValue === '' || strValue === '-' || strValue === 'N/A' || strValue.toLowerCase() === 'na') {
                blankCount++;
                continue; // Skip empty strings and common "no value" indicators
              }
              // Remove % sign if present, and handle commas
              const cleaned = strValue.replace(/[%,\s]/g, '');
              numValue = parseFloat(cleaned);
            }
            
            // Only count valid numbers (not NaN and >= 0)
            if (!isNaN(numValue) && numValue >= 0) {
              sum += numValue;
              count++;
              // Log first 5 values for debugging
              if (count <= 5) {
                console.log(`[Campaign Performance] 1-1 Campaigns - Row ${i}: original="${openValue}", parsed=${numValue}`);
              }
            } else {
              invalidCount++;
              // Log first few skipped values for debugging
              if (invalidCount <= 3) {
                console.log(`[Campaign Performance] 1-1 Campaigns - Row ${i}: Skipped invalid value="${openValue}"`);
              }
            }
          }
          
          console.log(`[Campaign Performance] 1-1 Campaigns - Summary: Valid=${count}, Blank=${blankCount}, Invalid=${invalidCount}, ShortRows=${shortRowCount}, Sum=${sum}`);
          const avg = count > 0 ? sum / count : 0;
          console.log(`[Campaign Performance] 1-1 Campaigns - Average: ${avg}`);
          
          if (count === 0 && oneOnOneRawData.length > 1) {
            // If no valid values found, log more details about first few rows
            console.log(`[Campaign Performance] 1-1 Campaigns - DEBUG: No valid values found. Checking first 5 rows:`);
            for (let i = 1; i < Math.min(6, oneOnOneRawData.length); i++) {
              const row = oneOnOneRawData[i];
              if (row && row.length > openColumnIndex) {
                console.log(`[Campaign Performance] 1-1 Campaigns - Row ${i}: value="${row[openColumnIndex]}", type=${typeof row[openColumnIndex]}, length=${row.length}`);
              } else {
                console.log(`[Campaign Performance] 1-1 Campaigns - Row ${i}: row length=${row?.length || 0}, needed index=${openColumnIndex}`);
              }
            }
          }
          results.push({
            name: '1-1 Campaigns',
            openRate: parseFloat(avg.toFixed(1)),
          });
        } else {
          console.warn('⚠ "Open" column not found in "1-1 RSM : All Campaign" sheet. Available columns:', headers);
          results.push({
            name: '1-1 Campaigns',
            openRate: 0,
          });
        }
      } else {
        console.warn('⚠ No data found in "1-1 RSM : All Campaign" sheet');
        results.push({
          name: '1-1 Campaigns',
          openRate: 0,
        });
      }
    } catch (error: any) {
      console.error('Error fetching from "1-1 RSM : All Campaign":', error);
      results.push({
        name: '1-1 Campaigns',
        openRate: 0,
      });
    }
    
    // Process "RSM Stats - Drip" sheet
    try {
      const dripRange = `RSM Stats - Drip!${range}`;
      const dripRawData = await getSheetData(spreadsheetId, dripRange);
      
      console.log(`[Campaign Performance] Drip sheet data rows: ${dripRawData ? dripRawData.length : 0}`);
      
      if (dripRawData && dripRawData.length > 1) {
        const headers = dripRawData[0] as string[];
        console.log(`[Campaign Performance] Drip sheet headers:`, headers);
        const openColumnIndex = findColumnIndex(headers, [
          'Open', 'open', 'OPEN', 
          'Open Rate', 'open rate', 'OPEN RATE', 'openrate',
          'Open ', 'open ', 'OPEN ', // With trailing space
          ' Open', ' open', ' OPEN', // With leading space
          'Opens', 'opens', // Plural variations
        ]);
        
        console.log(`[Campaign Performance] Drip Open column index: ${openColumnIndex}`);
        
        if (openColumnIndex !== -1) {
          let sum = 0;
          let count = 0;
          
          // Process data rows (skip header)
          for (let i = 1; i < dripRawData.length; i++) {
            const row = dripRawData[i];
            const openValue = row[openColumnIndex];
            
            // Skip blank/empty cells - only process cells with actual values
            if (openValue === null || openValue === undefined || openValue === '') {
              continue; // Skip blank cells
            }
            
            // Try to parse as number (handle percentages, commas, etc.)
            let numValue: number;
            if (typeof openValue === 'number') {
              numValue = openValue;
            } else {
              const strValue = openValue.toString().trim();
              // Skip if the trimmed string is empty
              if (strValue === '' || strValue === '-' || strValue === 'N/A' || strValue.toLowerCase() === 'na') {
                continue; // Skip empty strings and common "no value" indicators
              }
              // Remove % sign if present
              const cleaned = strValue.replace(/[%,\s]/g, '');
              numValue = parseFloat(cleaned);
            }
            
            // Only count valid numbers (not NaN and >= 0)
            if (!isNaN(numValue) && numValue >= 0) {
              sum += numValue;
              count++;
            }
          }
          
          console.log(`[Campaign Performance] Drip - Sum: ${sum}, Count: ${count}`);
          const avg = count > 0 ? sum / count : 0;
          console.log(`[Campaign Performance] Drip - Average: ${avg}`);
          results.push({
            name: 'Drip',
            openRate: parseFloat(avg.toFixed(1)),
          });
        } else {
          console.warn('⚠ "Open" column not found in "RSM Stats - Drip" sheet. Available columns:', headers);
          results.push({
            name: 'Drip',
            openRate: 0,
          });
        }
      } else {
        console.warn('⚠ No data found in "RSM Stats - Drip" sheet');
        results.push({
          name: 'Drip',
          openRate: 0,
        });
      }
    } catch (error: any) {
      console.error('Error fetching from "RSM Stats - Drip":', error);
      results.push({
        name: 'Drip',
        openRate: 0,
      });
    }
    
    return NextResponse.json({
      success: true,
      data: results,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in campaign performance API route:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to fetch campaign performance data',
        data: [],
      },
      { status: 500 }
    );
  }
}


