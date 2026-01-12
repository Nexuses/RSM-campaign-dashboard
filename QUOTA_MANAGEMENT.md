# Google Sheets API Quota Management

## Issue: Quota Exceeded Error

If you see the error: **"Quota exceeded for quota metric 'Read requests'"**, this means you're making too many API requests too quickly.

## What Changed

### 1. Increased Polling Interval
- **Before**: 30 seconds (2 requests per minute per component)
- **After**: 2 minutes (0.5 requests per minute per component)
- **Result**: 4x reduction in API calls

### 2. Better Error Handling
- Quota errors are now detected and displayed with helpful messages
- Existing data is preserved when quota errors occur
- Auto-polling continues after quota resets

### 3. All Components Updated
All dashboard components now use the default 2-minute polling interval to reduce API calls.

## Google Sheets API Limits

- **Free Tier**: 60 requests per minute per user
- **With 4 sheets**: Each fetch = 4 API calls (one per sheet)
- **Multiple components**: Each component makes separate requests

### Example Calculation
- 6 components × 4 sheets = 24 API calls per fetch
- At 30-second interval: 48 calls per minute ❌ (exceeds limit)
- At 2-minute interval: 12 calls per minute ✅ (within limit)

## Recommendations

### Option 1: Use Default Settings (Recommended)
The system now uses 2-minute intervals by default. This should keep you well within quota limits.

### Option 2: Increase Interval Further
If you still hit quota limits, you can increase the interval:

```tsx
// In any component
const { data } = useSheetsData({ pollingInterval: 300000 }) // 5 minutes
```

### Option 3: Disable Auto-Polling
For manual refresh only:

```tsx
const { data, refetch } = useSheetsData({ autoPoll: false })
// Then call refetch() manually when needed
```

### Option 4: Request Quota Increase
If you need more frequent updates:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "APIs & Services" → "Quotas"
3. Find "Google Sheets API" → "Read requests per minute per user"
4. Request a quota increase

## Current Configuration

All components are configured with:
- **Polling Interval**: 2 minutes (120,000ms)
- **Auto-polling**: Enabled
- **Error Handling**: Quota errors are handled gracefully

## Manual Refresh

Users can still manually refresh data using the "Refresh" button on components. This bypasses the polling interval.

## Monitoring

Watch the browser console for:
- Quota error messages
- API call frequency
- Successful data fetches

If you continue to see quota errors, consider:
1. Further increasing the polling interval
2. Reducing the number of sheets being fetched
3. Implementing request caching
4. Requesting a quota increase from Google


