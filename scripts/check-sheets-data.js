// Script to check which sheets have data and their column structures
// Run with: node scripts/check-sheets-data.js

require('dotenv').config({ path: '.env.local' });
const { google } = require('googleapis');

async function checkSheetsData() {
  console.log('🔍 Checking Google Sheets for data...\n');
  
  try {
    // Initialize auth
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    // Get all sheet names
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetList = spreadsheet.data.sheets || [];
    
    console.log(`Found ${sheetList.length} sheets:\n`);
    
    for (const sheet of sheetList) {
      const sheetName = sheet.properties?.title || 'Unknown';
      const sheetId = sheet.properties?.sheetId;
      
      try {
        // Get a sample of data (first 5 rows)
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: `${sheetName}!A1:Z5`,
        });
        
        const values = response.data.values || [];
        
        if (values.length === 0) {
          console.log(`❌ ${sheetName}: No data found`);
        } else {
          const headers = values[0] || [];
          const dataRows = values.length - 1;
          
          console.log(`✅ ${sheetName}:`);
          console.log(`   - Headers (${headers.length} columns): ${headers.slice(0, 10).join(', ')}${headers.length > 10 ? '...' : ''}`);
          console.log(`   - Data rows: ${dataRows}`);
          
          // Check for key columns
          const headerLower = headers.map(h => h.toLowerCase());
          const hasDate = headerLower.some(h => h.includes('date'));
          const hasName = headerLower.some(h => h.includes('name') || h.includes('campaign'));
          const hasSend = headerLower.some(h => h.includes('send') || h.includes('sent'));
          const hasOpen = headerLower.some(h => h.includes('open'));
          const hasClick = headerLower.some(h => h.includes('click'));
          
          console.log(`   - Key columns: Date: ${hasDate ? '✓' : '✗'}, Name: ${hasName ? '✓' : '✗'}, Send: ${hasSend ? '✓' : '✗'}, Open: ${hasOpen ? '✓' : '✗'}, Click: ${hasClick ? '✓' : '✗'}`);
        }
      } catch (error) {
        console.log(`❌ ${sheetName}: Error - ${error.message}`);
      }
      
      console.log('');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkSheetsData();


