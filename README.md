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
| **AI** | Google Gemini (vision, structured JSON output) |
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

Covers login, signup, add-expense, invalid-input/validation cases, and the receipt-scanning retry/fallback behavior (with Gemini mocked, so the suite doesn't need a real API key or network access).

### 5. Enable receipt scanning (optional)

Get a free API key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey) and add it to `backend/.env`:

```
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
```

Without it, the rest of the app works fine — the "Scan a receipt" button will just fail with a "please fill it in" message.

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
