# Sparespark — Preparation Phase Checklist
**Version:** 1.0 | **Phase:** Preparation
**Owner:** Immersicloud Consulting

---

## Status Key
`[ ]` Pending | `[~]` In Progress | `[x]` Done | `[!]` Blocked

---

## 1. Domain & Branding

| # | Task | Owner | Notes |
|---|---|---|---|
| 1.1 | `[ ]` Register domain `sparespark.co.ke` (or preferred) | Issa | Check kenic.or.ke |
| 1.2 | `[ ]` Set up DNS on Cloudflare | Issa | Proxy Vercel + Railway |
| 1.3 | `[ ]` Configure `api.sparkflow.co.ke` CNAME → Railway | Issa | |
| 1.4 | `[ ]` Create brand assets: logo, colour palette, typography | Design | Needed for app + web |
| 1.5 | `[ ]` Register business name with CAK (if needed) | Legal | For M-Pesa paybill |

---

## 2. Third-Party API Accounts

### 2.1 Payments

| # | Task | Owner | Priority |
|---|---|---|---|
| 2.1.1 | `[ ]` Register Safaricom Daraja account at developer.safaricom.co.ke | Issa | Critical |
| 2.1.2 | `[ ]` Create Daraja app, obtain Consumer Key + Secret | Issa | Critical |
| 2.1.3 | `[ ]` Obtain M-Pesa Paybill or Till number (live) | Issa | Critical — needs KRA pin, business reg |
| 2.1.4 | `[ ]` Test STK Push in Daraja sandbox | Dev | Before dev phase |
| 2.1.5 | `[ ]` Register Flutterwave merchant account (flutterwave.com) | Issa | For card fallback |
| 2.1.6 | `[ ]` Obtain Flutterwave API keys (test + live) | Issa | |
| 2.1.7 | `[ ]` Configure M-Pesa B2C for mechanic payouts | Issa | Needs Daraja B2C approval |

### 2.2 Maps

| # | Task | Owner | Priority |
|---|---|---|---|
| 2.2.1 | `[ ]` Create Google Cloud project at console.cloud.google.com | Issa | Critical |
| 2.2.2 | `[ ]` Enable APIs: Maps JS, Maps iOS, Maps Android, Geocoding, Distance Matrix, Directions, Places | Issa | |
| 2.2.3 | `[ ]` Generate API keys: web-restricted, iOS-restricted, Android-restricted, server-unrestricted | Issa | Separate keys per surface |
| 2.2.4 | `[ ]` Set up billing alert (Maps costs can spike) | Issa | Set $200/mo alert |
| 2.2.5 | `[ ]` Estimate monthly Maps cost based on projected job volume | Issa | Document in budget |

### 2.3 SMS & Notifications

| # | Task | Owner | Priority |
|---|---|---|---|
| 2.3.1 | `[ ]` Create Africa's Talking account at africastalking.com | Issa | Critical |
| 2.3.2 | `[ ]` Register SMS sender ID (e.g. SPARKFLOW) | Issa | 5 business days |
| 2.3.3 | `[ ]` Obtain AT API key + username | Issa | |
| 2.3.4 | `[ ]` Create Firebase project for FCM | Dev | Needed for push |
| 2.3.5 | `[ ]` Download Firebase service account JSON | Dev | Store in Railway env vars |

### 2.4 KYC / Identity Verification

| # | Task | Owner | Priority |
|---|---|---|---|
| 2.4.1 | `[ ]` Evaluate: Smile Identity vs Onfido vs manual review (cost vs complexity) | Issa | |
| 2.4.2 | `[ ]` Create Smile Identity account (if selected) — smileidentity.com | Issa | |
| 2.4.3 | `[ ]` Define KYC flow: what docs required, SLA for manual review | Issa | |
| 2.4.4 | `[ ]` Define interim manual review process (dispatcher reviews uploads) | Issa | Use manual for MVP |

---

## 3. Infrastructure Setup

