# Sparkflow — Design Document
**Project:** Sparkflow — On-Demand Mechanic Services Platform
**Version:** 1.0 | **Phase:** Preparation
**Owner:** Immersicloud Consulting
**Date:** 2026-07-16
**Status:** Pre-Development

---

## 1. Overview

Sparkflow is an on-demand automotive emergency services marketplace connecting vehicle owners with verified mechanics and spare parts suppliers. Core model: Uber Eats for roadside repairs and parts delivery.

**Primary verticals:**
- Emergency roadside assistance (tyre change, jump-start, tow)
- On-site mechanical diagnosis and repair
- Spare parts sourcing and delivery

---

## 2. System Architecture

### 2.1 Architecture Pattern
- **Frontend:** Next.js 15 App Router (SSR/CSR hybrid)
- **Backend:** Node.js/Express REST API (separate service, not Next.js API routes)
- **Database:** Supabase (PostgreSQL + Auth + Realtime + Storage)
- **Mobile:** Expo React Native (separate repo, shared API)
- **Real-time:** Supabase Realtime channels (job status, mechanic location, chat)
- **Maps:** Google Maps Platform (Places, Directions, Distance Matrix, Geocoding)
- **Payments:** M-Pesa Daraja STK Push (primary), Flutterwave (card fallback)
- **Push Notifications:** Expo Push Notifications / Firebase Cloud Messaging
- **File Storage:** Supabase Storage (profile photos, vehicle docs, job evidence)
- **SMS/OTP:** Africa's Talking (KE-native, cheaper than Twilio)

### 2.2 Deployment Targets
| Service | Platform |
|---|---|
| Next.js Web App | Vercel |
| Express API | Railway or Render |
| Supabase | Supabase Cloud (KE region proxied via EU) |
| Expo Mobile | EAS Build → App Store / Play Store |

### 2.3 Repository Structure
```
sparkflow/
├── apps/
│   ├── web/          # Next.js customer + admin web
│   └── mobile/       # Expo React Native (customer + mechanic)
├── api/              # Node.js/Express backend
├── packages/
│   ├── shared/       # Types, utils, constants (shared across apps)
│   └── ui/           # shadcn/ui component library (web)
└── supabase/
    ├── migrations/
    ├── seed/
    └── functions/    # Supabase Edge Functions
```

---

## 3. Core Components

### 3.1 User Roles
| Role | Description |
|---|---|
| `customer` | Vehicle owner requesting services |
| `mechanic` | Verified service provider |
| `parts_supplier` | Parts vendor/dealer |
| `dispatcher` | Internal Sparkflow ops (job assignment, escalation) |
| `admin` | Immersicloud/Sparkflow platform admin |

### 3.2 Service Modules
| Module | Responsibility |
|---|---|
| Auth | Supabase Auth (OTP/phone + email), role assignment |
| Job Engine | Job lifecycle: creation → assignment → completion |
| Matching Engine | Geospatial mechanic-to-job matching |
| Parts Marketplace | Inventory listing, search, order management |
| Payment Gateway | M-Pesa STK, Flutterwave, wallet, escrow |
| Tracking | Real-time mechanic GPS broadcast via Supabase Realtime |
| Messaging | In-app chat per job thread (Supabase Realtime) |
| Rating & Review | Post-job mutual ratings |
| Notifications | Push + SMS for job events |
| Admin Panel | Verification, disputes, analytics |

### 3.3 Job Lifecycle States
```
DRAFT → PENDING → MATCHED → ACCEPTED → EN_ROUTE → ARRIVED → IN_PROGRESS → COMPLETED
                                                                          ↓
                                                                       CANCELLED / DISPUTED
```

---

## 4. Data Models (Logical)

