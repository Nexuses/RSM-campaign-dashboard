// Quick test script to verify Google Sheets connection
// Run with: node scripts/test-connection.js

require('dotenv').config({ path: '.env.local' });

async function testConnection() {
  console.log('🔍 Testing Google Sheets Connection...\n');
  
  // Check environment variables
  console.log('1. Checking environment variables:');
  const hasServiceAccount = !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const hasPrivateKey = !!process.env.GOOGLE_PRIVATE_KEY;
  const hasApiKey = !!process.env.GOOGLE_API_KEY;
  const hasSheetId = !!process.env.GOOGLE_SHEET_ID;
  
  console.log(`   ✓ GOOGLE_SERVICE_ACCOUNT_EMAIL: ${hasServiceAccount ? '✅ Set' : '❌ Missing'}`);
  console.log(`   ✓ GOOGLE_PRIVATE_KEY: ${hasPrivateKey ? '✅ Set' : '❌ Missing'}`);
  console.log(`   ✓ GOOGLE_API_KEY: ${hasApiKey ? '✅ Set' : '❌ Missing'}`);
  console.log(`   ✓ GOOGLE_SHEET_ID: ${hasSheetId ? '✅ Set' : '❌ Missing'}`);
  
  if (!hasSheetId) {
    console.log('\n❌ GOOGLE_SHEET_ID is required!');
    return;
  }
  
  if (!hasServiceAccount && !hasApiKey) {
    console.log('\n❌ Either GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_PRIVATE_KEY or GOOGLE_API_KEY is required!');
    return;
  }
  
  if (hasServiceAccount && !hasPrivateKey) {
    console.log('\n❌ GOOGLE_PRIVATE_KEY is required when using service account!');
    return;
  }
  
  console.log('\n2. Testing API connection...');
  
  try {
    const { google } = require('googleapis');
    
    let sheets;
    if (hasServiceAccount && hasPrivateKey) {
      const auth = new google.auth.JWT({
        email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
      });
      sheets = google.sheets({ version: 'v4', auth });
      console.log('   Using Service Account authentication');
    } else {
      sheets = google.sheets({ version: 'v4', auth: process.env.GOOGLE_API_KEY });
      console.log('   Using API Key authentication');
    }
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Sheet1!A1:Z10', // Test with small range
    });
    
    const values = response.data.values || [];
    console.log(`   ✅ Connection successful!`);
    console.log(`   ✅ Found ${values.length} rows in the sheet`);
    
    if (values.length > 0) {
      console.log(`   ✅ First row (headers): ${values[0].join(', ')}`);
    }
    
    console.log('\n🎉 Everything looks good! Your dashboard should work now.');
    
  } catch (error) {
    console.log('\n❌ Connection failed!');
    console.log(`   Error: ${error.message}`);
    
    if (error.code === 403) {
      console.log('\n   💡 Tip: Make sure your service account has access to the Google Sheet.');
      console.log('   Share the sheet with the service account email and give it Viewer permissions.');
    } else if (error.code === 404) {
      console.log('\n   💡 Tip: Check that your GOOGLE_SHEET_ID is correct.');
      console.log('   Find it in your Google Sheet URL: https://docs.google.com/spreadsheets/d/SHEET_ID/edit');
    } else if (error.message.includes('credentials')) {
      console.log('\n   💡 Tip: Check your credentials format in .env.local');
      console.log('   Make sure GOOGLE_PRIVATE_KEY is wrapped in quotes and includes \\n for newlines.');
    }
  }
}

testConnection();


