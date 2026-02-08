# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Homepage   │  │  Assessment  │  │   Results    │          │
│  │  (page.tsx)  │→│ (test/page)  │→│(results/page)│          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└────────────┬────────────────┬────────────────┬─────────────────┘
             │                │                │
             │                │                │
             ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NEXT.JS API ROUTES                           │
│  ┌──────────────────────┐  ┌──────────────────────┐            │
│  │   /api/user          │  │  /api/send-email     │            │
│  │  - POST: Check user  │  │  - POST: Send email  │            │
│  │  - GET: Get user     │  │                      │            │
│  │  - PATCH: Update     │  │                      │            │
│  └──────────┬───────────┘  └──────────┬───────────┘            │
└─────────────┼──────────────────────────┼──────────────────────┘
              │                          │
              │                          │
              ▼                          ▼
┌─────────────────────────┐  ┌─────────────────────────┐
│   lib/storage.ts        │  │    lib/email.ts         │
│  ┌──────────────────┐   │  │  ┌──────────────────┐   │
│  │ getUserByEmail() │   │  │  │ sendResultEmail()│   │
│  │ saveUser()       │   │  │  └──────────────────┘   │
│  │ getAllUsers()    │   │  │                         │
│  │ deleteUser()     │   │  │  Uses: Nodemailer       │
│  └────────┬─────────┘   │  └─────────────────────────┘
└───────────┼─────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      VERCEL KV (REDIS)                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Keys:                                                    │   │
│  │  - user:email@example.com → UserData object              │   │
│  │  - users:all → Set of all user emails                    │   │
│  │                                                           │   │
│  │  Data Structure:                                          │   │
│  │  {                                                        │   │
│  │    email: string,                                         │   │
│  │    responses: { cog1: 4, cog2: 3, ... },                 │   │
│  │    isCompleted: boolean,                                  │   │
│  │    timestamp: string,                                     │   │
│  │    scores: { cognitive: 75, behavior: 80, ... }           │   │
│  │  }                                                        │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### New User Flow
```
1. User enters email
   ↓
2. POST /api/user → Check if exists in KV
   ↓
3. Not found → Create new record
   ↓
4. Save to KV: user:{email}
   ↓
5. Show assessment questions
   ↓
6. User answers questions
   ↓
7. PATCH /api/user → Auto-save progress
   ↓
8. Update KV after each question
   ↓
9. User completes assessment
   ↓
10. PATCH /api/user (isCompleted: true)
    ↓
11. Calculate scores
    ↓
12. Save final data to KV
    ↓
13. POST /api/send-email
    ↓
14. Send email with results
    ↓
15. Redirect to results page
```

### Returning User Flow
```
1. User enters same email
   ↓
2. POST /api/user → Check if exists in KV
   ↓
3. Found in KV
   ↓
4. Check isCompleted status
   ↓
5a. If completed:
    → Load scores from KV
    → Redirect to results page
    → Show existing results ✅
   ↓
5b. If in-progress:
    → Load responses from KV
    → Resume from last question
    → Continue assessment
```

## Storage Comparison

### ❌ Old System (File System)
```
┌─────────────────────────┐
│  Vercel Function        │
│  ┌──────────────────┐   │
│  │ Write to file    │   │
│  │ data/results.jsonl│  │
│  └──────────────────┘   │
│         ↓               │
│  ┌──────────────────┐   │
│  │ Ephemeral FS     │   │
│  │ (Lost on exit)   │   │
│  └──────────────────┘   │
└─────────────────────────┘
         ↓
    ❌ Data Lost!
```

### ✅ New System (Vercel KV)
```
┌─────────────────────────┐
│  Vercel Function        │
│  ┌──────────────────┐   │
│  │ Write to KV      │   │
│  │ via REST API     │   │
│  └──────────────────┘   │
│         ↓               │
│  ┌──────────────────┐   │
│  │ Network Request  │   │
│  └──────────────────┘   │
└─────────────────────────┘
         ↓
┌─────────────────────────┐
│  Vercel KV (Redis)      │
│  ┌──────────────────┐   │
│  │ Persistent Store │   │
│  │ (Always available)│  │
│  └──────────────────┘   │
└─────────────────────────┘
         ↓
    ✅ Data Persists!
```

## Key Components

### Frontend (Client-Side)
- **Homepage** (`app/page.tsx`) - Landing page
- **Assessment** (`app/test/page.tsx`) - Question interface
- **Results** (`app/results/page.tsx`) - Results display

### Backend (Server-Side)
- **User API** (`app/api/user/route.ts`) - User data management
- **Email API** (`app/api/send-email/route.ts`) - Email sending
- **Storage Layer** (`lib/storage.ts`) - KV abstraction
- **Email Service** (`lib/email.ts`) - Email templates
- **Engine** (`lib/psychometric-engine.ts`) - Score calculation

### Storage
- **Vercel KV** - Redis-based persistent storage
- **Keys**: `user:{email}`, `users:all`
- **Data**: JSON objects with user responses and scores

### External Services
- **SMTP Server** - Email delivery (Gmail, SendGrid, etc.)
- **Vercel KV** - Redis storage service

## Environment Variables

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=HeyAmara <noreply@heyamara.ai>

# Application
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# Vercel KV (Auto-added when connected)
KV_REST_API_URL=https://your-kv.upstash.io
KV_REST_API_TOKEN=your-token
KV_REST_API_READ_ONLY_TOKEN=your-readonly-token
```

## Security Considerations

1. **Email Validation** - Validate email format
2. **Rate Limiting** - Prevent spam (future enhancement)
3. **Data Privacy** - User data stored securely in KV
4. **HTTPS Only** - All communication encrypted
5. **Environment Variables** - Sensitive data not in code
6. **GDPR Compliance** - `deleteUser()` function available

## Performance

- **KV Latency**: ~10-50ms per operation
- **Concurrent Users**: Handles multiple users simultaneously
- **Auto-save**: Progress saved after each question
- **Caching**: Redis provides fast data retrieval

## Scalability

- **Horizontal Scaling**: Vercel functions auto-scale
- **Storage Scaling**: KV scales with usage
- **Free Tier**: 10,000 commands/day
- **Paid Tier**: Unlimited scaling available
