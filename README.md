<div align="center">

<img src="https://img.shields.io/badge/Bible%20Teddy-Interactive%20Faith%20Adventures-ffd700?style=for-the-badge&logo=bookstack&logoColor=white" alt="Bible Teddy" />

<h1>📖 Bible Teddy</h1>

<p><strong>AI-powered interactive Scripture learning for children</strong></p>

<p>
  <a href="https://youversion.com"><img src="https://img.shields.io/badge/YouVersion-API-00A3E0?style=flat-square&logo=bible&logoColor=white" /></a>
  <a href="https://studio.gloo.us"><img src="https://img.shields.io/badge/Gloo%20AI-Studio-6C47FF?style=flat-square&logo=openai&logoColor=white" /></a>
  <a href="https://ai.google.dev"><img src="https://img.shields.io/badge/Gemini-2.5%20Flash-4285F4?style=flat-square&logo=google&logoColor=white" /></a>
  <a href="https://supabase.com"><img src="https://img.shields.io/badge/Supabase-Database-3FCF8E?style=flat-square&logo=supabase&logoColor=white" /></a>
  <a href="https://vercel.com"><img src="https://img.shields.io/badge/Vercel-Deploy-000000?style=flat-square&logo=vercel&logoColor=white" /></a>
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=next.js&logoColor=white" /></a>
</p>

<blockquote>
  <em>"Billions of people live in digital worlds where Scripture has never shown up."</em><br/>
  A <strong>YouVersion + Gloo AI Hackathon</strong> entry — bridging Scripture into interactive digital experiences for children.
</blockquote>

</div>

---

## 🌟 What Is Bible Teddy?

Bible Teddy transforms **passive Christian media** (Superbook, VeggieTales) into **active, voice-interactive learning experiences** for children aged 3–14.

Children don't just watch Bible stories — they **engage with them**:
- 🎬 **Watch** curated Superbook episodes
- 🎤 **Recite** memory verses with their voice (scored by Gloo AI)
- 🧠 **Answer** AI-generated checkpoint quizzes mid-video
- 🗺️ **Explore** an adventure map connecting Bible stories
- 🏅 **Earn** Faith Seeds and Scripture Badges
- 📖 **Read** scripture in Kids ICB or Classic ESV — powered by YouVersion Platform API

---

## 🏆 Hackathon Challenge

**YouVersion + Gloo AI Scripture in Digital Worlds Challenge**

> *"Where to Build: Gaming and social experiences, creator tools, wearables, and emerging digital interfaces."*

Bible Teddy answers this by bringing Scripture into the **interactive children's media space** — a $10B+ industry where the Bible has never natively appeared.

**APIs Used:**
| API | Purpose |
|-----|---------|
| **YouVersion Platform API** | Live scripture text (ICB, ESV, NIV, KJV, NLT), Verse of the Day |
| **Gloo AI Studio** | Faith-tuned quiz generation, theologically-grounded voice matching |
| **Google Gemini 2.5 Flash** | Video2App engine — extracts Bible topics from YouTube content |

---

## ✨ Key Features

### 🗺️ Bible Adventure Map
Connected storyline map of 5 curated Superbook episodes. Click any node to watch, quiz, or sing along. One story is locked — unlocked by earning enough Faith Badges.

### 🎬 Interactive Video Player (Checkpoint System)
YouTube videos with **AI-powered pause points** — at key moments, Bible Teddy pauses the story and asks a quiz question. Answer correctly to earn Seeds and unlock the next checkpoint.

### 🎤 Voice Verse Reciter
Children recite scripture aloud. The Web Speech API captures their voice; **Gloo AI Studio** scores the recitation for accuracy and returns:
- Accuracy percentage
- Key words missed
- Bible Teddy's encouraging feedback
- Improvement hints

### 📖 YouVersion Scripture Integration
- Fetches live verse text across 5 translations (ICB, ESV, NIV, KJV, NLT)
- Kids can toggle between **Children's Level (ICB)** and **Classic (ESV)**
- Verse of the Day from YouVersion feeds the daily quest system

### 🎵 Scripture Music Tab
Curated Bible memory song sing-alongs tied to each adventure story.

### 👨‍👩‍👧 Parent Hub
- Curate YouTube videos for their children (Gemini parses + Gloo generates quizzes)
- Monitor badges earned, seeds collected, streak days
- Manage child profiles with age-appropriate content filters

---

## 🛠️ Tech Stack

```
Frontend:      Next.js 16 (App Router) + React 19 + Tailwind CSS v4
Database:      Supabase (PostgreSQL + Row Level Security + Realtime)
Auth:          Supabase Auth (Email/Password + Google OAuth)
AI / Scripture: YouVersion Platform API + Gloo AI Studio + Google Gemini 2.5 Flash
Deployment:    Vercel
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project
- API keys (see Environment Variables below)

### 1. Clone & Install
```bash
git clone https://github.com/joboyebisi/bibleteddy.git
cd bibleteddy
npm install
```

### 2. Environment Variables
Create a `.env.local` file in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# Google Gemini (Video2App engine)
GEMINI_API_KEY=AIza...

# YouVersion Platform API
YOUVERSION_API_TOKEN=your_token_here
YOUVERSION_API_BASE=https://api.youversion.com/v1

# Gloo AI Studio
GLOO_API_KEY=your_gloo_key_here
GLOO_API_BASE=https://api.studio.gloo.us/v1

# Google OAuth (configured in Supabase Auth dashboard)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# App URL
NEXT_PUBLIC_SITE_URL=https://your-vercel-url.vercel.app
```

