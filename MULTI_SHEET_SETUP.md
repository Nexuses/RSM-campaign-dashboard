# Multi-Sheet Configuration Guide

Your Google Sheet has 7 different subsheets, and different dashboard components need data from different sheets. This guide shows you how to configure which sheet provides which data.

## Quick Setup

### Step 1: Identify Your Sheet Names

Open your Google Sheet and note the exact names of all 7 tabs at the bottom. For example:
- "Campaigns"
- "Pipeline"
- "Leads"
- "Prospects"
- "Content"
- "Analytics"
- "Other"

### Step 2: Update Your `.env.local` File

Add the sheet names to your `.env.local` file:

```env
# Your existing credentials
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-email@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=your-sheet-id-here

# Sheet Configuration - Map your actual sheet names here

# Campaign Data - Can be single sheet OR multiple sheets (comma-separated)
# Single sheet:
GOOGLE_SHEET_CAMPAIGNS=Campaigns

# Multiple sheets (if campaign data is in 5 different sheets):
# GOOGLE_SHEET_CAMPAIGNS=Campaigns Q1,Campaigns Q2,Campaigns Q3,Campaigns Q4,Campaigns Other

GOOGLE_SHEET_PIPELINE=Pipeline            # Pipeline data (PipelineStatus component)
GOOGLE_SHEET_LEADS=Leads                  # Leads data (optional)
GOOGLE_SHEET_PROSPECTS=Prospects          # Prospects data (optional)
GOOGLE_SHEET_CONTENT=Content              # Content data (optional)
GOOGLE_SHEET_ANALYTICS=Analytics          # Analytics data (optional)
GOOGLE_SHEET_OTHER=Other                  # Other data (optional)
```

**Important:** 
- Replace the values (e.g., "Campaigns", "Pipeline") with your actual sheet names
- Sheet names are case-sensitive
- If a sheet name has spaces, include them exactly as they appear

## Component-to-Sheet Mapping

### Default Mappings

| Component | Sheet Type | Environment Variable |
|-----------|------------|---------------------|
| StatsCards | campaignData | `GOOGLE_SHEET_CAMPAIGNS` |
| RawDataTable | campaignData | `GOOGLE_SHEET_CAMPAIGNS` |
| OpenRateChart | campaignData | `GOOGLE_SHEET_CAMPAIGNS` |
| SolutionsDistributionChart | campaignData | `GOOGLE_SHEET_CAMPAIGNS` |
| CampaignPerformanceChart | campaignData | `GOOGLE_SHEET_CAMPAIGNS` |
| ActiveCampaignsChart | campaignData | `GOOGLE_SHEET_CAMPAIGNS` |
| PipelineStatus | pipeline | `GOOGLE_SHEET_PIPELINE` |

### How It Works

1. **Campaign Data Sheet(s)** (`GOOGLE_SHEET_CAMPAIGNS`):
   - Used by most dashboard components
   - **Can be a single sheet OR multiple sheets (comma-separated)**
   - If multiple sheets: Data from all sheets will be combined/merged
   - Should contain: Date, Campaign Name, Project, Solution Area, Email Tool, Send, Open Rate, Click Rate, Bounce Rate, Unsubscribe Rate, Leads
   - **Example (5 sheets):** `GOOGLE_SHEET_CAMPAIGNS=Sheet1,Sheet2,Sheet3,Sheet4,Sheet5`
   - See `MULTIPLE_CAMPAIGN_SHEETS.md` for detailed instructions

2. **Pipeline Sheet** (`GOOGLE_SHEET_PIPELINE`):
   - Used by the PipelineStatus component
   - Can have any structure - the system will auto-detect headers

3. **Other Sheets** (optional):
   - Can be configured for future use
   - Currently fallback to campaignData if not specified

## Example Configuration

If your Google Sheet has these tabs:
- "Campaign Data"
- "Sales Pipeline"
- "Lead Tracking"
- "Prospect List"
- "Content Library"
- "Analytics"
- "Misc"

Your `.env.local` would be:

```env
GOOGLE_SHEET_CAMPAIGNS=Campaign Data
GOOGLE_SHEET_PIPELINE=Sales Pipeline
GOOGLE_SHEET_LEADS=Lead Tracking
GOOGLE_SHEET_PROSPECTS=Prospect List
GOOGLE_SHEET_CONTENT=Content Library
GOOGLE_SHEET_ANALYTICS=Analytics
GOOGLE_SHEET_OTHER=Misc
```

## Testing Your Configuration

1. **Restart your server** after updating `.env.local`
2. **Test each endpoint**:
   - Campaign data: `http://localhost:3000/api/sheets?sheet=campaignData`
   - Pipeline data: `http://localhost:3000/api/sheets/pipeline`
3. **Check the dashboard** - each component should load data from its assigned sheet

## Troubleshooting

### Error: "Sheet not found"

- Check that your sheet names match exactly (case-sensitive)
- Verify the sheet names in your Google Sheet tabs
- Make sure there are no extra spaces

### Wrong data showing

- Verify which sheet each component is using
- Check the `sheetType` parameter in the component's `useSheetsData` hook
- Review the component code to see which sheet type it requests

### Auto-detection

If you don't specify a sheet name, the system will:
1. Try to use the sheet name from `GOOGLE_SHEET_RANGE` (if set)
2. Fall back to the first sheet in your spreadsheet
3. Show a warning in the console if the specified sheet doesn't exist

## Advanced: Custom Sheet Mapping

If you need to change which component uses which sheet, you can:

1. **Update the component** to use a different sheet type:
   ```tsx
   const { data } = useSheetsData({ sheetType: 'pipeline' });
   ```

2. **Or create a custom API endpoint** for specific data needs

## Need Help?

- Check `TROUBLESHOOTING.md` for common issues
- Review `GOOGLE_SHEETS_SETUP.md` for authentication setup
- Check browser console and server logs for detailed error messages


