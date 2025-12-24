/**
 * Flexible column mapping system for different sheet structures
 * Handles variations in column names across different sheets
 */

export interface ColumnMapping {
  date?: string[];
  campaignName?: string[];
  project?: string[];
  solutionArea?: string[];
  emailTool?: string[];
  send?: string[];
  openRate?: string[];
  clickRate?: string[];
  bounceRate?: string[];
  unsubscribeRate?: string[];
  leads?: string[];
  status?: string[];
}

/**
 * Default column name variations to look for
 */
const DEFAULT_COLUMN_MAPPINGS: ColumnMapping = {
  date: ['Date', 'date', 'DATE', 'Setup Date', 'setup date', 'SETUP DATE'],
  campaignName: ['Name', 'name', 'Campaign Name', 'campaignName', 'Campaign', 'campaign_name'],
  project: ['Project Name', 'Project', 'project', 'PROJECT', 'projectName'],
  solutionArea: ['Solution', 'solution', 'Solution Area', 'solutionArea', 'SOLUTION', 'solution_area'],
  emailTool: ['Tool', 'tool', 'Email Tool', 'emailTool', 'TOOL', 'email_tool', 'EmailTool'],
  send: ['Send', 'send', 'SEND', 'sent', 'Sent', 'SENT', 'Contacts Sent', 'Contacts', 'contacts', 'CONTACTS'],
  openRate: ['Open', 'open', 'OPEN', 'Open Rate', 'openRate', 'open_rate', 'Open%'],
  clickRate: ['Click', 'click', 'CLICK', 'Click Rate', 'clickRate', 'click_rate', 'Click%'],
  bounceRate: ['Bounce', 'bounce', 'BOUNCE', 'Bounce Rate', 'bounceRate', 'bounce_rate', 'Bounce%'],
  unsubscribeRate: ['unsub', 'Unsub', 'UNSUB', 'Unsubscribe', 'unsubscribe', 'Unsubscribe Rate', 'unsubscribeRate', 'unsubscribe_rate', 'Unsubscribe%'],
  leads: ['Leads', 'leads', 'LEADS', 'Lead', 'lead'],
  status: ['Status', 'status', 'STATUS', 'Campaign Status', 'campaignStatus'],
};

/**
 * Find the matching column name from available headers
 */
function findColumn(availableHeaders: string[], possibleNames: string[]): string | null {
  for (const name of possibleNames) {
    const found = availableHeaders.find(header => 
      header.trim().toLowerCase() === name.trim().toLowerCase()
    );
    if (found) return found;
  }
  return null;
}

/**
 * Create a column mapping from sheet headers
 */
export function createColumnMapping(headers: string[]): Map<string, number> {
  const mapping = new Map<string, number>();
  
  // Map each data field to its column index
  Object.entries(DEFAULT_COLUMN_MAPPINGS).forEach(([field, possibleNames]) => {
    const columnName = findColumn(headers, possibleNames);
    if (columnName) {
      const index = headers.indexOf(columnName);
      if (index !== -1) {
        mapping.set(field, index);
      }
    }
  });
  
  return mapping;
}

/**
 * Convert a row to campaign data format using flexible column mapping
 */
export function mapRowToCampaignData(row: any[], columnMapping: Map<string, number>, headers: string[]): any {
  const getValue = (field: string): any => {
    const index = columnMapping.get(field);
    if (index !== undefined && index < row.length) {
      return row[index] || '';
    }
    return '';
  };
  
  // Handle Send - remove commas and parse
  const sendValue = getValue('send').toString().replace(/,/g, '').trim();
  
  // Handle rates - ensure they have % if they're numbers
  const formatRate = (value: any): string => {
    if (!value) return '0%';
    const str = value.toString().trim();
    if (str === '' || str === '-') return '0%';
    // If it's already a percentage, return as is
    if (str.includes('%')) return str;
    // If it's a number, add %
    const num = parseFloat(str);
    if (!isNaN(num)) return num + '%';
    return '0%';
  };
  
  return {
    date: getValue('date'),
    campaignName: getValue('campaignName'),
    project: getValue('project'),
    solutionArea: getValue('solutionArea'),
    emailTool: getValue('emailTool'),
    send: parseInt(sendValue, 10) || 0,
    openRate: formatRate(getValue('openRate')),
    clickRate: formatRate(getValue('clickRate')),
    bounceRate: formatRate(getValue('bounceRate')),
    unsubscribeRate: formatRate(getValue('unsubscribeRate')),
    leads: parseInt(getValue('leads').toString(), 10) || 0,
    status: getValue('status'),
  };
}



