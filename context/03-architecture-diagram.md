# Sparkflow — Architecture Diagram
**Version:** 1.0 | **Phase:** Preparation

---

## System Architecture

```mermaid
graph TB
    subgraph CLIENT["Client Layer"]
        WEB["Web App\nNext.js 15\n(Vercel)"]
        MOB["Mobile App\nExpo React Native\n(iOS + Android)"]
        ADM["Admin Panel\nNext.js 15\n(Vercel)"]
    end

    subgraph API["API Layer (Railway)"]
        EXPRESS["Express API\nNode.js / Express\n/api/v1/*"]
        MIDDLEWARE["Middleware\nAuth · Rate Limit\nLogging · CORS"]
    end

    subgraph SUPABASE["Supabase (Database Layer)"]
        AUTH["Supabase Auth\nPhone OTP · JWT"]
        DB["PostgreSQL\nCore Data"]
        REALTIME["Realtime\nChannels"]
        STORAGE["Storage\nPhotos · Docs"]
        RLS["Row Level Security"]
    end

    subgraph SERVICES["Internal Services"]
        JOB_ENGINE["Job Engine\nMatching · Lifecycle"]
        PAYMENT_SVC["Payment Service\nEscrow · Payouts"]
        NOTIF_SVC["Notification Service\nPush · SMS"]
        TRACK_SVC["Tracking Service\nLocation Broadcast"]
    end

    subgraph EXTERNAL["External Services"]
        MPESA["M-Pesa Daraja\nSTK Push · B2C"]
        FLUTTERWAVE["Flutterwave\nCard Payments"]
        GMAPS["Google Maps Platform\nGeocoding · Distance\nDirections · Places"]
        AT["Africa's Talking\nSMS · OTP"]
        FCM["Firebase Cloud\nMessaging (FCM)"]
        EXPO_PUSH["Expo Push\nNotifications"]
        KYC["Smile Identity\nKYC / ID Verify"]
    end

    %% Client to API
    WEB -->|REST /api/v1| EXPRESS
    MOB -->|REST /api/v1| EXPRESS
    ADM -->|REST /api/v1| EXPRESS

    %% Client to Supabase (direct for auth + realtime)
    WEB -->|Supabase JS SDK| AUTH
    MOB -->|Supabase JS SDK| AUTH
    WEB <-->|Realtime WS| REALTIME
    MOB <-->|Realtime WS| REALTIME

    %% API to Middleware
    EXPRESS --- MIDDLEWARE

    %% API to Internal Services
    EXPRESS --> JOB_ENGINE
    EXPRESS --> PAYMENT_SVC
    EXPRESS --> NOTIF_SVC
    EXPRESS --> TRACK_SVC

    %% Internal Services to Supabase
    JOB_ENGINE --> DB
    PAYMENT_SVC --> DB
    NOTIF_SVC --> DB
    TRACK_SVC --> REALTIME
    TRACK_SVC --> DB

    %% Supabase internals
    DB --- RLS
    AUTH --> DB

    %% Internal Services to External
    PAYMENT_SVC --> MPESA
    PAYMENT_SVC --> FLUTTERWAVE
    JOB_ENGINE --> GMAPS
    NOTIF_SVC --> AT
    NOTIF_SVC --> FCM
    NOTIF_SVC --> EXPO_PUSH
    EXPRESS --> KYC

    %% Storage
    EXPRESS --> STORAGE
    MOB --> STORAGE

    %% M-Pesa Callback
    MPESA -->|Webhook callback| EXPRESS
    FLUTTERWAVE -->|Webhook| EXPRESS
```

---

## Real-Time Communication Pattern

