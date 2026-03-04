# ✈️ FlyPlans — Full App Build Prompt for Claude

Use this prompt to build the FlyPlans application from scratch using a modern, simple tech stack.

---

## 🛠️ Tech Stack

- **Frontend:** React (Vite) + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** PostgreSQL (via Prisma ORM)
- **Auth:** Clerk or Supabase Auth
- **Payments:** Stripe
- **File Storage:** Cloudinary (host photo uploads)
- **Deployment:** Vercel (frontend) + Railway or Render (backend)

---

## 📋 Full Build Prompt

```
Build a full-stack travel accommodation marketplace web app called FlyPlans.

FlyPlans is a two-sided marketplace (hosts + travelers) focused on affordable long-stay global accommodations. Think Airbnb but optimized for 1-12 month budget stays, with emphasis on emerging markets (Africa, Asia, South America) and special tools for international students, digital nomads, and remote workers.

---

### TECH STACK
- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express REST API
- Database: PostgreSQL via Prisma ORM
- Auth: Clerk (or Supabase Auth)
- Payments: Stripe
- Image uploads: Cloudinary
- Deploy: Vercel + Railway

---

### PAGES & ROUTES

**Public Pages:**
1. / — Home/Landing Page
   - Hero section: "Find Your Perfect Long-Stay Anywhere in the World"
   - Search bar: destination, check-in, check-out, guests
   - Featured stays (card grid)
   - How it works (3 steps)
   - Popular destinations (Africa, Europe, Asia, Americas)
   - Stats section (hosts, countries, travelers)

2. /search — Search Results Page
   - Filter sidebar: price range, room type, amenities, stay duration, rating
   - Map view toggle (Google Maps or Mapbox)
   - Listing cards with: photo, title, price/night, price/month, rating, location

3. /listing/:id — Individual Listing Page
   - Photo gallery
   - Title, location, host info
   - Price: per night / per week / per month (with long-stay discount shown)
   - Description, amenities list
   - Availability calendar
   - Booking form (date picker, guest count, total cost calculator)
   - Host profile card with verification badge
   - Reviews section

4. /budget-planner — Smart Travel Budget Planner
   - Input: destination, duration, number of travelers
   - Output breakdown: accommodation, food, transport, activities, utilities
   - Editable cost fields
   - Monthly total + savings vs hotel estimate
   - "Find stays in my budget" CTA

5. /destinations — Browse by Region
   - Africa, Europe, North America, Asia, South America, Middle East
   - Country cards with avg price/month

**Auth Pages:**
6. /signup — Sign Up (traveler or host)
7. /login — Log In

**Traveler Dashboard (/dashboard/traveler):**
- My Bookings (upcoming, past, pending)
- Saved Wishlist
- Messages
- Profile settings

**Host Dashboard (/dashboard/host):**
- My Listings
- Booking requests (accept/decline)
- Earnings overview (Stripe)
- Verification status
- Analytics: views, bookings, revenue

8. /host/new-listing — Create Listing Form
   - Property type (private room, apartment, guesthouse, shared space)
   - Photos upload (Cloudinary)
   - Title, description, address
   - Pricing: nightly / weekly / monthly
   - Long-stay discount toggle (% off for 30+ days)
   - Amenities checklist
   - Availability calendar

---

### DATABASE SCHEMA (Prisma)

Models:
- User (id, name, email, role: TRAVELER | HOST | ADMIN, avatar, isVerified, createdAt)
- Listing (id, hostId, title, description, type, address, lat, lng, pricePerNight, pricePerMonth, discountPercent, photos[], amenities[], isVerified, isActive, createdAt)
- Booking (id, travelerId, listingId, checkIn, checkOut, totalPrice, status: PENDING | CONFIRMED | CANCELLED | COMPLETED, stripePaymentId)
- Review (id, travelerId, listingId, rating, comment, createdAt)
- Message (id, senderId, receiverId, bookingId, content, createdAt)
- HostVerification (id, userId, documentUrl, videoUrl, status: PENDING | APPROVED | REJECTED)

---

### CORE FEATURES

1. Search & Filter
   - Full-text search by city/country
   - Filters: price, type, amenities, duration, rating
   - Sort: price (low-high), rating, newest

2. Booking Flow
   - Date picker (check-in / check-out)
   - Auto-calculate: nightly rate OR monthly rate + discount
   - Stripe checkout session
   - Host notified of new booking request
   - Traveler confirmation email

3. Long-Stay Discount System
   - Hosts set a % discount for 30+ day bookings
   - Automatically applied in price calculator
   - Badge: "20% off monthly" shown on listing cards

4. Budget Planner Tool
   - Input destination + duration
   - Returns estimate breakdown (use static data per country for MVP)
   - Shows potential savings vs average hotel cost

5. Host Verification
   - Upload government ID + short video introduction
   - Admin reviews and approves/rejects
   - Verified badge shown on listings

6. Messaging System
   - Real-time or polling-based chat between host and traveler
   - Tied to a booking or listing inquiry

7. Reviews & Ratings
   - After completed stay, traveler can leave review
   - 1–5 stars + text comment
   - Average rating shown on listings

---

### UI/UX GUIDELINES
- Clean, modern design with a blue + white color scheme (#1A3C5E primary, #2E75B6 accent)
- Mobile-first responsive layout
- Listing cards with hover shadows and smooth transitions
- Loading skeletons for async data
- Toast notifications for actions (booking confirmed, message sent)
- Empty states with friendly illustrations

---

### API ENDPOINTS (Express)

Auth:
POST /api/auth/register
POST /api/auth/login

Listings:
GET /api/listings (with query params: city, minPrice, maxPrice, type, minDuration)
GET /api/listings/:id
POST /api/listings (host only)
PUT /api/listings/:id (host only)
DELETE /api/listings/:id (host only)

Bookings:
POST /api/bookings
GET /api/bookings/traveler (my bookings)
GET /api/bookings/host (incoming requests)
PUT /api/bookings/:id/status

Payments:
POST /api/payments/create-checkout-session
POST /api/payments/webhook (Stripe webhook)

Reviews:
POST /api/reviews
GET /api/reviews/listing/:id

Messages:
GET /api/messages/:bookingId
POST /api/messages

Budget Planner:
GET /api/budget-estimate?destination=Lagos&duration=30

---

### ENVIRONMENT VARIABLES NEEDED
DATABASE_URL=
CLERK_SECRET_KEY= (or SUPABASE_SERVICE_KEY)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
CLOUDINARY_URL=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=

---

Build this step by step:
1. Set up the project structure (Vite + React + Tailwind frontend, Express backend)
2. Set up Prisma schema and database
3. Build auth (Clerk integration)
4. Build the listing CRUD and search API
5. Build the frontend pages (home, search, listing detail)
6. Add booking flow with Stripe
7. Build host and traveler dashboards
8. Add messaging and reviews
9. Add budget planner
10. Deploy to Vercel + Railway

Start with Step 1 and ask me before proceeding to each next step.
```

---

## 🎨 Brand Guidelines

| Element | Value |
|---|---|
| Primary Color | `#1A3C5E` (Dark Navy Blue) |
| Accent Color | `#2E75B6` (Sky Blue) |
| Background | `#F5F9FC` |
| Font | Inter or Plus Jakarta Sans |
| Logo Mark | ✈️ emoji + FLYPLANS wordmark |

---

## 📁 Recommended Folder Structure

```
flyplans/
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route pages
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # API calls, helpers
│   │   └── assets/         # Images, icons
│   ├── index.html
│   └── vite.config.js
│
├── backend/
│   ├── src/
│   │   ├── routes/         # Express route handlers
│   │   ├── controllers/    # Business logic
│   │   ├── middleware/      # Auth, error handling
│   │   └── lib/            # Stripe, Cloudinary helpers
│   ├── prisma/
│   │   └── schema.prisma
│   └── server.js
│
└── .env
```

---

*Generated for FlyPlans — March 2026*
