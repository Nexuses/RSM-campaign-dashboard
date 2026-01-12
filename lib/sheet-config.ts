/**
 * Configuration for mapping dashboard components to Google Sheet tabs
 * Update this file to match your Google Sheet structure
 */

export interface SheetConfig {
  // Main campaign data sheets (can be single sheet or multiple sheets)
  // If multiple sheets, they will be combined/merged
  campaignData: string | string[];
  
  // Pipeline data sheet
  pipeline: string;
  
  // Drip campaign sheet
  drip?: string;
  
  // Additional data sheets (customize as needed)
  leads?: string;
  prospects?: string;
  content?: string;
  analytics?: string;
  other?: string;
}

/**
 * Parse comma-separated sheet names into an array
 */
function parseSheetList(sheets: string | undefined, fallback: string): string[] {
  if (!sheets) return [fallback];
  
  // Split by comma and trim whitespace
  const sheetList = sheets.split(',').map(s => s.trim()).filter(s => s.length > 0);
  
  return sheetList.length > 0 ? sheetList : [fallback];
}

/**
 * Get sheet configuration from environment variables or use defaults
 */
export function getSheetConfig(): SheetConfig {
  const defaultCampaignSheet = process.env.GOOGLE_SHEET_RANGE?.split('!')[0] || 'Sheet1';
  
  // Support multiple campaign sheets (comma-separated)
  const campaignSheets = process.env.GOOGLE_SHEET_CAMPAIGNS;
  const campaignData = campaignSheets 
    ? parseSheetList(campaignSheets, defaultCampaignSheet)
    : defaultCampaignSheet;
  
  return {
    // Main campaign data - can be single sheet or array of sheets
    // If multiple sheets specified, data will be combined
    campaignData: campaignData.length === 1 ? campaignData[0] : campaignData,
    
    // Pipeline data - used by PipelineStatus component
    pipeline: process.env.GOOGLE_SHEET_PIPELINE || 'Pipeline',
    
    // Drip campaign sheet
    drip: process.env.GOOGLE_SHEET_DRIP,
    
    // Additional sheets (optional)
    leads: process.env.GOOGLE_SHEET_LEADS,
    prospects: process.env.GOOGLE_SHEET_PROSPECTS,
    content: process.env.GOOGLE_SHEET_CONTENT,
    analytics: process.env.GOOGLE_SHEET_ANALYTICS,
    other: process.env.GOOGLE_SHEET_OTHER,
  };
}

/**
 * Get campaign sheet names as an array
 */
export function getCampaignSheets(): string[] {
  const config = getSheetConfig();
  return Array.isArray(config.campaignData) ? config.campaignData : [config.campaignData];
}

/**
 * Get the range for a specific sheet
 */
export function getSheetRange(sheetName: string, defaultRange: string = 'A1:Z1000'): string {
  return `${sheetName}!${defaultRange}`;
}


