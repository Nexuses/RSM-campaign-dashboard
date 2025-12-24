import { google } from 'googleapis';
import { createColumnMapping, mapRowToCampaignData } from './column-mapper';

// Initialize Google Sheets API client
export async function getGoogleSheetsClient() {
  // Option 1: Service Account (Recommended for server-side)
  // Requires GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY environment variables
  if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    return google.sheets({ version: 'v4', auth });
  }

  // Option 2: API Key (Simpler, but less secure - only works with public sheets)
  if (process.env.GOOGLE_API_KEY) {
    return google.sheets({ version: 'v4', auth: process.env.GOOGLE_API_KEY });
  }

  throw new Error('Google Sheets credentials not configured. Please set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY, or GOOGLE_API_KEY in your environment variables.');
}

// Get all sheet names from a spreadsheet
export async function getSheetNames(spreadsheetId: string): Promise<string[]> {
  try {
    const sheets = await getGoogleSheetsClient();
    const response = await sheets.spreadsheets.get({
      spreadsheetId,
    });

    return response.data.sheets?.map(sheet => sheet.properties?.title || '') || [];
  } catch (error: any) {
    console.error('Error fetching sheet names:', error);
    throw error;
  }
}

// Fetch data from a specific range in Google Sheets
export async function getSheetData(spreadsheetId: string, range: string) {
  try {
    const sheets = await getGoogleSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    return response.data.values || [];
  } catch (error: any) {
    console.error('Error fetching Google Sheets data:', error);
    
    // Handle range parsing errors
    if (error.message?.includes('Unable to parse range') || error.message?.includes('parse range')) {
      // Try to get the actual sheet names and suggest them
      try {
        const sheetNames = await getSheetNames(spreadsheetId);
        if (sheetNames.length > 0) {
          throw new Error(
            `Invalid sheet name in range "${range}". Available sheets: ${sheetNames.join(', ')}. ` +
            `Please set GOOGLE_SHEET_RANGE to use one of these sheet names (e.g., "${sheetNames[0]}!A1:Z1000").`
          );
        }
      } catch (e) {
        // If we can't get sheet names, just provide a generic error
      }
      throw new Error(
        `Invalid range format: "${range}". Make sure the sheet name exists. ` +
        `Format should be: "SheetName!A1:Z1000" (e.g., "Sheet1!A1:Z1000").`
      );
    }
    
    // Provide more specific error messages
    if (error.code === 403) {
      throw new Error('Permission denied. Make sure your service account has access to the Google Sheet, or the sheet is public if using API key.');
    } else if (error.code === 404) {
      throw new Error('Google Sheet not found. Please check your GOOGLE_SHEET_ID.');
    } else if (error.message?.includes('credentials') || error.message?.includes('authentication')) {
      throw new Error('Google Sheets credentials not configured. Please set up your credentials in .env.local file.');
    }
    
    throw error;
  }
}

// Convert raw sheet data to structured format
export function parseSheetData(rawData: any[][], headers: string[]) {
  if (!rawData || rawData.length === 0) return [];

  // First row should be headers, rest is data
  const dataRows = rawData.slice(1);
  
  return dataRows.map((row) => {
    const rowData: any = {};
    headers.forEach((header, index) => {
      rowData[header] = row[index] || '';
    });
    return rowData;
  });
}

// Helper to convert sheet data to campaign data format
// Now supports flexible column structures across different sheets
export function convertToCampaignData(sheetData: any[], headers?: string[]) {
  if (!sheetData || sheetData.length === 0) return [];
  
  // If headers are provided, use flexible mapping
  if (headers && headers.length > 0) {
    const columnMapping = createColumnMapping(headers);
    const dataRows = sheetData.slice(1); // Skip header row
    
    return dataRows.map((row) => {
      // Ensure row is an array
      const rowArray = Array.isArray(row) ? row : Object.values(row);
      return mapRowToCampaignData(rowArray, columnMapping, headers);
    });
  }
  
  // Fallback to object-based mapping (for backward compatibility)
  return sheetData.map((row, index) => {
    // Handle Send column - remove commas and parse
    const sendValue = (row.send || row.Send || row.sent || '0').toString().replace(/,/g, '');
    
    // Format rate values
    const formatRate = (value: any): string => {
      if (!value) return '0%';
      const str = value.toString().trim();
      if (str === '' || str === '-') return '0%';
      if (str.includes('%')) return str;
      const num = parseFloat(str);
      if (!isNaN(num)) return num + '%';
      return '0%';
    };
    
    return {
      date: row.date || row.Date || '',
      campaignName: row.name || row.Name || row.campaignName || row['Campaign Name'] || row.campaign_name || '',
      project: row['Project Name'] || row.project || row.Project || '',
      solutionArea: row.Solution || row.solution || row.solutionArea || row['Solution Area'] || row.solution_area || '',
      emailTool: row.Tool || row.tool || row.emailTool || row['Email Tool'] || row.email_tool || '',
      send: parseInt(sendValue, 10) || 0,
      openRate: formatRate(row.Open || row.open || row.openRate || row['Open Rate'] || row.open_rate),
      clickRate: formatRate(row.Click || row.click || row.clickRate || row['Click Rate'] || row.click_rate),
      bounceRate: formatRate(row.Bounce || row.bounce || row.bounceRate || row['Bounce Rate'] || row.bounce_rate),
      unsubscribeRate: formatRate(row.unsub || row.Unsub || row.unsubscribeRate || row['Unsubscribe Rate'] || row.unsubscribe_rate),
      leads: parseInt(row.leads || row.Leads || '0', 10),
    };
  });
}

/**
 * Fetch data from multiple sheets and combine them
 * Returns data with sheet source information for flexible column mapping
 */
export async function getMultipleSheetsData(
  spreadsheetId: string, 
  sheetNames: string[], 
  range: string = 'A1:Z1000'
): Promise<{ data: any[][], sheetHeaders: Map<string, string[]> }> {
  const allData: any[][] = [];
  const errors: string[] = [];
  const sheetHeaders = new Map<string, string[]>();
  let firstSheetHeaders: string[] = [];
  
  for (const sheetName of sheetNames) {
    try {
      const rangeStr = `${sheetName}!${range}`;
      const data = await getSheetData(spreadsheetId, rangeStr);
      
      if (data && data.length > 0) {
        const headers = data[0] as string[];
        sheetHeaders.set(sheetName, headers);
        
        // Store first sheet's headers as reference
        if (allData.length === 0) {
          firstSheetHeaders = headers;
          // First sheet: include headers
          allData.push(...data);
        } else {
          // Subsequent sheets: skip first row (headers) and add data
          // Note: We keep the original headers for each sheet for flexible mapping
          allData.push(...data.slice(1));
        }
        console.log(`✓ Fetched ${data.length - 1} rows from sheet "${sheetName}"`);
      } else {
        console.warn(`⚠ No data found in sheet "${sheetName}"`);
      }
    } catch (error: any) {
      const errorMsg = `Error fetching from sheet "${sheetName}": ${error.message}`;
      console.error(errorMsg);
      errors.push(errorMsg);
      // Continue with other sheets even if one fails
    }
  }
  
  if (errors.length > 0 && allData.length === 0) {
    // If all sheets failed, throw an error
    throw new Error(`Failed to fetch data from all sheets:\n${errors.join('\n')}`);
  }
  
  if (errors.length > 0) {
    console.warn(`Some sheets failed to load:\n${errors.join('\n')}`);
  }
  
  return { data: allData, sheetHeaders };
}


