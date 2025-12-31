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
        // Multiple sheets - fetch and combine
        console.log(`Fetching campaign data from ${campaignSheets.length} sheets: ${campaignSheets.join(', ')}`);
        const range = customRange || 'A1:Z1000';
        const result = await getMultipleSheetsData(spreadsheetId, campaignSheets, range);
        rawData = result.data;
        // Use headers from first sheet for mapping
        if (result.sheetHeaders && result.sheetHeaders.size > 0) {
          const firstSheetName = campaignSheets[0];
          const firstHeaders = result.sheetHeaders.get(firstSheetName);
          if (firstHeaders) {
            headers = firstHeaders;
          } else if (rawData.length > 0) {
            headers = rawData[0] as string[];
          }
        } else if (rawData.length > 0) {
          headers = rawData[0] as string[];
        }
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
          sheetName = 'RSM Stats - Drip';
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
    
    if (errorMessage.includes('Quota exceeded') || errorMessage.includes('quota')) {
      userMessage = 'Google Sheets API quota exceeded. Please wait a few minutes before refreshing. The dashboard will automatically retry when the quota resets.';
    } else if (errorMessage.includes('credentials') || errorMessage.includes('authentication')) {
      userMessage = 'Google Sheets credentials not configured. Please set up your credentials in .env.local file. See GOOGLE_SHEETS_SETUP.md for instructions.';
    } else if (errorMessage.includes('permission') || errorMessage.includes('access')) {
      userMessage = 'Permission denied. Make sure your service account has access to the Google Sheet, or the sheet is public if using API key.';
    } else if (errorMessage.includes('not found') || errorMessage.includes('404')) {
      userMessage = 'Google Sheet not found. Please check your GOOGLE_SHEET_ID.';
    } else if (errorMessage.includes('Invalid range') || errorMessage.includes('parse range') || errorMessage.includes('Unable to parse')) {
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
      { status: 500 }
    );
  }
}

function calculateStats(data: any[]) {
  const totalProspects = data.reduce((sum, row) => sum + (row.send || 0), 0);
  const totalLeads = data.reduce((sum, row) => sum + (row.leads || 0), 0);
  
  // Calculate average open rate
  const openRates = data
    .map((row) => {
      const rate = row.openRate?.toString().replace('%', '') || '0';
      return parseFloat(rate);
    })
    .filter((rate) => !isNaN(rate));
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



