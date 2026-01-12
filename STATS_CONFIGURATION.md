# Stats Cards Configuration

## Overview

The Stats Cards component now fetches data from different sources based on the requirements:

## Data Sources

### 1. Total Prospects
- **Source**: Pipeline sheet
- **Calculation**: Total number of leads in the current year
- **Logic**: Counts all rows in the Pipeline sheet that have a date in the current year (or no date, which defaults to current year)

### 2. Hot Leads
- **Source**: Pipeline sheet
- **Calculation**: Number of hot leads this month
- **Logic**: 
  - Filters Pipeline data for current month
  - Looks for "hot" in Status, Priority, or Notes columns
  - Case-insensitive matching

### 3. Active Pipeline
- **Source**: Pipeline sheet
- **Calculation**: Number of active pipelines this month
- **Logic**:
  - Filters Pipeline data for current month
  - Excludes leads with status: "done", "closed", "completed", "cancelled", "lost"
  - Counts remaining active leads

### 4. Avg Open Rate
- **Source**: "1-1 RSM : All Campaign" and "RSM Stats - Drip" sheets
- **Calculation**: Average of all open rates from both sheets
- **Logic**:
  - Fetches data from both sheets
  - Extracts open rate values (handles different column names: "Open", "Open ", "openRate", etc.)
  - Calculates average of all non-zero open rates
  - Displays as percentage with 1 decimal place

## API Endpoint

New endpoint: `/api/stats`

This endpoint:
- Fetches Pipeline data in parallel with campaign data
- Calculates all 4 stats from their respective sources
- Returns combined stats object
- Handles errors gracefully

## Component Updates

The `StatsCards` component now uses:
- `useStats()` hook instead of `useSheetsData()`
- Fetches from `/api/stats` endpoint
- Displays data from multiple sources correctly

## Date Filtering

### Year Filtering (Total Prospects)
- Looks for date columns: `Month`, `month`, `Date`, `date`, `Setup Date`
- Extracts 4-digit year from date strings
- Includes rows with current year or no date

### Month Filtering (Hot Leads & Active Pipeline)
- Filters for current month and year
- Checks for:
  - Month number (1-12)
  - Year (4 digits)
  - Month name (e.g., "january", "jan")
- Case-insensitive matching

## Column Name Variations Handled

### Pipeline Sheet
- Date: `Month`, `month`, `Date`, `date`, `Setup Date`
- Status: `Status`, `status`, `stage`, `Stage`
- Priority: `Priority`, `priority`
- Notes: `Notes`, `notes`, `Note`, `note`

### Campaign Sheets (Open Rate)
- Open Rate: `Open`, `open`, `Open `, `openRate`, `Open Rate`, `open_rate`

## Error Handling

- If Pipeline sheet is empty: Returns "0" for pipeline-related stats
- If campaign sheets fail: Returns "0%" for Avg Open Rate
- Quota errors: Shows helpful message and preserves existing data
- Network errors: Displays error message but keeps last known values

## Testing

To test the stats:
1. Visit: `http://localhost:3000/api/stats`
2. Check the JSON response for all 4 stats
3. Verify calculations match your expectations
4. Check browser console for any errors

## Future Enhancements

If needed, you can:
- Adjust date filtering logic
- Add more columns to check for "hot" leads
- Modify active pipeline criteria
- Add additional campaign sheets for open rate calculation


