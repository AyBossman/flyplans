# ✈️ FlyPlans

> **Affordable long-stay travel accommodations worldwide.**  
> Budget-friendly platform for digital nomads, international students, and long-term travelers.

![FlyPlans Banner](https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&h=300&fit=crop&q=80)

---

## 🌍 What is FlyPlans?

FlyPlans is a two-sided marketplace connecting budget travelers with verified hosts offering long-stay accommodations across Africa, Europe, Asia, and the Americas. Unlike Airbnb or Booking.com, FlyPlans is built specifically for **1–12 month stays** with up to 60% monthly discounts.

**Key Features:**
- 🔍 Search & filter stays by city, region, price, and property type
- 💰 Smart travel budget planner (accommodation + food + transport + activities)
- 📅 Long-stay discount system (auto-applied for 30+ night bookings)
- ✅ Host verification with document + video review
- 💬 In-app messaging between hosts and travelers
- 💳 Stripe-powered secure payments
- 🌐 Global coverage with a focus on emerging markets

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Database | PostgreSQL via Prisma ORM |
| Payments | Stripe |
| Images | Cloudinary |
| Auth | JWT (bcryptjs) |
| Deployment | Vercel (frontend) + Railway (backend) |

---

## 📁 Project Structure

```
flyplans/
├── frontend/                  # React + Vite app
│   ├── src/
│   │   ├── App.jsx            # Main app with all pages
│   │   ├── main.jsx           # React entry point
│   │   ├── index.css          # Global styles + Tailwind
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Page components
│   │   └── lib/               # API client, helpers
│   ├── public/                # Static assets
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── backend/                   # Node.js + Express API
│   ├── src/
│   │   ├── server.js          # Express app entry point
│   │   ├── routes/            # API route handlers
│   │   │   ├── auth.js        # Register, login, me
│   │   │   ├── listings.js    # CRUD + search
│   │   │   ├── bookings.js    # Create, manage, status
│   │   │   ├── reviews.js     # Submit, fetch reviews
│   │   │   ├── messages.js    # Host-traveler chat
│   │   │   ├── users.js       # Profile, wishlist, notifications
│   │   │   ├── payments.js    # Stripe checkout + webhook
│   │   │   ├── budget.js      # Cost estimates by city
│   │   │   └── admin.js       # Admin dashboard routes
│   │   ├── middleware/
│   │   │   ├── auth.js        # JWT authentication
│   │   │   └── errorHandler.js
│   │   └── lib/
│   │       └── prisma.js      # Prisma client singleton
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema (9 models)
│   │   └── seed.js            # Sample data seeder
│   ├── .env.example
│   └── package.json
│
├── .gitignore
├── .vscode/                   # VS Code settings + extensions
└── package.json               # Root scripts (runs both servers)
```

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org) v18 or higher
- [Git](https://git-scm.com)
- A PostgreSQL database ([Supabase](https://supabase.com) free tier recommended)

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/flyplans.git
cd flyplans
```

### 2. Install all dependencies

```bash
npm run install:all
```

### 3. Configure the backend

```bash
cd backend
cp .env.example .env
```

Edit `.env` and fill in:
```env
DATABASE_URL="postgresql://postgres:PASSWORD@db.xxx.supabase.co:5432/postgres"
JWT_SECRET="your-random-64-char-secret"
PORT=4000
FRONTEND_URL="http://localhost:5173"
```

> **Get your DATABASE_URL:** Sign up at [supabase.com](https://supabase.com) → New Project → Settings → Database → Connection String (URI tab)

### 4. Configure the frontend

```bash
cd ../frontend
cp .env.example .env
```

The default `.env` already points to `http://localhost:4000/api` — no changes needed for local dev.

### 5. Set up the database

```bash
# From the root folder:
npm run db:push    # Creates all 9 tables in your database
npm run db:seed    # Loads sample hosts, listings, and budget data
```

### 6. Start the development servers

```bash
# From the root folder — starts both frontend and backend:
npm run dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:4000 |
| API Health | http://localhost:4000/api/health |
| Prisma Studio | `npm run db:studio` |

---

## 🔐 Test Accounts

After running `npm run db:seed`, these accounts are available:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@flyplans.com | password123 |
| Host | chidi@flyplans.com | password123 |
| Traveler | traveler@flyplans.com | password123 |

---

## 📡 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register new user |
| POST | `/api/auth/login` | — | Login, returns JWT |
| GET | `/api/auth/me` | 🔒 | Current user |
| GET | `/api/listings` | — | Search listings |
| GET | `/api/listings/:id` | — | Listing detail |
| POST | `/api/listings` | 🔒 HOST | Create listing |
| POST | `/api/bookings` | 🔒 | Create booking |
| GET | `/api/bookings/traveler` | 🔒 | My bookings |
| GET | `/api/bookings/host` | 🔒 HOST | Incoming bookings |
| PUT | `/api/bookings/:id/status` | 🔒 | Confirm/cancel |
| POST | `/api/reviews` | 🔒 | Submit review |
| GET | `/api/budget?city=Lagos&months=3` | — | Budget estimate |
| POST | `/api/payments/create-checkout-session` | 🔒 | Stripe checkout |

---

## 🗄️ Database Models

```
User ──────────────┬── Listing ──────┬── Booking ──── Review
                   │                 │
                   │                 ├── Message
                   │                 └── Wishlist
                   │
                   ├── HostVerification
                   └── Notification
                   
BudgetEstimate (standalone)
```

---

## 🚢 Deployment

### Backend → Railway
1. Push code to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Select the `backend` folder as root
4. Add a PostgreSQL plugin
5. Set environment variables (same as `.env`)
6. Railway auto-deploys on every push to `main`

### Frontend → Vercel
1. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
2. Set **Root Directory** to `frontend`
3. Add environment variable: `VITE_API_URL` = your Railway backend URL + `/api`
4. Deploy

---

## 🔧 Useful Commands

```bash
npm run dev              # Start both servers
npm run dev:backend      # Backend only
npm run dev:frontend     # Frontend only
npm run db:push          # Push schema to database
npm run db:seed          # Seed sample data
npm run db:studio        # Open Prisma Studio (visual DB editor)
```

---

## 📄 License

MIT — free to use, modify, and distribute.

---

*Built with ❤️ for budget travelers everywhere.*