| # | Task | Owner | Priority |
|---|---|---|---|
| 3.1 | `[ ]` Create Supabase project (EU region is closest to KE) | Issa | Critical |
| 3.2 | `[ ]` Enable PostGIS extension in Supabase | Dev | Required for geo queries |
| 3.3 | `[ ]` Configure Supabase Auth: phone provider (Twilio or AT) | Dev | |
| 3.4 | `[ ]` Create Supabase Storage buckets: avatars, documents, job-evidence, parts-images | Dev | |
| 3.5 | `[ ]` Set up Vercel project, connect GitHub repo | Dev | |
| 3.6 | `[ ]` Set up Railway project for Express API | Dev | |
| 3.7 | `[ ]` Configure environment variables in Vercel + Railway | Dev | See env var list below |
| 3.8 | `[ ]` Set up GitHub repository (monorepo structure) | Dev | |
| 3.9 | `[ ]` Set up GitHub Actions workflows: CI (lint + test), CD (Vercel auto-deploy, Railway auto-deploy) | Dev | |
| 3.10 | `[ ]` Create Sentry project (web + api + mobile) and obtain DSNs | Dev | |
| 3.11 | `[ ]` Configure Supabase realtime replication (jobs, messages, mechanic_locations) | Dev | |

---

## 4. Environment Variables Checklist

### API (Railway)
```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_ANON_KEY=
MPESA_CONSUMER_KEY=
MPESA_CONSUMER_SECRET=
MPESA_SHORTCODE=
MPESA_PASSKEY=
MPESA_CALLBACK_URL=https://api.sparkflow.co.ke/api/v1/payments/mpesa/callback
MPESA_B2C_INITIATOR=
MPESA_B2C_INITIATOR_PASSWORD=
FLUTTERWAVE_SECRET_KEY=
FLUTTERWAVE_PUBLIC_KEY=
FLUTTERWAVE_WEBHOOK_SECRET=
GOOGLE_MAPS_SERVER_KEY=
AFRICAS_TALKING_API_KEY=
AFRICAS_TALKING_USERNAME=
FIREBASE_SERVICE_ACCOUNT_JSON=
SENTRY_DSN=
JWT_SECRET=                       # Supabase JWT secret for verification
PLATFORM_FEE_PERCENT=10           # Configurable commission
NODE_ENV=production
PORT=3000
```

