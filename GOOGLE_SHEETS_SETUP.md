# Google Sheets Integration Setup Guide

This guide will help you connect your dashboard to Google Sheets for live data updates.

## Prerequisites

- A Google account
- Access to Google Cloud Console
- A Google Sheet with your campaign data

## Setup Methods

### Method 1: Service Account (Recommended)

This method is more secure and works with private Google Sheets.

#### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter a project name (e.g., "RSM Dashboard")
4. Click "Create"

#### Step 2: Enable Google Sheets API

1. In your project, go to "APIs & Services" → "Library"
2. Search for "Google Sheets API"
3. Click on it and press "Enable"

#### Step 3: Create a Service Account

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "Service Account"
3. Enter a name (e.g., "dashboard-service")
4. Click "Create and Continue"
5. Skip the optional steps and click "Done"

#### Step 4: Create and Download Key

1. Click on the service account you just created
2. Go to the "Keys" tab
3. Click "Add Key" → "Create new key"
4. Choose "JSON" format
5. Click "Create" - this will download a JSON file

#### Step 5: Share Your Google Sheet

1. Open your Google Sheet
2. Click the "Share" button
3. Add the service account email (found in the JSON file as `client_email`)
4. Give it "Viewer" permissions
5. Click "Send"

#### Step 6: Configure Environment Variables

1. Open the downloaded JSON file
2. Copy the `client_email` value
3. Copy the `private_key` value (keep the entire string including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`)
4. Create a `.env.local` file in your project root
5. Add the following:

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-client-email-here
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=your-spreadsheet-id-here
GOOGLE_SHEET_RANGE=Sheet1!A1:Z1000
```

**Important:** 
- The `GOOGLE_PRIVATE_KEY` must be wrapped in quotes
- Replace `\n` with actual newlines in the private key, or use the format shown above
- The spreadsheet ID is in your Google Sheet URL: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`
- **Sheet Name**: The `GOOGLE_SHEET_RANGE` should match your actual sheet name. If your sheet is not named "Sheet1", you need to specify it:
  - Find your sheet name: Look at the bottom tabs in your Google Sheet (e.g., "Sheet1", "Data", "Campaigns", etc.)
  - Format: `"SheetName!A1:Z1000"` (e.g., `"Data!A1:Z1000"` or `"Campaigns!A1:Z1000"`)
  - If you don't specify `GOOGLE_SHEET_RANGE`, the system will try to auto-detect the first sheet

### Method 2: API Key (Simpler, Public Sheets Only)

This method only works if your Google Sheet is publicly accessible.

#### Step 1: Get an API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Go to "APIs & Services" → "Credentials"
4. Click "Create Credentials" → "API Key"
5. Copy the API key

#### Step 2: Make Your Sheet Public (Optional)

1. Open your Google Sheet
2. Click "Share" → "Change to anyone with the link"
3. Set permission to "Viewer"

#### Step 3: Configure Environment Variables

Create a `.env.local` file:

```env
GOOGLE_API_KEY=your-api-key-here
GOOGLE_SHEET_ID=your-spreadsheet-id-here
GOOGLE_SHEET_RANGE=Sheet1!A1:Z1000
```

**Note:** If your sheet has a different name than "Sheet1", update `GOOGLE_SHEET_RANGE` to match your sheet name (e.g., `"Data!A1:Z1000"`).

## Google Sheet Format

Your Google Sheet should have the following columns (in the first row):

- `date` or `Date`
- `campaignName` or `Campaign Name` or `campaign_name`
- `project` or `Project`
- `solutionArea` or `Solution Area` or `solution_area`
- `emailTool` or `Email Tool` or `email_tool`
- `send` or `Send` or `sent`
- `openRate` or `Open Rate` or `open_rate`
- `clickRate` or `Click Rate` or `click_rate`
- `bounceRate` or `Bounce Rate` or `bounce_rate`
- `unsubscribeRate` or `Unsubscribe Rate` or `unsubscribe_rate`
- `leads` or `Leads`

### Example Sheet Structure

| Date | Campaign Name | Project | Solution Area | Email Tool | Send | Open Rate | Click Rate | Bounce Rate | Unsubscribe Rate | Leads |
|------|---------------|---------|---------------|------------|------|-----------|------------|-------------|------------------|-------|
| 12/03/2025 | RSM SAUDI ESG | ESG | ESG General | Mailbluster | 1035 | 28.50% | 23.00% | 34.63% | 0.00% | 0 |

## Testing the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open your dashboard in the browser

3. The dashboard will automatically fetch data from Google Sheets every 30 seconds

4. You can also click the "Refresh" button to manually update the data

## Troubleshooting

### Error: "Google Sheets credentials not configured"

- Make sure your `.env.local` file exists in the project root
- Verify all required environment variables are set
- Restart your development server after adding environment variables

### Error: "Failed to fetch data from Google Sheets"

- Check that your Google Sheet ID is correct
- Verify the service account has access to the sheet (Method 1)
- If using API Key, ensure the sheet is public (Method 2)
- Check the Google Sheet range is correct (default: `Sheet1!A1:Z1000`)

### Data not updating

- The dashboard polls for updates every 30 seconds
- Click the "Refresh" button to manually update
- Check the browser console for any errors
- Verify your Google Sheet has data in the specified range

## Security Notes

- Never commit your `.env.local` file to version control
- The `.env.local` file is already in `.gitignore`
- For production, use environment variables provided by your hosting platform
- Service Account method is more secure than API Key method

## Support

If you encounter issues, check:
1. Google Cloud Console for API quota limits
2. Browser console for error messages
3. Server logs for detailed error information