### 3. Set Up the Database
Run the SQL schema in your Supabase SQL Editor:

```bash
# Copy contents of supabase/schema.sql
# Paste into: https://supabase.com/dashboard → SQL Editor → New Query → Run
```

This creates:
- `parent_profiles` — Supabase Auth-linked parent accounts
- `child_profiles` — Per-child progress (seeds, badges, streaks)
- `curated_stories` — Parent-approved YouTube Bible content
- `badges_earned` — Badge achievement log
- `verse_completions` — Voice recitation history
- `checkpoint_completions` — Video quiz results
- `daily_activity` — Streak tracking

### 4. Configure Google OAuth (for Social Login)
1. Go to [Supabase Dashboard](https://supabase.com/dashboard) → Authentication → Providers → Google
2. Enable Google and add your `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
3. Add this redirect URL: `https://your-project.supabase.co/auth/v1/callback`
4. In [Google Cloud Console](https://console.cloud.google.com), add your Vercel domain to authorized redirect URIs

### 5. Run Locally
```bash
npm run dev
# Open http://localhost:3000
```

---

## ☁️ Deploy to Vercel

### One-Click Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/joboyebisi/bibleteddy)

### Manual Deploy

1. **Install Vercel CLI** (optional):
```bash
npm i -g vercel
vercel login
vercel --prod
```

2. **Or use Vercel Dashboard:**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import from GitHub: `joboyebisi/bibleteddy`
   - Framework: **Next.js** (auto-detected)
   - Click **Deploy**

3. **Add Environment Variables in Vercel:**
   - Go to your Vercel project → Settings → Environment Variables
   - Add all variables from `.env.local` (without the `#` comments)
   - Set `NEXT_PUBLIC_SITE_URL` to your Vercel deployment URL (e.g. `https://bibleteddy.vercel.app`)

4. **Update Supabase Auth redirect URLs:**
   - Supabase Dashboard → Authentication → URL Configuration
   - Add `https://bibleteddy.vercel.app/api/auth/callback` to **Redirect URLs**

---

## 📁 Project Structure

```
bible-teddy/
├── src/
│   ├── app/
│   │   ├── page.js                 # Landing page
│   │   ├── kids/
│   │   │   ├── page.js             # Adventure Map + Voice Reciter
│   │   │   └── lesson/page.js      # Interactive Video Player
│   │   ├── parent/page.js          # Parent Hub
│   │   ├── onboarding/
│   │   │   ├── signup/page.js      # Auth (Email + Google)
│   │   │   └── child/page.js       # Child profile creation
│   │   └── api/
│   │       ├── auth/callback/      # OAuth callback handler
│   │       ├── youversion/verse/   # YouVersion Scripture API
│   │       ├── gloo/
│   │       │   ├── quiz/           # Faith-tuned quiz generation
│   │       │   └── voice-match/    # Voice recitation scoring
│   │       └── curate/             # Video2App Gemini engine
│   ├── context/
│   │   └── AppContext.js           # Global state + Supabase realtime
│   └── lib/
│       └── supabaseClient.js       # Supabase client init
├── supabase/
│   └── schema.sql                  # Full DB schema with RLS policies
├── public/                         # Static assets
└── next.config.mjs                 # CSP headers (YouTube, Supabase, APIs)
```

---

## 🔌 API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/youversion/verse` | `GET` | Fetch verse by reference + translation |
| `/api/youversion/verse` | `POST` | Fetch Verse of the Day |
| `/api/gloo/quiz` | `POST` | Generate faith-grounded quiz checkpoints |
| `/api/gloo/voice-match` | `POST` | Score child's spoken scripture recitation |
| `/api/curate` | `POST` | Video2App: parse YouTube URL → lesson checkpoints |
| `/api/auth/callback` | `GET` | OAuth callback (Google login) |

All routes gracefully fall back: **Gloo → Gemini → Static curated content**. The app works without API keys in development.

---

## 🎨 Design System

**Stained Glass Sparkle** — A warm, faith-inspired aesthetic:
- 🟡 **Gold** `#ffd700` — Primary actions, highlights
- 🟦 **Teal** `#0c6780` — Trust, links, YouVersion branding
- 🟤 **Brown** `#3d3300` — Headings, rich text
- ⬜ **Cream** `#fbf9f5` — Backgrounds, warmth

Typography: [Outfit](https://fonts.google.com/specimen/Outfit) (Google Fonts)

---

## 🙏 Scripture & Faith Commitment

All AI-generated content is:
1. **Gloo-grounded** — Gloo AI Studio's faith-tuned models ensure theological soundness
2. **Scripture-anchored** — Every quiz, checkpoint, and response links to a Bible verse
3. **Age-appropriate** — Separate ICB (children) and ESV (classic) translation modes
4. **Encouraging** — Voice scoring feedback is always grace-filled and motivating

---

## 📄 License

MIT License — See [LICENSE](LICENSE)

---

<div align="center">

Built with ❤️ and faith for the **YouVersion + Gloo AI Scripture in Digital Worlds Hackathon**

*"Your word is a lamp for my feet, a light on my path." — Psalm 119:105*

</div>
