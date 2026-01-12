# Fix: "Unable to parse range" Error

## Problem

If you see the error: **"Unable to parse range: Sheet1!A1:Z1000"**, it means your Google Sheet doesn't have a sheet named "Sheet1".

## Solution

### Step 1: Find Your Sheet Name

1. Open your Google Sheet
2. Look at the **bottom tabs** - you'll see the sheet names (e.g., "Sheet1", "Data", "Campaigns", "Main", etc.)
3. Note the exact name of the sheet that contains your data

### Step 2: Update Your .env.local File

Add or update the `GOOGLE_SHEET_RANGE` variable in your `.env.local` file:

```env
GOOGLE_SHEET_RANGE="YourSheetName!A1:Z1000"
```

**Examples:**
- If your sheet is named "Data": `GOOGLE_SHEET_RANGE="Data!A1:Z1000"`
- If your sheet is named "Campaigns": `GOOGLE_SHEET_RANGE="Campaigns!A1:Z1000"`
- If your sheet is named "Main Data": `GOOGLE_SHEET_RANGE="Main Data!A1:Z1000"`

**Important:** 
- The sheet name is case-sensitive
- If your sheet name has spaces, keep them in the range
- Wrap the entire range in quotes if it contains spaces

### Step 3: Restart Your Server

After updating `.env.local`, restart your development server:

1. Stop the server (Ctrl+C)
2. Run `npm run dev` again

### Alternative: Auto-Detection

If you don't set `GOOGLE_SHEET_RANGE`, the system will try to automatically detect and use the first sheet in your spreadsheet. However, it's better to specify it explicitly to avoid confusion.

## Quick Test

After updating, test the connection:
- Visit: `http://localhost:3000/api/sheets`
- You should see your data or a more helpful error message

## Still Having Issues?

If the error persists:
1. Double-check the sheet name spelling (case-sensitive)
2. Make sure there are no extra spaces
3. Check the server console for more detailed error messages
4. The error message will now show you the available sheet names if it can detect them


