# Quick Start - Google Sheets Integration

## What Was Added

✅ Google Sheets API integration
✅ Automatic data polling (updates every 30 seconds)
✅ Live dashboard updates when Google Sheet changes
✅ All components now use live data from Google Sheets

## Quick Setup (3 Steps)

### 1. Get Your Google Sheet ID

From your Google Sheet URL:
```
https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID_HERE/edit
```

### 2. Set Up Authentication

**Option A: Service Account (Recommended)**
- Follow the detailed guide in `GOOGLE_SHEETS_SETUP.md`
- Create a service account in Google Cloud Console
- Share your sheet with the service account email

**Option B: API Key (Quick, but sheet must be public)**
- Get API key from Google Cloud Console
- Make your sheet public (Share → Anyone with link)

### 3. Create `.env.local` File

Create a file named `.env.local` in the project root:

```env
# For Service Account:
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-email@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=your-sheet-id-here

# OR for API Key:
# GOOGLE_API_KEY=your-api-key-here
# GOOGLE_SHEET_ID=your-sheet-id-here
```

### 4. Start the Server

```bash
npm run dev
```

That's it! Your dashboard will now show live data from Google Sheets.

## Features

- **Auto-refresh**: Data updates every 30 seconds
- **Manual refresh**: Click the "Refresh" button on any component
- **Error handling**: Shows error messages if connection fails
- **Fallback data**: Uses mock data if Google Sheets is not configured

## Sheet Format

Your Google Sheet should have these columns (first row = headers):
- Date
- Campaign Name
- Project
- Solution Area
- Email Tool
- Send
- Open Rate
- Click Rate
- Bounce Rate
- Unsubscribe Rate
- Leads

See `GOOGLE_SHEETS_SETUP.md` for detailed format examples.


