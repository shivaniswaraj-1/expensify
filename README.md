<div align="center">

<img src="https://img.shields.io/badge/SpendWise-Finance%20Tracker-6366f1?style=for-the-badge&logo=wallet&logoColor=white" alt="SpendWise" />

# SpendWise — Smart Finance Tracker

**A production-grade, full-stack expense management SaaS dashboard**

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5-7952B3?style=flat-square&logo=bootstrap)](https://getbootstrap.com)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)](https://mongodb.com)
[![Vercel](https://img.shields.io/badge/Frontend-Vercel-000000?style=flat-square&logo=vercel)](https://vercel.com)

**Live:** _add your deployed frontend URL here once deployed, e.g. https://spendwise.vercel.app_

</div>

---

## ✨ Features

### Dashboard
- 📊 **Visual Analytics** — Pie chart (category breakdown) + Area chart (spending trends)
- 💰 **Monthly Budget Tracker** — Set budgets, track % used, get over-budget warnings
- 📈 **Smart KPI Cards** — Total spent, this month, top category, budget remaining
- 🔍 **Debounced Search** — Find any expense instantly across description & category
- 🗂 **Filter & Sort** — Filter by category, sort by amount ascending/descending
- 📋 **Paginated Table** — Configurable page size with server-side pagination

### Analytics Page
- 📅 **Period Tabs** — Weekly / Monthly / Yearly breakdowns
- 📊 **Dual Charts** — Bar chart + Line chart side by side
- 🏆 **Peak Spending** — Auto-detect highest spend period
- 📋 **Detailed Table** — Every entry with share-of-total progress bars

### Premium System (backend complete, UI in progress)
- 💳 **Razorpay Payments** — Order creation + HMAC signature verification to upgrade an account
- 🏅 **Leaderboard** — Ranks users by total spend via a MongoDB aggregation, with other users' emails hidden
- 📤 **CSV Export** — Expense export uploaded to Cloudinary, with download history

  These are fully implemented on the backend but not yet wired into the frontend UI — there's no in-app upgrade button or leaderboard page yet.

### Auth & Security
- 🔐 **JWT Authentication** — Secure token-based sessions
- 🔒 **Protected Routes** — Automatic redirect on session expiry
- 📧 **Password Reset** — Email-based reset flow via Nodemailer
- 💾 **Persistent Login** — Sessions survive page refreshes

### AI Receipt Scanning
- 📷 **Snap & Fill** — Upload a bill photo and Gemini's vision model extracts the amount, date, merchant, and category
- ✅ **Confirm, Don't Trust** — Extracted values pre-fill the Add Expense form for you to review or edit; nothing saves until you submit
- 🔁 **Retry, Then Fall Back** — A malformed AI response is retried once, then falls back to an empty form with a "please fill it in" message rather than showing garbage
- 🧾 **Receipt Storage** — The photo itself is uploaded to Cloudinary and linked to the saved expense
- 🔐 **Server-Side Only** — The Gemini API key lives only in the backend's environment; the frontend never sees it

### AI Voice Logging (Hinglish)
- 🎙 **Tap & Speak** — The browser's Web Speech API transcribes speech in Hindi, English, or a Hinglish mix, with a one-tap language switch (हिं / EN)
- 🧠 **Understands Natural Speech** — Gemini resolves amounts spoken as words ("do sau rupaye") and relative dates ("kal", "last Sunday") into a structured expense
- ✅ **Same Confirm Screen** — Extracted values pre-fill the same Add Expense form as receipt scanning; nothing saves until you submit
- 🔁 **Retry, Then Fall Back** — Same retry-once-then-fall-back behavior as receipt scanning
- 🟢 **Clear States** — Pulsing mic while listening, a spinner while Gemini processes, and a plain-language message in browsers without Web Speech support (works best in Chrome)

### Ask Your Spending
- 💬 **Natural-Language Questions** — "How much did I spend on groceries last month?" answered in plain English
- 🛡 **AI Never Touches the Database** — Gemini only converts the question into a small filter object (`{ category, from, to, metric }`), which Zod validates before anything runs. The backend then executes a normal MongoDB aggregation, always scoped to `req.user._id`
- 🎯 **Accurate By Construction** — The answer's number always comes straight from that aggregation, not from the AI's guess; the AI only phrases the question into a filter, never the answer's numbers
- 🔁 **Retry, Then Ask to Rephrase** — Same retry-once pattern as the other AI features; two bad filters and the user is asked to rephrase instead of getting a wrong answer

### Monthly AI Insights
- 🧮 **Backend Does the Math** — This month vs. last month, spend by category, and top merchants are computed with MongoDB aggregations first
- ✨ **AI Writes the Sentences** — Only those pre-computed numbers (never raw expense rows) are sent to Gemini, which returns exactly 3 short, validated insight sentences
- 💾 **Cached Per Month** — Each user's insights are cached in a `MonthlyInsight` collection for the calendar month, so revisiting the dashboard doesn't trigger another paid call
- 🪂 **Deterministic Fallback** — If Gemini fails twice, the app still shows 3 real insights built from the same numbers with plain string formatting — never a blank card

### AI Cost & Speed Tracking
- 📝 **Every Call Logged** — Every Gemini call (receipt scan, voice parse, ask-your-spending, monthly insights) writes one row to an `ai_logs` collection: feature, tokens used, response time, success/failure
- 📊 **`/ai-usage` Admin View** — A small in-app page aggregates those rows per feature: call count, success rate, average tokens, average response time — so cost/speed claims are backed by real numbers, not guesses
- 🧯 **Never Blocks the Feature** — Logging is fire-and-forget; a failed log write is caught and reported to the console, never surfaced to the user or allowed to fail the actual AI call

### Backend Hardening
- ✅ **Input Validation** — Every route validates its input with Zod (positive amounts, real email addresses, strong passwords, category enums) before it reaches a controller
- 🗂 **Fixed Category List** — A single list of allowed expense categories, shared by the frontend dropdown and the backend validator
- 🚦 **Rate Limiting** — `express-rate-limit` caps abuse globally, with a tighter cap on auth endpoints (login/signup/reset)
- 🧯 **Centralized Error Handling** — One Express error middleware returns consistent `{ success, message }` JSON for every failure, including unmatched routes
- 🤖 **AI-Ready** — All third-party API calls (including any future AI features) run on the backend only; the frontend never sees a provider API key

### UI & Experience
- 🌙 **Dark Mode** — Full system-wide dark theme, persisted to localStorage
- 📱 **Fully Responsive** — Mobile sidebar, adaptive layouts at all breakpoints
- 💀 **Skeleton Loaders** — Polished loading states on every data fetch
- 🎯 **Empty States** — Illustrated empty states with helpful CTAs
- 🍞 **Toast Notifications** — Success / error feedback on every action
- ⚡ **Automatic Cache Refresh** — Mutations invalidate and refetch relevant data via TanStack Query

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Vite |
| **Styling** | Bootstrap 5 + Custom CSS Design System |
| **State** | Zustand (auth) + TanStack Query v5 (server state) |
| **Forms** | React Hook Form |
| **Charts** | Recharts |
| **Routing** | React Router v6 |
| **HTTP** | Axios (with interceptors) |
| **Animations** | CSS transitions + CountUp.js |
| **Backend** | Node.js, Express.js |
| **AI** | Google Gemini (vision + text, structured JSON output) |
| **Speech-to-Text** | Browser Web Speech API (`SpeechRecognition`) |
| **File Uploads** | Multer (memory storage, 5MB limit) |
| **Validation** | Zod |
| **Rate Limiting** | express-rate-limit |
| **Database** | MongoDB with Mongoose |
| **Auth** | JSON Web Tokens (JWT) |
| **Email** | Nodemailer |
| **Testing** | Jest + Supertest + mongodb-memory-server |
| **Deploy FE** | Vercel |
| **Deploy BE** | Render |
| **DB Hosting** | MongoDB Atlas |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- A Gmail account for email resets (or any SMTP)

### 1. Clone the repo

```bash
git clone https://github.com/shivaniswaraj-1/spendwise.git
cd spendwise
```

### 2. Backend setup

```bash
cd backend
cp .env.example .env      # Fill in your values
npm install
npm run dev               # Starts on port 8080
```

### 3. Frontend setup

```bash
cd frontend
cp .env.example .env      # Set VITE_SERVER_ADDRESS
npm install
npm run dev               # Starts on port 5173
```

### 4. Run the backend tests

```bash
cd backend
npm test                  # Jest + Supertest, runs against an in-memory MongoDB
```

Covers login, signup, add-expense, invalid-input/validation cases, the receipt-scanning/voice-logging/ask-your-spending/monthly-insights retry/fallback behavior, the AI usage stats aggregation, and standalone unit tests for every Zod schema that gates an AI response (with Gemini mocked throughout, so the suite doesn't need a real API key or network access).

### 5. Enable the AI features (optional)

Get a free API key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey) and add it to `backend/.env`:

```
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
```

One key powers all four AI features — receipt scanning, voice logging, "Ask your spending", and monthly insights. Without it, the rest of the app works fine — those features just fail with a "please fill it in" / "please try rephrasing" message instead of a result. Voice logging also needs a Chromium-based browser (Chrome, Edge) for the Web Speech API.

---

## 🔒 Fixed Expense Categories

Every expense must use one of these categories — enforced by Zod on the backend (`backend/constants/categories.js`) and mirrored in the frontend dropdown (`frontend/src/constants/categories.ts`):

Mobile & Computers · Books & Education · Sports, Outdoor & Travel · Bills & EMI's · Groceries & Pet Supplies · Fashion & Beauty · Gifts & Donations · Investments · Insurance · Entertainment · Home & Utilities · Hobbies & Leisure

---

## 🎯 Measuring Receipt-Scanning Accuracy

`backend/eval/evaluate-receipts.js` runs the exact same extraction code the live app uses against a batch of real receipts and scores it, so a prompt change can be judged by a number instead of a guess.

1. Drop ~30 real receipt photos into `backend/eval/receipts/` (restaurant, grocery, fuel, online order, plus a few blurry/handwritten ones — this folder is gitignored since receipts are personal)
2. Record the correct amount and date for each file in `backend/eval/expected.json`
3. From `backend/`, run:
   ```bash
   npm run eval:receipts
   ```
4. It prints a per-file ✓/✗ and a final score, e.g. `Amount accuracy: 21/30`, `Date accuracy: 19/30`
5. Tweak the prompt in `backend/utils/geminiClient.js`, re-run, and compare — "improved from 21/30 to 27/30" is the story you're after

---

## 🏗 Architecture

### The AI features, end to end

```
Receipt photo ──▶ Gemini (vision)  ──┐
Voice transcript ──▶ Gemini (text) ──┤
                                      ├──▶ Zod validation ──▶ Confirm screen ──▶ POST /api/expense
Spending question ──▶ Gemini (text) ─┘         │                                     (only on submit)
                                                ▼
                                     ai_logs { feature, tokens,
                                     responseTimeMs, success }
```

### Why "Ask your spending" never lets the AI touch the database

This is the design decision the feature hinges on, so it's worth drawing out on its own:

```
"How much did I spend on groceries    ┌─────────────────────────┐
 last month?"               ────────▶ │ Gemini: question → filter│
                                       │ { category, from, to,    │
                                       │   metric }                │
                                       └────────────┬─────────────┘
                                                     ▼
                                       ┌─────────────────────────┐
                                       │ Zod: spendingFilterSchema│
                                       │ (category must be one of │
                                       │  the fixed enum, dates    │
                                       │  coerced, metric enum)    │
                                       └────────────┬─────────────┘
                                          invalid │      │ valid
                                    (retry once,  │      │
                                    then ask to    ▼      ▼
                                    rephrase)  ┌──────────────────────────┐
                                               │ Expense.aggregate([      │
                                               │  { $match: { userId,     │  ◀── always the
                                               │    ...filter } },        │      logged-in
                                               │  { $group: { sum, count, │      user's _id
                                               │    average } } ])        │
                                               └────────────┬─────────────┘
                                                             ▼
                                               "You spent ₹4,200 on Groceries
                                                & Pet Supplies in August 2026."
                                               (built from the DB result — the
                                                LLM never sees or states the
                                                final number)
```

The AI only ever produces the small filter object in the top box — never a query, never a number. Because the aggregation's `$match` always includes `userId: req.user._id`, there's no path for the AI (or a malicious prompt inside the question) to reach another user's data, and the amount in the answer is always whatever MongoDB actually returned, not something the model guessed.

### Monthly insights: numbers first, sentences second

Same principle, one step removed: `computeMonthlyStats()` runs the aggregations (this month vs. last month, by category, top merchants) *before* Gemini is ever called, and only those already-correct numbers are sent to it. Gemini's only job is turning them into 3 readable sentences — it can't introduce a number that isn't already true.

---

## 🧩 Challenges & How I Solved Them

- **Keeping the AI from ever touching the database directly.** The obvious-but-wrong version of "Ask your spending" lets the LLM write a Mongo query or aggregation pipeline itself. That's a prompt-injection and data-leak risk waiting to happen. Instead, Gemini only ever returns a tiny filter object (`{ category, from, to, metric }`), Zod validates it against the fixed category enum and a 3-value metric enum, and the backend is the only thing that ever constructs and runs the actual aggregation — always with `userId: req.user._id` hard-coded into the `$match`, not read from anything the AI produced.

- **Never showing a wrong number.** Every AI feature in this app follows the same shape: the AI extracts/interprets, Zod validates, and if either step fails once, it's retried exactly once before falling back — to an empty form (receipt/voice), a "please rephrase" message (ask-your-spending), or deterministic string-formatted insights built from the same numbers (monthly insights). Nothing ever silently shows a guess as if it were real data.

- **Adding cost/speed logging without breaking four working AI call sites.** Once token/response-time logging was needed everywhere, four different Gemini call sites (receipt, voice, ask, insights) needed a shared measurement point. Rather than sprinkle timing code into each one, every call now goes through one low-level `callGemini()` helper in `geminiClient.js` that returns `{ json, tokensUsed }`, and each retry wrapper threads `tokensUsed` back up to its controller, which logs `{ feature, tokensUsed, responseTimeMs, success }` to `ai_logs` in a fire-and-forget call that can never fail the actual request.

- **Hinglish date/number parsing for voice logging.** Web Speech API transcripts mix Hindi, English, and romanized Hinglish freely, and relative dates ("kal", "last Sunday") and spoken numbers ("do sau rupaye") need to resolve against *today's* date, not the model's training cutoff. The fix was mundane but necessary: pass today's date into the prompt explicitly every time, and be explicit in the prompt about which Hindi relative-date words to expect, rather than assuming the model infers "today" correctly on its own.

- **Controlling AI spend on a feature people will open repeatedly.** Insights are cheap to compute but not free to generate, and a dashboard page is the kind of thing people refresh often. Caching the generated insights per `(userId, month)` in Mongo means the expensive call happens at most once per user per month — worth doing before optimizing the prompt itself.

---

## 📸 Screenshots

_Add screenshots of the dashboard, receipt scanning, voice logging, "Ask your spending", and the AI Usage page here once you have a deployed build to capture them from._

## 🎬 Demo Video

_Add a ~2-minute walkthrough here: scan a receipt, log an expense by voice, then ask a spending question._

---

## 🌍 Deployment

### Database → MongoDB Atlas
1. Create a free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Add a database user and allow network access (0.0.0.0/0 for simplicity, or Render's IPs)
3. Copy the connection string into `MONGO_URI` on the backend

### Backend → Render
1. Create a new **Web Service** on [render.com](https://render.com)
2. Connect your GitHub repo, set root directory to `backend`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add every variable from `backend/.env.example` under Render's Environment tab
6. Deploy, then copy the resulting `https://your-api.onrender.com` URL

### Frontend → Vercel
1. Import the project on [vercel.com](https://vercel.com)
2. Set root directory to `frontend`
3. Add env variable: `VITE_SERVER_ADDRESS=https://your-api.onrender.com`
4. Deploy, then copy the resulting URL back into the backend's CORS allow-list in `backend/app.js` and into `FRONT_END_URL` on Render
5. Paste the live URL at the top of this README

---

## 📁 Project Structure

```
spendwise/
├── frontend/
│   └── src/
│       ├── components/      # Shared UI components (Loading, etc.)
│       ├── constants/       # Shared frontend constants (categories, etc.)
│       ├── hoc/             # Higher-order components (PrivateRoute, PublicRoute)
│       ├── hooks/           # Custom React hooks
│       ├── lib/             # Axios instance, QueryClient
│       ├── overlays/        # Modal dialogs
│       ├── pages/           # Route-level pages
│       ├── providers/       # App-level providers
│       ├── services/        # Side-effect services
│       ├── store/           # Zustand auth store
│       ├── types/           # TypeScript types
│       └── utils/           # Auth storage utilities
└── backend/
    ├── constants/           # Fixed category list, shared with the frontend
    ├── controllers/         # Route handlers
    ├── eval/                # Receipt-scanning accuracy harness (receipts/ is gitignored)
    ├── middleware/          # Auth, validation, rate limiting, uploads, error handling
    ├── models/              # Mongoose schemas
    ├── routes/              # Express routers
    ├── schemas/             # Zod validation schemas per resource
    ├── tests/               # Jest + Supertest API tests
    └── utils/               # DB connection, email, Cloudinary, Gemini client
```

---

## 📄 License

SHIVANI © 2026 SpendWise

---

<div align="center">
  Built with ❤️ using React + Bootstrap 5 + MongoDB
</div>
