# Multi-Sheet Dashboard Setup Summary

## Overview

Your dashboard is now configured to fetch data from **7 different Google Sheet tabs**. Each component can pull data from its designated sheet.

## Quick Start

### 1. Update `.env.local` File

Add your sheet names to the `.env.local` file in the project root:

```env
# Authentication (you already have these)
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-email@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=your-sheet-id-here

# Sheet Configuration - Replace with your actual sheet names

# Campaign Data - Can be single sheet OR multiple sheets (comma-separated)
# Single sheet:
GOOGLE_SHEET_CAMPAIGNS=YourCampaignSheetName

# Multiple sheets (combines data from all):
# GOOGLE_SHEET_CAMPAIGNS=Sheet1,Sheet2,Sheet3,Sheet4,Sheet5

# Pipeline data (single sheet)
GOOGLE_SHEET_PIPELINE=YourPipelineSheetName

# Optional sheets
GOOGLE_SHEET_LEADS=YourLeadsSheetName        # Optional
GOOGLE_SHEET_PROSPECTS=YourProspectsSheetName # Optional
GOOGLE_SHEET_CONTENT=YourContentSheetName     # Optional
GOOGLE_SHEET_ANALYTICS=YourAnalyticsSheetName # Optional
GOOGLE_SHEET_OTHER=YourOtherSheetName         # Optional
```

**For Multiple Campaign Sheets:** If your campaign data is in 5 different sheets, list them comma-separated:
```env
GOOGLE_SHEET_CAMPAIGNS=Campaigns Q1,Campaigns Q2,Campaigns Q3,Campaigns Q4,Campaigns Other
```
See `MULTIPLE_CAMPAIGN_SHEETS.md` for detailed instructions.

### 2. Restart Server

```bash
npm run dev
```

## Component-to-Sheet Mapping

| Component | Data Source | Sheet Config |
|-----------|-------------|--------------|
| **StatsCards** | Campaign data | `GOOGLE_SHEET_CAMPAIGNS` |
| **RawDataTable** | Campaign data | `GOOGLE_SHEET_CAMPAIGNS` |
| **OpenRateChart** | Campaign data | `GOOGLE_SHEET_CAMPAIGNS` |
| **SolutionsDistributionChart** | Campaign data | `GOOGLE_SHEET_CAMPAIGNS` |
| **CampaignPerformanceChart** | Campaign data | `GOOGLE_SHEET_CAMPAIGNS` |
| **ActiveCampaignsChart** | Campaign data | `GOOGLE_SHEET_CAMPAIGNS` |
| **PipelineStatus** | Pipeline data | `GOOGLE_SHEET_PIPELINE` |

## Data Format Requirements

### Campaign Data Sheet(s) (`GOOGLE_SHEET_CAMPAIGNS`)

**If using multiple sheets:** All sheets must have the same structure.

Required columns (first row = headers):
- `Date` or `date`
- `Campaign Name` or `campaignName`
- `Project` or `project`
- `Solution Area` or `solutionArea`
- `Email Tool` or `emailTool`
- `Send` or `send` or `sent`
- `Open Rate` or `openRate`
- `Click Rate` or `clickRate`
- `Bounce Rate` or `bounceRate`
- `Unsubscribe Rate` or `unsubscribeRate`
- `Leads` or `leads`

### Pipeline Data Sheet (`GOOGLE_SHEET_PIPELINE`)

Flexible structure - the system will auto-detect headers. Recommended columns:
- `Status` or `status` (e.g., "Scheduled", "Hot", "Meeting Done")
- `Stage` or `stage`
- `Priority` or `priority`
- Any other columns you need

The component will automatically count:
- **Total Leads**: Total number of rows
- **Scheduled**: Rows with "scheduled" in status/stage
- **Hot Leads**: Rows with "hot" in status/stage/priority
- **Meeting Done**: Rows with "meeting" or "done" in status/stage

## API Endpoints

- **Campaign Data**: `GET /api/sheets?sheet=campaignData`
- **Pipeline Data**: `GET /api/sheets/pipeline`
- **Custom Sheet**: `GET /api/sheets?sheet=leads` (uses `GOOGLE_SHEET_LEADS`)

## Features

✅ **Automatic Updates**: All components refresh every 30 seconds  
✅ **Manual Refresh**: Click refresh button on any component  
✅ **Error Handling**: Clear error messages if sheets aren't configured  
✅ **Auto-Detection**: Falls back to first sheet if specified sheet not found  
✅ **Flexible Mapping**: Easy to change which component uses which sheet  

## Testing

1. **Test Campaign Data**: Visit `http://localhost:3000/api/sheets?sheet=campaignData`
2. **Test Pipeline Data**: Visit `http://localhost:3000/api/sheets/pipeline`
3. **View Dashboard**: Open `http://localhost:3000` and check all components

## Troubleshooting

- **"Sheet not found"**: Check sheet names match exactly (case-sensitive)
- **Wrong data**: Verify `GOOGLE_SHEET_CAMPAIGNS` and `GOOGLE_SHEET_PIPELINE` are set correctly
- **No data showing**: Check that your sheets have data and headers in the first row

## Next Steps

1. ✅ Set up your `.env.local` with sheet names
2. ✅ Restart your server
3. ✅ Verify data is loading in the dashboard
4. ✅ Customize sheet mappings if needed (see `MULTI_SHEET_SETUP.md`)

For detailed instructions, see:
- `MULTI_SHEET_SETUP.md` - Complete multi-sheet configuration guide
- `GOOGLE_SHEETS_SETUP.md` - Authentication setup
- `TROUBLESHOOTING.md` - Common issues and solutions


