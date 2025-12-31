# Environment Variables Setup

## Important: File Location

Your `.env.local` file **MUST** be in the **project root** (same folder as `package.json`), NOT in the `app` folder.

```
RSM main project/
├── .env.local          ← HERE (project root)
├── package.json
├── app/
│   └── .env.local      ← NOT HERE (wrong location)
└── ...
```

## Steps to Fix

1. **Move your `.env.local` file** from `app/.env.local` to the project root
2. **Or create a new one** in the project root with your credentials

## Required Variables

Your `.env.local` file should contain:

### For Service Account (Recommended):
```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-email@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYourKeyHere\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=your-sheet-id-here
```

### For API Key:
```env
GOOGLE_API_KEY=your-api-key-here
GOOGLE_SHEET_ID=your-sheet-id-here
```

## After Moving/Creating the File

1. **Restart your development server** (stop with Ctrl+C, then run `npm run dev` again)
2. Next.js only reads `.env.local` on startup
3. Test the connection at `http://localhost:3000/api/sheets`

## Verify File Location

The file should be at:
```
c:\Projects\RSM main project\.env.local
```

Not at:
```
c:\Projects\RSM main project\app\.env.local
```


