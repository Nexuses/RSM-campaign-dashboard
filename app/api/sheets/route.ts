import { NextResponse } from 'next/server';
import { getSheetData, parseSheetData, convertToCampaignData, getSheetNames, getMultipleSheetsData } from '@/lib/google-sheets';
import { getSheetConfig, getSheetRange, getCampaignSheets } from '@/lib/sheet-config';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const spreadsheetId = searchParams.get('spreadsheetId') || process.env.GOOGLE_SHEET_ID;
    const sheetType = searchParams.get('sheet') || 'campaignData'; // Default to campaign data
    const customRange = searchParams.get('range');
    
    // Get sheet configuration
    const sheetConfig = getSheetConfig();
    
    if (!spreadsheetId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Spreadsheet ID is required',
          message: 'Set GOOGLE_SHEET_ID in environment variables or pass as query parameter. See GOOGLE_SHEETS_SETUP.md for setup instructions.',
          data: [],
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

    // Handle campaign data - can be multiple sheets
    let rawData: any[][];
    let headers: string[] = [];
    
    if (sheetType === 'campaignData') {
      const campaignSheets = getCampaignSheets();
      
      if (campaignSheets.length > 1) {
        // Multiple sheets - fetch and process each sheet separately with its own headers
        console.log(`Fetching campaign data from ${campaignSheets.length} sheets: ${campaignSheets.join(', ')}`);
        const range = customRange || 'A1:Z1000';
        const allCampaignData: any[] = [];
        
        // Process each sheet separately to ensure proper column mapping
        for (const sheetName of campaignSheets) {
          try {
            const rangeStr = `${sheetName}!${range}`;
            const sheetRawData = await getSheetData(spreadsheetId, rangeStr);
            
            if (sheetRawData && sheetRawData.length > 0) {
              const sheetHeaders = sheetRawData[0] as string[];
              const sheetParsedData = parseSheetData(sheetRawData, sheetHeaders);
              const sheetCampaignData = convertToCampaignData(sheetParsedData, sheetHeaders);
              allCampaignData.push(...sheetCampaignData);
              console.log(`✓ Processed ${sheetCampaignData.length} rows from sheet "${sheetName}"`);
            }
          } catch (error: any) {
            console.error(`Error processing sheet "${sheetName}":`, error.message);
            // Continue with other sheets even if one fails
          }
        }
        
        // Return combined campaign data directly (already converted)
        const stats = calculateStats(allCampaignData);
        return NextResponse.json({
          success: true,
          data: allCampaignData,
          stats,
          lastUpdated: new Date().toISOString(),
        });
      } else {
        // Single sheet - use existing logic
        const sheetName = campaignSheets[0];
        let range: string;
        
        if (customRange) {
          range = customRange.includes('!') ? customRange : `${sheetName}!${customRange}`;
        } else if (process.env.GOOGLE_SHEET_RANGE) {
          range = process.env.GOOGLE_SHEET_RANGE;
        } else {
          range = getSheetRange(sheetName);
        }
        
        rawData = await getSheetData(spreadsheetId, range);
      }
    } else {
      // Other sheet types (pipeline, leads, etc.) - single sheet
      let sheetName: string;
      switch (sheetType) {
        case 'pipeline':
          sheetName = sheetConfig.pipeline;
          break;
        case 'leads':
          sheetName = sheetConfig.leads || (Array.isArray(sheetConfig.campaignData) ? sheetConfig.campaignData[0] : sheetConfig.campaignData);
          break;
        case 'prospects':
          sheetName = sheetConfig.prospects || (Array.isArray(sheetConfig.campaignData) ? sheetConfig.campaignData[0] : sheetConfig.campaignData);
          break;
        case 'content':
          sheetName = sheetConfig.content || (Array.isArray(sheetConfig.campaignData) ? sheetConfig.campaignData[0] : sheetConfig.campaignData);
          break;
        case 'analytics':
          sheetName = sheetConfig.analytics || (Array.isArray(sheetConfig.campaignData) ? sheetConfig.campaignData[0] : sheetConfig.campaignData);
          break;
        case 'oneOnOne':
          sheetName = '1-1 RSM : All Campaign';
          break;
        case 'drip':
          sheetName = sheetConfig.drip || 'RSM Stats - Drip';
          break;
        default:
          sheetName = Array.isArray(sheetConfig.campaignData) ? sheetConfig.campaignData[0] : sheetConfig.campaignData;
      }
      
      let range: string;
      if (customRange) {
        range = customRange.includes('!') ? customRange : `${sheetName}!${customRange}`;
      } else if (process.env.GOOGLE_SHEET_RANGE) {
        range = process.env.GOOGLE_SHEET_RANGE;
      } else {
        range = getSheetRange(sheetName);
      }
      
      rawData = await getSheetData(spreadsheetId, range);
    }

    if (!rawData || rawData.length === 0) {
      return NextResponse.json({ 
        success: true,
        data: [], 
        message: 'No data found in the specified range',
        stats: {
          totalProspects: '0',
          hotLeads: '0',
          activePipeline: '0',
          avgOpenRate: '0%',
        },
        lastUpdated: new Date().toISOString(),
      });
    }

    // Auto-detect headers from first row if not already set
    if (headers.length === 0 && rawData.length > 0) {
      headers = rawData[0] as string[];
    }
    
    // Parse and convert data - pass headers for flexible column mapping
    const parsedData = parseSheetData(rawData, headers);
    const campaignData = convertToCampaignData(parsedData, headers);

    // Calculate stats
    const stats = calculateStats(campaignData);

    return NextResponse.json({
      success: true,
      data: campaignData,
      stats,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in sheets API route:', error);
    
    // Provide helpful error messages based on error type
    let errorMessage = error.message || 'Unknown error';
    let userMessage = 'Failed to fetch data from Google Sheets';
    let statusCode = 500;
    
    // Handle 400 Bad Request errors
    if (error.code === 400 || errorMessage.includes('Bad Request') || errorMessage.includes('400')) {
      statusCode = 400;
      userMessage = errorMessage.includes('Bad Request') 
        ? errorMessage 
        : 'Bad Request: Invalid Google Sheets request. Please check your GOOGLE_SHEET_ID and sheet configuration.';
    } else if (errorMessage.includes('Quota exceeded') || errorMessage.includes('quota')) {
      userMessage = 'Google Sheets API quota exceeded. Please wait a few minutes before refreshing. The dashboard will automatically retry when the quota resets.';
    } else if (errorMessage.includes('credentials') || errorMessage.includes('authentication')) {
      userMessage = 'Google Sheets credentials not configured. Please set up your credentials in .env.local file. See GOOGLE_SHEETS_SETUP.md for instructions.';
    } else if (errorMessage.includes('permission') || errorMessage.includes('access')) {
      userMessage = 'Permission denied. Make sure your service account has access to the Google Sheet, or the sheet is public if using API key.';
    } else if (errorMessage.includes('not found') || errorMessage.includes('404')) {
      statusCode = 404;
      userMessage = 'Google Sheet not found. Please check your GOOGLE_SHEET_ID.';
    } else if (errorMessage.includes('Invalid range') || errorMessage.includes('parse range') || errorMessage.includes('Unable to parse')) {
      statusCode = 400;
      userMessage = errorMessage; // Use the detailed error message we created
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: userMessage,
        message: errorMessage,
        data: [],
        stats: {
          totalProspects: '0',
          hotLeads: '0',
          activePipeline: '0',
          avgOpenRate: '0%',
        }
      },
      { status: statusCode }
    );
  }
}

