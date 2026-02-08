# HeyAmara Psychometric Assessment Platform

A modern, intelligent psychometric assessment platform built with Next.js that analyzes talent across four critical dimensions: Cognitive, Behavior, Motivation, and Collaboration.

## ✨ Features

- **🧠 Multi-Dimensional Analysis**: Comprehensive assessment across 4 key dimensions with 12 carefully crafted questions
- **📊 Real-Time Results**: Dynamic score calculation with visual radar charts and detailed breakdowns
- **📧 Email Notifications**: Beautiful HTML email templates sent to users with their results and report link
- **💾 Data Persistence**: User progress saved in Redis with automatic resume capability - works on any platform!
- **📱 Mobile-First Design**: Fully responsive interface optimized for all devices
- **🎨 Premium UI/UX**: Modern glassmorphism design with smooth animations
- **📄 PDF Export**: Generate professional PDF reports with assessment data
- **🔗 Shareable Results**: Unique URLs for sharing assessment results
- **⚙️ JSON-Based Questions**: Easy to modify questions via `data/questions.json`
- **🎯 Dynamic Score Labels**: Contextual performance labels (Exceptional, Strong, Proficient, etc.)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm/yarn/pnpm

### Installation

1. Clone the repository
```bash
git clone https://github.com/WizardGeeky/heyamara_psychometric_platform.git
cd heyamara_psychometric_platform
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=HeyAmara Assessment <noreply@heyamara.ai>

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Redis Database - Get from Redis Cloud, Upstash, or any Redis provider
REDIS_URL=redis://default:your-password@your-redis-host:port
```

**Important**: You need a Redis database for data persistence. See [START_HERE.md](./START_HERE.md) for setup instructions.

4. Run the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📁 Project Structure

```
├── app/
│   ├── api/              # API routes
│   │   ├── user/         # User data management (Redis)
│   │   └── send-email/   # Email sending endpoint
│   ├── test/             # Assessment page
│   ├── results/          # Results display page
│   └── page.tsx          # Homepage
├── components/
│   ├── Assessment/       # Assessment UI components
│   └── Results/          # Results visualization components
├── lib/
│   ├── psychometric-engine.ts  # Core assessment logic
│   ├── storage.ts        # Redis storage layer
│   └── email.ts          # Email service
├── data/
│   └── questions.json    # Assessment questions (editable)
└── public/               # Static assets
```

## 🎯 Key Features Explained

### Dynamic Questions
Questions are loaded from `data/questions.json`, making it easy to modify or add new assessment items without code changes.

**Questions JSON Structure:**
```json
{
  "questions": [
    {
      "id": "cog1",
      "dimension": "cognitive",
      "text": "Question text...",
      "lowLabel": "Low end label",
      "highLabel": "High end label",
      "weight": 1
    }
  ]
}
```

### Email Notifications
Upon test completion, users receive a beautifully designed email with:
- ✨ Beautiful, responsive HTML design
- 📊 Score cards for all four dimensions (Cognitive, Behavior, Motivation, Collaboration)
- 🎯 Dynamic score labels (Exceptional, Strong, Proficient, etc.)
- 🔗 Direct link to full results page
- 📱 Mobile-responsive design
- 🎨 Branded with HeyAmara colors and styling

**Email Template Features:**
- Gradient header with branding
- 2x2 grid of score cards
- Responsive design (mobile-friendly)
- Professional styling with glassmorphism
- Call-to-action button
- Plain text fallback

### Score Labels
Scores are automatically labeled based on performance:
- **80%+** = Exceptional
- **70-79%** = Strong
- **60-69%** = Proficient
- **50-59%** = Moderate
- **40-49%** = Developing
- **<40%** = Emerging

**Score Label Logic:**
```typescript
function getScoreLabel(score: number): string {
    if (score >= 80) return 'Exceptional';
    if (score >= 70) return 'Strong';
    if (score >= 60) return 'Proficient';
    if (score >= 50) return 'Moderate';
    if (score >= 40) return 'Developing';
    return 'Emerging';
}
```

## 🛠️ Technologies

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Charts**: Recharts
- **Email**: Nodemailer
- **PDF**: jsPDF + jsPDF-AutoTable
- **Icons**: Lucide React
- **Storage**: Redis (ioredis)

## 📧 Email Configuration

### Gmail Setup (Recommended)

1. **Enable 2-Factor Authentication** on your Google account
2. **Generate an App Password**:
   - Go to Google Account Settings → Security
   - Under "Signing in to Google", select "App passwords"
   - Generate a new app password for "Mail"
   - Use this password in `SMTP_PASS`

### Alternative Email Providers

#### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

#### Mailgun
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASS=your-mailgun-password
```

#### AWS SES
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-ses-smtp-username
SMTP_PASS=your-ses-smtp-password
```

### Testing Email

To test email functionality:

1. Complete an assessment with a valid email address
2. Check the email inbox for the results notification
3. Verify the email renders correctly
4. Click the "View Full Report" button to ensure the link works

### Troubleshooting

**Email not sending:**
- Check SMTP credentials are correct
- Verify firewall/network allows SMTP connections
- Check server logs for detailed error messages

**Email goes to spam:**
- Configure SPF, DKIM, and DMARC records for your domain
- Use a verified email sending service
- Avoid spam trigger words in email content