```mermaid
sequenceDiagram
    participant C as Customer App
    participant API as Express API
    participant DB as Supabase DB
    participant RT as Supabase Realtime
    participant M as Mechanic App

    C->>API: POST /jobs (create emergency job)
    API->>DB: Insert job record (status: PENDING)
    API->>RT: Broadcast to mechanics:nearby channel
    M->>RT: Subscribed to mechanics:nearby
    RT-->>M: New job notification payload
    M->>API: POST /jobs/:id/accept
    API->>DB: Update job (status: ACCEPTED, mechanic_id)
    API->>RT: Broadcast to job:{id} channel
    RT-->>C: Job accepted, mechanic details

    loop Every 30s while EN_ROUTE
        M->>API: PATCH /mechanics/location
        API->>DB: Upsert mechanic_locations
        API->>RT: Broadcast to tracking:{job_id}
        RT-->>C: Updated mechanic lat/lng
    end
```

---

## Payment Flow

```mermaid
sequenceDiagram
    participant C as Customer
    participant API as Express API
    participant DB as Supabase DB
    participant MP as M-Pesa Daraja
    participant M as Mechanic

    C->>API: POST /payments/initiate (job_id, method: mpesa)
    API->>DB: Create transaction (status: PENDING)
    API->>MP: STK Push request (amount, phone)
    MP-->>C: PIN prompt on phone
    C->>MP: Customer enters M-Pesa PIN
    MP->>API: POST /payments/mpesa/callback
    API->>DB: Update transaction (status: ESCROWED, mpesa_ref)
    API->>DB: Update job (payment_status: PAID)
    Note over API,DB: Funds held in escrow

    Note over C,M: Job proceeds...

    C->>API: POST /jobs/:id/confirm-complete
    API->>DB: Update job (status: COMPLETED)
    API->>MP: B2C payout to mechanic
    MP-->>M: M-Pesa payment received
    API->>DB: Update transaction (status: SETTLED)
```

---

## Service-to-Service Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      REQUEST LIFECYCLE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Client Request                                                  │
│       │                                                          │
│       ▼                                                          │
│  [Express Middleware]                                            │
│  ├─ JWT Verification (Supabase public key)                       │
│  ├─ Role extraction from JWT claims                              │
│  ├─ Rate limiting (redis-like via Supabase or Upstash)           │
│  └─ Request logging                                              │
│       │                                                          │
│       ▼                                                          │
│  [Route Handler]                                                 │
│  ├─ Input validation (Zod schemas)                               │
│  ├─ Business logic                                               │
│  └─ Service calls (Job Engine, Payment Svc, etc.)                │
│       │                                                          │
│       ▼                                                          │
│  [Supabase Client (service role)]                                │
│  ├─ DB read/write (bypasses RLS for backend ops)                 │
│  ├─ Realtime broadcasts                                          │
│  └─ Storage operations                                           │
│       │                                                          │
│       ▼                                                          │
│  Response → Client                                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Infrastructure Map

```
┌─────────────────────────────────────────────────────┐
│  PRODUCTION INFRASTRUCTURE                           │
│                                                      │
│  ┌──────────────┐    ┌──────────────┐               │
│  │  Vercel       │    │  Railway      │               │
│  │  - Web App    │    │  - Express API│               │
│  │  - Admin      │    │  - Env vars   │               │
│  │  - Edge CDN   │    │  - Auto-scale │               │
│  └──────────────┘    └──────────────┘               │
│                                                      │
│  ┌──────────────────────────────────────┐           │
│  │  Supabase Cloud                       │           │
│  │  - PostgreSQL (primary + read replica)│           │
│  │  - Auth server                        │           │
│  │  - Realtime server                    │           │
│  │  - Storage (S3-compatible)            │           │
│  │  - Edge Functions (webhooks, crons)   │           │
│  └──────────────────────────────────────┘           │
│                                                      │
│  ┌──────────────┐    ┌──────────────┐               │
│  │  GitHub       │    │  Sentry       │               │
│  │  Actions CI   │    │  Error Track  │               │
│  │  - Test       │    │  - API        │               │
│  │  - Build      │    │  - Web        │               │
│  │  - Deploy     │    │  - Mobile     │               │
│  └──────────────┘    └──────────────┘               │
│                                                      │
└─────────────────────────────────────────────────────┘
```
