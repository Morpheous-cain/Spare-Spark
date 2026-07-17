# Sparespark - Product Roadmap

**Last Updated:** 2026-07-17  
**Status:** Core foundation complete | Production deployed  
**Live URL:** https://spark-two-flax.vercel.app  
**Repo:** https://github.com/Morpheous-cain/sparespark

---

## 📍 Current State (v0.3.0 - "Foundation Complete")

### What's Shipped
| Module | Routes | Key Features |
|--------|--------|--------------|
| **Auth** | `/auth/sign-in`, `/auth/sign-up`, `/auth/callback` | Email/password, magic link, phone OTP, role-based redirect |
| **Customer Dashboard** | `/customer/dashboard` | Active job tracker (real-time), stats, vehicles tab, jobs history |
| **Mechanic Dashboard** | `/mechanic/dashboard` | Job radar, active job actions, earnings chart, history, profile |
| **Landing Page** | `/` | Hero, How It Works (interactive phone), Services, Parts, Testimonials |
| **Supabase Realtime** | — | Job status updates, mechanic GPS tracking, live ETA |

### Tech Stack
- **Framework:** Next.js 15.5.20 (App Router) + React 19
- **Styling:** Tailwind CSS + shadcn/ui + 21st.dev components
- **Animations:** Framer Motion
- **Database/Realtime:** Supabase (PostgreSQL + Realtime)
- **Payments:** M-Pesa STK Push (to be integrated)
- **Deployment:** Vercel (auto-deploy on push)

---

## 🎯 Phase 1: Core Booking Flow (Week 1-2)

### 1.1 Create Booking Wizard `/customer/bookings/new`

**Multi-step form with progress indicator:**
```
Step 1: Service Type     → Emergency / Scheduled / Diagnostics / Body Work
Step 2: Location         → GPS auto-detect + manual pin + address search
Step 3: Vehicle          → Select saved vehicle or add new
Step 4: Details          → Description, photos (optional), preferred time
Step 5: Payment          → M-Pesa STK Push / Card / Wallet
Step 6: Confirmation     → Job created, mechanic matching starts
```

**Technical Requirements:**
- Use `@ruixen.ui/step-card` (already installed) for stepper UI
- Map integration: Leaflet/MapLibre for location picker
- Vehicle selector: dropdown from `/customer/vehicles` data
- Payment: M-Pesa STK Push via Supabase Edge Function
- On submit: Insert into `jobs` table with `status: PENDING`

### 1.2 Job Detail Page `/customer/bookings/[id]`

**Features:**
- Real-time status timeline (PENDING → MATCHED → ACCEPTED → EN_ROUTE → ARRIVED → IN_PROGRESS → COMPLETED)
- Mechanic profile card with tracking map
- Chat button (opens real-time chat)
- Call button
- Cancel job (if PENDING/MATCHED)
- Rate & review (when COMPLETED)

### 1.3 Mechanic Assignment Logic

**Matching Algorithm (run via Supabase cron/pg_cron):**
```
1. Find mechanics within service_radius_km of job.location
2. Filter: is_online = true, kyc_status = APPROVED
3. Score: distance (40%) + rating (30%) + current_load (20%) + specialization_match (10%)
4. Top 3 get notification → first to accept gets job
5. Timeout: 60s per mechanic → auto-escalate
```

---

## 🛍 Phase 2: Parts Marketplace (Week 2-3)

### 2.1 Parts Catalog `/customer/parts`

**Features:**
- Search with debounce + autocomplete
- Filters: category, vehicle make/model/year, price range, in-stock only
- Sort: price, popularity, delivery time
- Grid view (default) / List view toggle
- Product cards with: image, name, price, compatibility badge, "Add to Cart"

### 2.2 Cart & Checkout `/customer/parts/cart`

**Flow:**
1. Cart sidebar (slide-over) with quantity controls
2. Delivery address selection (saved addresses + new)
3. Delivery option: Doorstep / Mechanic location / Pickup point
4. Payment: M-Pesa / Card / Wallet
5. Order confirmation + tracking number

### 2.3 Admin Parts Management `/admin/parts`

**CRUD for:**
- Part categories, brands, compatibility matrix
- Inventory levels, pricing, discounts
- Image upload (Supabase Storage)

---

## 💬 Phase 3: Real-time Communication (Week 3-4)

### 3.1 In-App Chat

**Architecture:**
- Supabase `messages` table with RLS
- `job_id` foreign key, `sender_type` (customer/mechanic), `content`, `read_at`
- Realtime subscription per job
- Push notification when app backgrounded

**UI:**
- Floating chat button on job detail pages
- Full-screen modal with message history
- Image/location sharing
- Typing indicators