### 4.1 Core Entities
- **User** — base auth record (Supabase Auth)
- **Profile** — extended user data, role-specific
- **Vehicle** — customer's registered vehicles
- **MechanicProfile** — certifications, specialisations, service radius, rating
- **Job** — service request with location, type, status, assignment
- **JobBid** — mechanic's bid/offer on a job (for non-emergency marketplace)
- **Part** — parts catalogue entry (supplier-owned)
- **PartOrder** — customer order for parts
- **Transaction** — payment record (M-Pesa ref, Flutterwave ref, wallet)
- **Message** — in-job chat message
- **Review** — post-job rating (customer → mechanic, mechanic → customer)
- **MechanicLocation** — real-time ephemeral location (separate table, high-write)
- **Notification** — push/SMS log

### 4.2 Key Relationships
```
User (1) → Profile (1)
User (1) → Vehicle (many)
User (1) → MechanicProfile (0..1)
Job (many) → Vehicle (1)
Job (1) → MechanicProfile (0..1)       -- assigned mechanic
Job (1) → JobBid (many)
Job (1) → Transaction (1..many)
Job (1) → Message (many)
Job (1) → Review (0..2)               -- one per party
PartOrder (many) → Part (1)
PartOrder (1) → Transaction (1)
```

---

## 5. Third-Party Integrations

### 5.1 Maps — Google Maps Platform
- **Geocoding API:** address → lat/lng on job creation
- **Distance Matrix API:** mechanic distance + ETA to job
- **Directions API:** navigation for mechanic en-route
- **Places API:** customer address autocomplete
- **Maps JavaScript SDK:** web map (job map, live tracking)
- **Maps React Native SDK:** mobile map

### 5.2 Payments
| Provider | Use Case | Integration Method |
|---|---|---|
| M-Pesa Daraja | STK Push, B2C payouts to mechanics | REST (OAuth2 + callbacks) |
| Flutterwave | Card payments, international | Flutterwave Node SDK |
| Sparkflow Wallet | Balance top-up, instant pay | Internal ledger on Supabase |

### 5.3 Communications
| Provider | Use Case |
|---|---|
| Africa's Talking | SMS OTP, job alerts (KE-native) |
| Expo Push | Mobile push notifications |
| FCM | Android fallback |

### 5.4 Verification
| Provider | Use Case |
|---|---|
| NTSA / Third-party KRA API | Vehicle registration lookup (if available) |
| Smile Identity / Onfido | Mechanic KYC / ID verification |
| Manual Review | Certifications (TVET, auto-body certs) |

---

## 6. Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| Web Frontend | Next.js 15 App Router | SSR for SEO, unified web/admin |
| Mobile | Expo React Native | Immersicloud standard, shared TS types |
| API | Node.js / Express | Team familiarity, REST consistency |
| Database | Supabase (PostgreSQL) | Auth, Realtime, RLS, Storage out-of-box |
| ORM | Prisma (optional) / Supabase client | Type-safe queries |
| State (Web) | Zustand + React Query | Lightweight, server sync |
| Maps | Google Maps Platform | Coverage, reliability in KE |
| Payments | M-Pesa Daraja + Flutterwave | Immersicloud payment standard |
| SMS | Africa's Talking | KE-native, cost-effective |
| Notifications | Expo Push + FCM | Cross-platform |
| File Storage | Supabase Storage | Integrated with auth/RLS |
| Infra | Vercel + Railway | Low-ops, scalable |
| CI/CD | GitHub Actions | Automated test + deploy |
| Monitoring | Sentry + Vercel Analytics | Error tracking + web vitals |

---

## 7. Security Considerations

- Supabase RLS on all tables — users only access their own data
- Mechanic profiles publicly readable; PII excluded from public views
- Job details readable only to assigned parties + dispatcher/admin
- M-Pesa callback endpoints IP-whitelisted to Safaricom ranges
- API rate limiting on job creation and STK Push endpoints
- Phone number verification required before any booking
- Mechanic KYC gate before first job acceptance
- JWT expiry: 1h access token, 7d refresh (Supabase default, configurable)
