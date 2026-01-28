# Troubleshooting Google Sheets Integration

## Common Errors and Solutions

### Error: "Failed to fetch data"

This error typically occurs when:

1. **Google Sheets credentials are not configured**
   - Solution: Create a `.env.local` file in your project root
   - Add your Google Sheets credentials (see `GOOGLE_SHEETS_SETUP.md`)
   - Restart your development server after adding environment variables

2. **Missing GOOGLE_SHEET_ID**
   - Solution: Add `GOOGLE_SHEET_ID=your-sheet-id` to your `.env.local` file
   - Find your sheet ID in the Google Sheet URL: `https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit`

3. **Service Account doesn't have access**
   - Solution: Share your Google Sheet with the service account email
   - The service account email is in your downloaded JSON key file (field: `client_email`)
   - Give it "Viewer" permissions

4. **API Key method with private sheet**
   - Solution: Either make your sheet public (Share → Anyone with link) or use Service Account method

### Error: "Google Sheets credentials not configured"

**Solution:**
1. Choose an authentication method:
   - **Service Account** (recommended): More secure, works with private sheets
   - **API Key**: Simpler, but sheet must be public

2. For Service Account:
   ```env
   GOOGLE_SERVICE_ACCOUNT_EMAIL=your-email@project.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   GOOGLE_SHEET_ID=your-sheet-id
   ```

3. For API Key:
   ```env
   GOOGLE_API_KEY=your-api-key
   GOOGLE_SHEET_ID=your-sheet-id
   ```

### Error: "Permission denied" or "Access denied"

**Solution:**
1. If using Service Account:
   - Open your Google Sheet
   - Click "Share" button
   - Add the service account email (from your JSON key file)
   - Give it "Viewer" permissions
   - Click "Send"

2. If using API Key:
   - Make sure your sheet is public
   - Go to Share → Change to "Anyone with the link" → Viewer

### Error: "Google Sheet not found" or "404"

**Solution:**
- Check that your `GOOGLE_SHEET_ID` is correct
- The ID is in your Google Sheet URL: `https://docs.google.com/spreadsheets/d/YOUR_ID_HERE/edit`
- Make sure there are no extra spaces or characters

### Data not updating

**Possible causes:**
1. **Polling interval**: Data updates every 30 seconds automatically
2. **Manual refresh**: Click the "Refresh" button on any component
3. **Check browser console**: Look for any error messages
4. **Check server logs**: Look for API errors in your terminal

### Empty data or "No data found"

**Solution:**
1. Check your Google Sheet has data in the specified range
2. Default range is `Sheet1!A1:Z1000`
3. Make sure your first row contains headers
4. Verify the data is in the correct format (see `GOOGLE_SHEETS_SETUP.md`)

### Environment variables not loading

**Solution:**
1. Make sure the file is named `.env.local` (not `.env`)
2. File should be in the project root directory
3. Restart your development server after adding/changing variables
4. In Next.js, environment variables must start with `NEXT_PUBLIC_` to be available in the browser (but ours are server-side only, so this doesn't apply)

### Still having issues?

1. **Check the browser console** for detailed error messages
2. **Check server terminal** for API errors
3. **Verify your setup**:
   - Google Cloud project created
   - Google Sheets API enabled
   - Credentials configured correctly
   - Sheet shared with service account (if using service account)
4. **Test the API directly**: Visit `http://localhost:3000/api/sheets` in your browser to see the raw response

### Testing Your Setup

1. **Test API endpoint directly:**
   ```
   http://localhost:3000/api/sheets
   ```
   This will show you the exact error message from the server

2. **Check environment variables are loaded:**
   - Add a console.log in your API route (temporarily) to verify env vars are loaded
   - Or check the error message - it will tell you what's missing

3. **Verify Google Sheet format:**
   - First row should be headers
   - Data should start from row 2
   - Headers should match expected column names (see `GOOGLE_SHEETS_SETUP.md`)