**Development Testing:**
For development, consider using:
- [Mailtrap](https://mailtrap.io/) - Email testing service
- [Ethereal Email](https://ethereal.email/) - Fake SMTP service
- Gmail with app password (easiest for quick testing)

## 🚢 Deployment

### Deploy to Vercel

1. **Set up Redis Database** (REQUIRED):
   - Create a free Redis database at [Redis Cloud](https://redis.com/try-free/) or [Upstash](https://upstash.com/)
   - Copy your `REDIS_URL` connection string
   - See [START_HERE.md](./START_HERE.md) for detailed instructions

2. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initialize HeyAmara Psychometric Platform"
   # Create a repo on GitHub and follow instructions to push
   ```

3. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New" > "Project"
   - Import your repository
   - Vercel will automatically detect Next.js

4. **Configure Environment Variables**:
   In Vercel project settings, add:
   - `REDIS_URL` - Your Redis connection string
   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_USER`
   - `SMTP_PASS`
   - `EMAIL_FROM`
   - `NEXT_PUBLIC_APP_URL` - Your Vercel URL

5. **Deploy**:
   - Click **Deploy**
   - Wait for deployment to complete
   - Test with a real email to ensure data persistence works

⚠️ **Critical**: Without Redis, user data will NOT persist!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=<your-repo-url>)

### Storage Architecture

This application uses **Redis** for persistent data storage, compatible with any Redis provider (Redis Cloud, Upstash, etc.).

#### Why Redis?

**The Problem with File System Storage:**
- ❌ Serverless functions have **ephemeral file systems**
- ❌ Files written during one request are **lost** after execution
- ❌ Each deployment creates a **new instance** with no previous data
- ❌ Works locally but **fails in production**

**The Solution - Redis:**
- ✅ **Persistent storage** that survives deployments
- ✅ **Fast** read/write operations
- ✅ **Serverless-friendly** with network-based access
- ✅ **Scalable** to handle concurrent users
- ✅ **Free tier** available from multiple providers

#### Data Flow

1. **User submits email** → Check if user exists in Redis
2. **Existing user** → Load progress and redirect to results if completed
3. **New user** → Create new record in Redis
4. **During assessment** → Auto-save progress to Redis after each question
5. **On completion** → Save final scores to Redis and send email
6. **Return visit** → Load existing data from Redis and show results

#### Key Functions

```typescript
// Get user by email
const user = await getUserByEmail(email);

// Save/update user data
await saveUser({
  email,
  responses,
  isCompleted,
  timestamp,
  scores
});
```

For detailed setup instructions, see [START_HERE.md](./START_HERE.md).

### Local Development

```bash
npm install
npm run dev
```

## 🏗️ Architecture Highlights

- **Scoring Engine**: Located at `/lib/psychometric-engine.ts`. Centralizes all calculations and trait interactions
- **Normalization**: Scales 1-5 responses to a 0-100 range for professional reporting
- **Visuals**: Uses `recharts` for radar visualization to provide at-a-glance candidate fingerprints
- **State Management**: Uses React state during assessment and `localStorage` for results persistence
- **Email Service**: Modular email service in `/lib/email.ts` with configurable SMTP settings
- **API Routes**: RESTful endpoints for user data management and email sending

## 📦 Implementation Details

### Completed Features

#### 1. Email Functionality ✉️
- **Created**: `lib/email.ts` - Email service with beautiful HTML template
- **Created**: `app/api/send-email/route.ts` - API endpoint for sending emails
- **Modified**: `app/test/page.tsx` - Added email trigger on test completion

#### 2. JSON-Based Questions 📝
- **Created**: `data/questions.json` - Centralized question storage
- **Modified**: `lib/psychometric-engine.ts` - Load questions from JSON instead of hardcoded
- **Benefits**:
  - Easy to modify questions without code changes
  - Can add/remove questions dynamically
  - Better maintainability

#### 3. Dynamic Score Labels 🎯
- **Modified**: `app/results/page.tsx` - Added `getScoreLabel()` function
- **Modified**: Score cards now display contextual labels

#### 4. Environment Configuration ⚙️
- **Created**: `.env.example` - Template for environment variables
- **Created**: `.env.local` - Local environment configuration

### Dependencies

- `nodemailer` - Email sending library
- `@types/nodemailer` - TypeScript types for nodemailer
- `recharts` - Chart visualization
- `jspdf` & `jspdf-autotable` - PDF generation
- `html-to-image` - Image conversion
- `lucide-react` - Icon library

### Files Created/Modified

**New Files:**
1. `lib/email.ts` - Email service
2. `app/api/send-email/route.ts` - Email API endpoint
3. `data/questions.json` - Questions database
4. `.env.example` - Environment template
5. `.env.local` - Local environment configuration

**Modified Files:**
1. `lib/psychometric-engine.ts` - Load questions from JSON
2. `app/test/page.tsx` - Send email on completion
3. `app/results/page.tsx` - Dynamic score labels
4. `app/page.tsx` - Mobile-first responsive homepage

## 🎨 Customization

### Modify Questions
Edit `data/questions.json` to change assessment questions. Maintain the same structure:
```json
{
  "id": "unique_id",
  "dimension": "cognitive|behavior|motivation|collaboration",
  "text": "Your question text",
  "lowLabel": "Low end description",
  "highLabel": "High end description",
  "weight": 1
}
```

### Customize Email Template
Edit `lib/email.ts` to modify:
- Email design and colors
- Template text and messaging
- Score card layout
- Branding elements

### Adjust Score Thresholds
Modify the `getScoreLabel()` function in `app/results/page.tsx` and `lib/email.ts` to change performance thresholds.

## 🔒 Security Notes

- Never commit `.env.local` to version control
- Use environment variables for all sensitive data
- Secure SMTP credentials with app-specific passwords
- Validate and sanitize user inputs
- Use HTTPS in production

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues or questions, please open an issue on GitHub.

---

**Built with ❤️ using Next.js, TypeScript, and Tailwind CSS**