### Web App (Vercel)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_GOOGLE_MAPS_WEB_KEY=
NEXT_PUBLIC_API_BASE_URL=https://api.sparkflow.co.ke/api/v1
NEXT_PUBLIC_SENTRY_DSN=
```

### Mobile (Expo EAS Secrets)
```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_GOOGLE_MAPS_IOS_KEY=
EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_KEY=
EXPO_PUBLIC_API_BASE_URL=
```

---

## 5. Development Environment

| # | Task | Owner |
|---|---|---|
| 5.1 | `[ ]` Initialize monorepo (Turborepo or Nx) | Dev |
| 5.2 | `[ ]` Bootstrap `apps/web` — Next.js 15 with App Router | Dev |
| 5.3 | `[ ]` Bootstrap `apps/mobile` — Expo SDK 52+ | Dev |
| 5.4 | `[ ]` Bootstrap `api/` — Express with TypeScript | Dev |
| 5.5 | `[ ]` Set up `packages/shared` — shared TypeScript types | Dev |
| 5.6 | `[ ]` Install shadcn/ui in web app | Dev |
| 5.7 | `[ ]` Configure Zod for request validation in API | Dev |
| 5.8 | `[ ]` Configure ESLint + Prettier (shared config) | Dev |
| 5.9 | `[ ]` Add Supabase migration tooling (`supabase/` directory) | Dev |
| 5.10 | `[ ]` Run initial migrations (enums, tables, RLS policies, triggers) | Dev |
| 5.11 | `[ ]` Seed development data (test mechanics, vehicles, parts) | Dev |

---

## 6. Team Roles & Responsibilities

| Role | Responsibilities | Person |
|---|---|---|
| **Tech Lead / Architect** | Architecture decisions, code review, API design, Supabase setup | Issa |
| **Full-Stack Dev (Web)** | Next.js web app, admin panel | TBD / Issa |
| **Mobile Dev** | Expo React Native — customer + mechanic app | TBD |
| **Backend Dev** | Express API routes, service integrations | Issa / TBD |
| **QA** | Test plans, manual + automated testing | TBD |
| **Dispatcher (Ops)** | KYC reviews, dispute resolution | Client ops hire |
| **Designer** | UI/UX for web + mobile | TBD / Issa |

---

## 7. Legal & Compliance

| # | Task | Owner | Notes |
|---|---|---|---|
| 7.1 | `[ ]` Draft Terms of Service for platform | Issa / Legal | Required before launch |
| 7.2 | `[ ]` Draft Privacy Policy (GDPR-adjacent / Kenya DPA 2019) | Legal | |
| 7.3 | `[ ]` Draft Mechanic Service Agreement (commission terms, KYC consent) | Legal | |
| 7.4 | `[ ]` Confirm platform liability scope (insurance for mechanics?) | Legal | |
| 7.5 | `[ ]` Confirm M-Pesa compliance requirements for marketplace model | Issa | Safaricom may require specific business type |

---

## 8. Pre-Development Decisions (Resolve Before Sprint 1)

| Decision | Options | Recommended | Deadline |
|---|---|---|---|
| KYC Provider | Manual vs Smile Identity vs Onfido | **Manual for MVP** (dispatcher reviews uploads) | Before backend sprint |
| Mechanic matching | Auto-assign closest vs bid model | **Auto-assign for emergency, bid for scheduled** | Architecture finalized |
| Commission model | % of job vs flat fee | **% model (configurable)** — `PLATFORM_FEE_PERCENT` env var | Before payment integration |
| Wallet implementation | Internal ledger vs M-Pesa wallet | **Internal Supabase ledger** (simpler) | Before payment sprint |
| Chat infrastructure | Supabase Realtime vs Pusher vs socket.io | **Supabase Realtime** (no extra cost, already integrated) | Architecture finalized |
| Location broadcast | Supabase Realtime vs custom WS | **Supabase Realtime** on `mechanic_locations` table | Architecture finalized |
| Parts delivery | Own delivery fleet vs 3rd-party courier | **3rd-party (Sendy/Glovo) for MVP** | Before parts sprint |
| Admin panel | Separate Next.js app vs embedded in web | **Separate route group** `/admin/*` in same web app | Before frontend sprint |

---

## 9. Milestones to Gate Phase 1

Before development sprint 1 begins, confirm all of the following:

- [ ] Domain registered and DNS active
- [ ] Supabase project created with PostGIS enabled
- [ ] Daraja sandbox credentials obtained and STK Push tested manually (Postman)
- [ ] Africa's Talking account active, sender ID approved
- [ ] Google Maps API keys generated (all surfaces)
- [ ] GitHub monorepo initialized and pushed
- [ ] All environment variables loaded in Railway + Vercel
- [ ] Initial Supabase migrations run (schema live in dev)
- [ ] All pre-development decisions resolved (section 8)
- [ ] Design document reviewed and signed off by stakeholders

---

## 10. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| M-Pesa B2C approval delayed | Medium | High | Build with STK only first; add B2C in Phase 2 |
| NTSA vehicle lookup API unavailable | High | Low | Manual vehicle entry; skip verification for MVP |
| Google Maps costs exceed budget | Medium | Medium | Implement location caching; use Distance Matrix sparingly |
| Mechanic supply shortage at launch | High | High | Pre-recruit and verify 20+ mechanics before soft launch |
| PostGIS geo query performance | Low | Medium | Index on GIST, test with 1000+ mechanic rows early |
| KYC manual review bottleneck | Medium | Medium | Hire part-time dispatcher before launch; set 48h SLA |