### 3.2 Push Notifications

**Events to notify:**
- Job assigned to mechanic
- Mechanic accepted job
- Mechanic en route (with ETA)
- Mechanic arrived
- Job completed (request rating)
- Payment confirmed
- Parts order updates

**Implementation:**
- Expo Push (mobile) + FCM (web)
- Supabase Edge Function triggers on table changes
- User preferences table for notification settings

---

## 👑 Phase 4: Platform & Admin (Week 4+)

### 4.1 Admin Dashboard `/admin`

**Sections:**
| Section | Features |
|---------|----------|
| **Jobs** | All jobs table, filters, manual assign, dispute resolution |
| **Mechanics** | KYC review, approval/rejection, suspension, earnings |
| **Customers** | Profiles, job history, support tickets |
| **Analytics** | Revenue, conversion funnel, retention, mechanic utilization |
| **Parts** | Inventory, orders, supplier mgmt |

### 4.2 Mechanic KYC Workflow

**Flow:**
1. Mechanic uploads: ID, license, certifications, insurance
2. Admin reviews → approve/reject with notes
3. On approve: `mechanic_profiles.kyc_status = APPROVED`
4. Auto-enable job radar access

### 4.3 Dynamic Pricing Engine

**Factors:**
- Base rate by service type
- Distance multiplier (per km)
- Time multiplier (night/weekend/holiday)
- Parts markup (configurable %)
- Surge pricing (demand > supply)

---

## 🔧 Technical Debt & Infrastructure

| Task | Effort | Priority |
|------|--------|----------|
| Push git history to GitHub | 5 min | High |
| Remove `/test-dashboard-final`, `/test-inline` | 5 min | Low |
| Add error boundaries (React) | 30 min | Medium |
| Add Sentry error tracking | 1 hr | Medium |
| E2E tests (Playwright) | 2 hrs | Medium |
| API rate limiting (Upstash/Redis) | 1 hr | Low |
| Database indexes for common queries | 30 min | Medium |
| Automated DB backups | 1 hr | Low |

---

## 📊 Success Metrics (KPIs)

| Metric | Target (Month 3) | Target (Month 6) |
|--------|------------------|------------------|
| **Weekly Active Customers** | 500 | 2,000 |
| **Weekly Active Mechanics** | 100 | 400 |
| **Job Completion Rate** | 90% | 95% |
| **Avg Response Time** | < 15 min | < 8 min |
| **Customer NPS** | 40 | 55 |
| **Revenue (KES/month)** | 500K | 2.5M |

---

## 🗓 Suggested Sprint Plan

### Sprint 1 (Week 1): Booking Flow MVP
- [ ] `/customer/bookings/new` stepper
- [ ] Location picker with map
- [ ] M-Pesa STK Push integration
- [ ] Job creation + real-time status

### Sprint 2 (Week 2): Job Detail + Mechanic Side
- [ ] `/customer/bookings/[id]` with tracking
- [ ] Mechanic job acceptance flow
- [ ] Chat foundation (types, table, RLS)

### Sprint 3 (Week 3): Parts + Chat
- [ ] Parts catalog with search/filter
- [ ] Cart + checkout
- [ ] Real-time chat MVP

### Sprint 4 (Week 4): Admin + Polish
- [ ] Admin dashboard skeleton
- [ ] KYC workflow
- [ ] Push notifications
- [ ] Error tracking + monitoring

---

## 🔗 Key Files to Modify Next

| Feature | Files to Create/Modify |
|---------|------------------------|
| Booking Wizard | `src/app/(customer)/customer/bookings/new/page.tsx` |
| Job Detail | `src/app/(customer)/customer/bookings/[id]/page.tsx` |
| Parts Catalog | `src/app/(customer)/customer/parts/page.tsx` |
| Cart | `src/app/(customer)/customer/parts/cart/page.tsx` |
| Chat | `src/components/chat/ChatModal.tsx`, `src/lib/supabase/realtime-chat.ts` |
| Admin | `src/app/(admin)/admin/dashboard/page.tsx` |
| Edge Functions | `supabase/functions/stk-push/`, `supabase/functions/push-notify/` |

---

## 💰 Revenue Model (for reference)

| Stream | Take Rate |
|--------|-----------|
| **Service Fee** | 15% of job total (min KES 200) |
| **Parts Marketplace** | 10% commission + KES 50 delivery fee |
| **Mechanic Subscription** | KES 2,000/month (priority jobs, analytics) |
| **Fleet/Enterprise** | Custom pricing |

---

*Roadmap is a living document. Update after each sprint based on learnings and user feedback.*