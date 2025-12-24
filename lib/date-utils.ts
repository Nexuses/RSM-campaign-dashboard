/**
 * Utility functions for date parsing and filtering
 */

/**
 * Parse a date string from various formats (MM/DD/YYYY, Month names, etc.)
 */
export function parseDate(dateStr: any): Date | null {
  if (!dateStr) return null;
  
  try {
    const dateStrClean = dateStr.toString().trim();
    
    // Try MM/DD/YYYY or M/D/YYYY format
    const dateParts = dateStrClean.split('/');
    if (dateParts.length === 3) {
      const month = parseInt(dateParts[0], 10) - 1;
      const day = parseInt(dateParts[1], 10);
      const year = parseInt(dateParts[2], 10);
      if (!isNaN(month) && !isNaN(day) && !isNaN(year)) {
        return new Date(year, month, day);
      }
    }
    
    // Try MM/YYYY format (for Month column that might only have month/year)
    if (dateParts.length === 2) {
      const month = parseInt(dateParts[0], 10) - 1;
      const year = parseInt(dateParts[1], 10);
      if (!isNaN(month) && !isNaN(year)) {
        // Use first day of the month
        return new Date(year, month, 1);
      }
    }
    
    // Try parsing as ISO date string or standard date string
    const parsedDate = new Date(dateStrClean);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate;
    }
    
    // Try parsing month name format (e.g., "January 2024", "Jan 2024")
    const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 
                       'july', 'august', 'september', 'october', 'november', 'december'];
    const monthAbbr = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 
                       'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const dateStrLower = dateStrClean.toLowerCase();
    
    for (let i = 0; i < monthNames.length; i++) {
      if (dateStrLower.includes(monthNames[i]) || dateStrLower.includes(monthAbbr[i])) {
        // Extract year
        const yearMatch = dateStrClean.match(/\d{4}/);
        if (yearMatch) {
          const year = parseInt(yearMatch[0], 10);
          return new Date(year, i, 1); // First day of the month
        }
      }
    }
    
    return null;
  } catch (e) {
    console.error('Error parsing date:', dateStr, e);
    return null;
  }
}

/**
 * Check if a date is within a date range
 */
export function isDateInRange(date: Date | null, start: Date | null, end: Date | null): boolean {
  if (!date || !start || !end) return false;
  
  const dateCopy = new Date(date);
  dateCopy.setHours(0, 0, 0, 0);
  
  return dateCopy >= start && dateCopy <= end;
}

/**
 * Filter data by date range
 */
export function filterByDateRange<T extends { date?: any }>(
  data: T[],
  start: Date | null,
  end: Date | null
): T[] {
  if (!start || !end) return data;
  
  return data.filter((row) => {
    const dateStr = row.date || '';
    if (!dateStr) return false;
    
    const date = parseDate(dateStr);
    if (!date || isNaN(date.getTime())) return false;
    
    return isDateInRange(date, start, end);
  });
}

/**
 * Filter data by project/solution
 */
export function filterByProject<T extends { project?: any; solutionArea?: any }>(
  data: T[],
  projectFilter: string
): T[] {
  if (projectFilter === 'all') return data;
  
  return data.filter((row) => {
    const solution = (row.project || row.solutionArea || '').toString().toLowerCase();
    
    if (projectFilter === 'ESG') {
      return solution === 'esg' || solution.startsWith('esg');
    }
    if (projectFilter === 'TA') {
      return solution === 'ta' || solution.includes('transitional');
    }
    if (projectFilter === 'VAPT') {
      return solution === 'vapt' || solution.includes('vapt');
    }
    
    return true;
  });
}


