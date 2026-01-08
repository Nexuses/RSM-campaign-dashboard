require('dotenv').config({ path: '.env.local' });
const { google } = require('googleapis');

async function checkStatus() {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: '1-1 RSM : All Campaign!A1:Z100'
  });

  const rows = response.data.values || [];
  if (rows.length > 0) {
    const headers = rows[0];
    const statusIndex = headers.findIndex(h => h && h.toLowerCase().includes('status'));
    console.log('Status column index:', statusIndex);
    console.log('Status column name:', headers[statusIndex]);
    console.log('\nAll Status values:');
    
    const statuses = [];
    rows.slice(1).forEach((row, i) => {
      if (row[statusIndex]) {
        const status = row[statusIndex].trim();
        const statusLower = status.toLowerCase();
        const isActive = statusLower === 'active';
        statuses.push({ row: i+2, status: status, isActive: isActive });
        console.log(`Row ${i+2}: "${status}" (isActive: ${isActive})`);
      } else {
        console.log(`Row ${i+2}: [empty or null]`);
      }
    });
    
    const activeCount = statuses.filter(s => s.isActive).length;
    console.log(`\nTotal active count: ${activeCount}`);
    console.log(`Active rows:`, statuses.filter(s => s.isActive).map(s => s.row).join(', '));
  }
}

checkStatus().catch(console.error);

