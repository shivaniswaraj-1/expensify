<div align="center">

<img src="https://img.shields.io/badge/Expensify-Finance%20Tracker-6366f1?style=for-the-badge&logo=wallet&logoColor=white" alt="Expensify" />

# Expensify — Smart Finance Tracker

**A production-grade, full-stack expense management SaaS dashboard**

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5-7952B3?style=flat-square&logo=bootstrap)](https://getbootstrap.com)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)](https://mongodb.com)
[![Vercel](https://img.shields.io/badge/Frontend-Vercel-000000?style=flat-square&logo=vercel)](https://vercel.com)

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

### Auth & Security
- 🔐 **JWT Authentication** — Secure token-based sessions
- 🔒 **Protected Routes** — Automatic redirect on session expiry
- 📧 **Password Reset** — Email-based reset flow via Nodemailer
- 💾 **Persistent Login** — Sessions survive page refreshes

### UI & Experience
- 🌙 **Dark Mode** — Full system-wide dark theme, persisted to localStorage
- 📱 **Fully Responsive** — Mobile sidebar, adaptive layouts at all breakpoints
- 💀 **Skeleton Loaders** — Polished loading states on every data fetch
- 🎯 **Empty States** — Illustrated empty states with helpful CTAs
- 🍞 **Toast Notifications** — Success / error feedback on every action
- ⚡ **Optimistic UI** — Instant feedback via TanStack Query cache

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
| **Database** | MongoDB with Mongoose |
| **Auth** | JSON Web Tokens (JWT) |
| **Email** | Nodemailer |
| **Deploy FE** | Vercel |
| **Deploy BE** | Render / Railway |
| **DB Hosting** | MongoDB Atlas |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- A Gmail account for email resets (or any SMTP)

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/expensify.git
cd expensify
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

---

## 🌍 Deployment

### Frontend → Vercel
1. Push repo to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Set root directory to `frontend`
4. Add env variable: `VITE_SERVER_ADDRESS=https://your-api.onrender.com`
5. Deploy ✅

### Backend → Render
1. Create new **Web Service** on [render.com](https://render.com)
2. Connect your GitHub repo, set root to `backend`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add all env variables from `.env.example`
6. Deploy ✅

---

## 📁 Project Structure

```
expensify/
├── frontend/
│   └── src/
│       ├── components/      # Shared UI components (Loading, etc.)
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
    ├── controllers/         # Route handlers
    ├── middleware/          # Auth, error handling
    ├── models/              # Mongoose schemas
    ├── routes/              # Express routers
    └── utils/               # DB connection, email
```

---

## 📄 License

SHIVANI © 2026 Expensify

---

<div align="center">
  Built with ❤️ using React + Bootstrap 5 + MongoDB
</div>
