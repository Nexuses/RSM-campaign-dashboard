# Multiple Campaign Sheets Configuration

If your campaign data is spread across **5 different subsheets** (or any number of sheets), this guide shows you how to combine them into a single unified dataset.

## Quick Setup

### Step 1: Identify Your Campaign Sheet Names

Open your Google Sheet and identify all the sheets that contain campaign data. For example:
- "Campaigns Q1"
- "Campaigns Q2"
- "Campaigns Q3"
- "Campaigns Q4"
- "Campaigns Other"

### Step 2: Update Your `.env.local` File

Add all your campaign sheet names, **comma-separated**, to the `GOOGLE_SHEET_CAMPAIGNS` variable:

```env
# Your existing credentials
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-email@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=your-sheet-id-here

# Multiple Campaign Sheets - Comma-separated
GOOGLE_SHEET_CAMPAIGNS=Campaigns Q1,Campaigns Q2,Campaigns Q3,Campaigns Q4,Campaigns Other

# Pipeline sheet (single sheet)
GOOGLE_SHEET_PIPELINE=Pipeline
```

**Important:**
- Separate sheet names with commas (no spaces after commas, or spaces will be trimmed)
- Sheet names are case-sensitive
- If a sheet name has spaces, include them exactly as they appear
- All sheets must have the same column structure (headers in first row)

## How It Works

1. **Data Fetching**: The system fetches data from all specified campaign sheets
2. **Header Handling**: Uses headers from the first sheet, skips headers from subsequent sheets
3. **Data Merging**: Combines all rows from all sheets into a single dataset
4. **Error Handling**: If one sheet fails, others will still load (with a warning)

## Example Configurations

### Example 1: 5 Campaign Sheets

```env
GOOGLE_SHEET_CAMPAIGNS=Jan Campaigns,Feb Campaigns,Mar Campaigns,Apr Campaigns,May Campaigns
```

### Example 2: 3 Campaign Sheets with Different Names

```env
GOOGLE_SHEET_CAMPAIGNS=Email Campaigns,Social Campaigns,Paid Ads
```

### Example 3: Single Sheet (Still Works)

```env
GOOGLE_SHEET_CAMPAIGNS=All Campaigns
```

## Data Format Requirements

**All campaign sheets must have the same structure:**

First row (headers) should include:
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

**Important:** 
- All sheets must have headers in the first row
- Column order doesn't matter (system auto-detects by header name)
- Missing columns will be filled with empty values

## Testing

1. **Restart your server** after updating `.env.local`
2. **Test the API**: Visit `http://localhost:3000/api/sheets?sheet=campaignData`
3. **Check the console**: You should see logs like:
   ```
   Fetching campaign data from 5 sheets: Campaigns Q1, Campaigns Q2, Campaigns Q3, Campaigns Q4, Campaigns Other
   ✓ Fetched 50 rows from sheet "Campaigns Q1"
   ✓ Fetched 45 rows from sheet "Campaigns Q2"
   ✓ Fetched 60 rows from sheet "Campaigns Q3"
   ✓ Fetched 40 rows from sheet "Campaigns Q4"
   ✓ Fetched 30 rows from sheet "Campaigns Other"
   ```
4. **View dashboard**: All components should show combined data from all 5 sheets

## Troubleshooting

### Error: "Failed to fetch data from all sheets"

- Check that all sheet names are correct (case-sensitive)
- Verify all sheets exist in your Google Sheet
- Make sure your service account has access to all sheets
- Check server console for specific error messages

### Wrong data or missing rows

- Verify all sheets have the same column structure
- Check that headers match across all sheets
- Ensure data starts from row 2 (row 1 = headers)

### Some sheets loading, others not

- The system will continue loading other sheets even if one fails
- Check console warnings for which sheets failed
- Verify sheet names and permissions for failed sheets

### Duplicate data

- If you see duplicates, check if the same data exists in multiple sheets
- The system combines all data - duplicates are expected if data is repeated across sheets

## Advanced: Custom Range

You can specify a custom range for all sheets:

```env
GOOGLE_SHEET_CAMPAIGNS=Sheet1,Sheet2,Sheet3
GOOGLE_SHEET_RANGE=A1:M500  # Will apply to all sheets
```

Or specify different ranges per sheet (requires API call with range parameter).

## Performance

- Fetching from multiple sheets may take slightly longer
- Data is fetched in parallel where possible
- Caching helps with subsequent requests
- Consider limiting the number of sheets if performance is an issue

## Best Practices

1. **Consistent Structure**: Keep all campaign sheets with the same column structure
2. **Naming Convention**: Use consistent naming (e.g., "Campaigns Q1", "Campaigns Q2")
3. **Data Organization**: Organize data logically (by time period, campaign type, etc.)
4. **Regular Updates**: Keep all sheets updated for accurate combined data

## Need Help?

- Check `TROUBLESHOOTING.md` for common issues
- Review server console logs for detailed error messages
- Test individual sheets first: `http://localhost:3000/api/sheets?sheet=campaignData&range=Sheet1!A1:Z100`