function calculateStats(data: any[]) {
  const totalProspects = data.reduce((sum, row) => sum + (row.send || 0), 0);
  const totalLeads = data.reduce((sum, row) => sum + (row.leads || 0), 0);
  
  // Calculate average open rate - ignore empty cells
  const openRates = data
    .map((row) => {
      const rateValue = row.openRate;
      
      // Skip empty cells: null, undefined, empty string
      if (rateValue === null || rateValue === undefined || rateValue === '') {
        return null;
      }
      
      // Check if it's a string that's empty or represents "no value"
      const strValue = rateValue.toString().trim();
      if (strValue === '' || strValue === '-' || strValue === 'N/A' || strValue.toLowerCase() === 'na' || strValue === 'null') {
        return null;
      }
      
      // Parse the rate value
      const cleaned = strValue.replace('%', '').replace(/[,\s]/g, '');
      const numValue = parseFloat(cleaned);
      
      // Return null for invalid numbers, otherwise return the number
      return (!isNaN(numValue) && numValue >= 0) ? numValue : null;
    })
    .filter((rate) => rate !== null && !isNaN(rate)) as number[];
    
  const avgOpenRate = openRates.length > 0 
    ? (openRates.reduce((sum, rate) => sum + rate, 0) / openRates.length).toFixed(1) + '%'
    : '0%';

  // Count hot leads (leads > 0)
  const hotLeads = data.filter((row) => (row.leads || 0) > 0).length;

  // Count active pipeline (campaigns with sends > 0)
  const activePipeline = data.filter((row) => (row.send || 0) > 0).length;

  return {
    totalProspects: totalProspects.toLocaleString(),
    hotLeads: hotLeads.toString(),
    activePipeline: activePipeline.toString(),
    avgOpenRate,
  };
}



