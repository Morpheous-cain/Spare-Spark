# Sparkflow — API Specifications
**Base URL:** `https://api.sparkflow.co.ke/api/v1`
**Auth:** Bearer JWT (Supabase-issued) on all protected endpoints
**Version:** 1.0 | **Phase:** Preparation

---

## Conventions

- Dates: ISO 8601 (`2026-07-16T10:30:00Z`)
- Coordinates: `{ lat: number, lng: number }`
- Errors: `{ error: string, code: string, details?: object }`
- Pagination: `?page=1&limit=20` → `{ data: [], total, page, limit, pages }`
- Prefix private/admin endpoints: roles enforced via middleware

---

## 1. Auth

### POST `/auth/send-otp`
Send OTP to phone number.
```json
// Request
{ "phone": "+254712345678" }

// Response 200
{ "message": "OTP sent", "expires_in": 300 }
```

### POST `/auth/verify-otp`
Verify OTP and return session.
```json
// Request
{ "phone": "+254712345678", "otp": "123456" }

// Response 200
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "user": { "id": "uuid", "phone": "+254712345678", "role": "customer" }
}
```

### POST `/auth/refresh`
```json
// Request
{ "refresh_token": "eyJ..." }

// Response 200
{ "access_token": "eyJ...", "expires_in": 3600 }
```

---

## 2. Profile & Onboarding

### GET `/me`
```json
// Response 200
{
  "id": "uuid",
  "phone": "+254712345678",
  "email": "user@email.com",
  "full_name": "John Kamau",
  "role": "customer",
  "avatar_url": "https://...",
  "is_verified": true,
  "created_at": "2026-07-16T10:00:00Z"
}
```

### PATCH `/me`
```json
// Request (partial update)
{ "full_name": "John Kamau", "email": "john@email.com" }

// Response 200 — updated profile object
```

### POST `/me/avatar`
- `Content-Type: multipart/form-data`
- Field: `file` (image/jpeg, image/png, max 5MB)
- Response: `{ "avatar_url": "https://..." }`

---

## 3. Vehicles

### GET `/vehicles`
```json
// Response 200
{
  "data": [
    {
      "id": "uuid",
      "reg_number": "KCA 123A",
      "make": "Toyota",
      "model": "Premio",
      "year": 2019,
      "color": "Silver",
      "is_default": true
    }
  ]
}
```

### POST `/vehicles`
```json
// Request
{
  "reg_number": "KCA 123A",
  "make": "Toyota",
  "model": "Premio",
  "year": 2019,
  "color": "Silver"
}

// Response 201 — vehicle object
```

### PATCH `/vehicles/:id`
### DELETE `/vehicles/:id`

---

## 4. Emergency Mechanic Booking

### POST `/jobs` ⭐
Create a job (emergency or scheduled).
```json
// Request
{
  "type": "emergency",                    // "emergency" | "scheduled"
  "service_category": "tyre_change",     // enum: see below
  "description": "Front left tyre flat on Thika Road",
  "vehicle_id": "uuid",
  "location": {
    "lat": -1.2921,
    "lng": 36.8219,
    "address": "Thika Road, near Garden City Mall, Nairobi"
  },
  "scheduled_at": null,                  // ISO datetime if type=scheduled
  "photos": ["https://storage.url/..."] // optional evidence photos
}

// service_category enum:
// tyre_change | jump_start | tow | engine_repair | brake_repair
// electrical | ac_repair | body_repair | diagnosis | general | other

// Response 201
{
  "id": "uuid",
  "status": "PENDING",
  "estimated_mechanics_notified": 5,
  "price_estimate": { "min": 500, "max": 1500, "currency": "KES" },
  "created_at": "2026-07-16T10:30:00Z"
}
```

### GET `/jobs`
Customer's job history.
```json
// Query params: ?status=COMPLETED&page=1&limit=10
// Response 200 — paginated list
```

### GET `/jobs/:id`
```json
// Response 200
{
  "id": "uuid",
  "status": "EN_ROUTE",
  "service_category": "tyre_change",
  "description": "Front left tyre flat",
  "vehicle": { "id": "uuid", "make": "Toyota", "model": "Premio", "reg_number": "KCA 123A" },
  "location": { "lat": -1.2921, "lng": 36.8219, "address": "..." },
  "mechanic": {
    "id": "uuid",
    "full_name": "Peter Mwangi",
    "phone": "+254700000000",
    "avatar_url": "https://...",
    "rating": 4.8,
    "eta_minutes": 12,
    "current_location": { "lat": -1.2900, "lng": 36.8100 }
  },
  "quote": { "amount": 1000, "currency": "KES", "breakdown": { "labour": 800, "platform_fee": 200 } },
  "payment_status": "ESCROWED",
  "created_at": "2026-07-16T10:30:00Z",
  "accepted_at": "2026-07-16T10:32:00Z"
}
```

### DELETE `/jobs/:id` — Cancel job
```json
// Request
{ "reason": "Found another mechanic" }

// Response 200
{ "message": "Job cancelled", "refund_status": "initiated" }
```

### POST `/jobs/:id/confirm-complete`
Customer confirms job done (releases escrow).
```json
// Response 200
{ "message": "Job confirmed complete", "payout_initiated": true }
```

---

## 5. Mechanic Job Management

### GET `/mechanic/jobs`
```json
// Query: ?status=PENDING|ACCEPTED|COMPLETED
// Response 200 — paginated mechanic's job list
```

### GET `/mechanic/jobs/available`
Nearby pending jobs (mechanic must be ONLINE).
```json
// Response 200
{
  "data": [
    {
      "id": "uuid",
      "service_category": "tyre_change",
      "distance_km": 2.3,
      "estimated_payout": 850,
      "currency": "KES",
      "location_hint": "Thika Road, near Garden City",
      "customer_rating": 4.5,
      "posted_at": "2026-07-16T10:30:00Z",
      "expires_at": "2026-07-16T10:31:30Z"
    }
  ]
}
```

### POST `/mechanic/jobs/:id/accept`
```json
// Response 200
{
  "job_id": "uuid",
  "status": "ACCEPTED",
  "navigation_url": "https://maps.google.com/?daddr=-1.2921,36.8219"
}
```

### POST `/mechanic/jobs/:id/decline`
```json
// Request
{ "reason": "too_far" }  // too_far | busy | other
// Response 200
```

### PATCH `/mechanic/jobs/:id/status`
Update job progress status.
```json
// Request
{ "status": "EN_ROUTE" }   // EN_ROUTE | ARRIVED | IN_PROGRESS | COMPLETED
// On COMPLETED, evidence photos required if dispute_protection=true

// Response 200 — updated job object
```

### POST `/mechanic/jobs/:id/evidence`
Upload completion evidence.
- `Content-Type: multipart/form-data`
- Fields: `photos[]` (up to 5 images)

### GET `/mechanic/availability`
```json
// Response 200
{ "is_online": true, "last_seen": "2026-07-16T10:30:00Z" }
```

### PATCH `/mechanic/availability`
```json
// Request
{ "is_online": true }
// Response 200
```

### PATCH `/mechanic/location` ⭐ (high-frequency)
```json
// Request (called every 30s while online)
{ "lat": -1.2900, "lng": 36.8100, "heading": 270 }
// Response 200 — { "received": true }
```

---

## 6. Mechanic Profile

### GET `/mechanic/profile`
### PATCH `/mechanic/profile`
```json
// Request
{
  "specialisations": ["tyre_change", "electrical", "engine_repair"],
  "service_radius_km": 15,
  "bio": "10 years experience, TVET certified",
  "mpesa_number": "+254712345678"
}
```

### POST `/mechanic/documents`
KYC document upload.
```json
// Multipart: type (national_id_front|national_id_back|selfie|certificate), file
// Response 201
{ "document_id": "uuid", "status": "PENDING_REVIEW" }
```

---

## 7. Spare Parts

### GET `/parts`
```json
// Query: ?q=brake+pads&category=brakes&vehicle_make=Toyota&vehicle_model=Premio&page=1
// Response 200
{
  "data": [
    {
      "id": "uuid",
      "name": "Front Brake Pads — Toyota Premio 2019",
      "category": "brakes",
      "brand": "Bosch",
      "price": 2500,
      "currency": "KES",
      "in_stock": true,
      "stock_qty": 8,
      "supplier": {
        "id": "uuid",
        "name": "AutoZone Nairobi",
        "rating": 4.6,
        "location": "Industrial Area, Nairobi"
      },
      "delivery_eta_hours": 4,
      "images": ["https://..."]
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 20
}
```

### GET `/parts/:id`
Full part details.

### GET `/parts/categories`
```json
// Response 200
{ "categories": ["engine", "tyres", "brakes", "electrical", "body", "fluids", "filters", "other"] }
```

### POST `/parts/orders` ⭐
```json
// Request
{
  "items": [
    { "part_id": "uuid", "quantity": 2 }
  ],
  "delivery_address": {
    "lat": -1.2921,
    "lng": 36.8219,
    "address": "Garden City Mall, Thika Road"
  },
  "delivery_slot": "same_day",     // same_day | next_day | scheduled
  "scheduled_delivery_at": null,
  "job_id": null                   // link to a job if in-job parts request
}

// Response 201
{
  "order_id": "uuid",
  "status": "PENDING_PAYMENT",
  "total": 5200,
  "breakdown": { "parts": 5000, "delivery": 200 },
  "currency": "KES",
  "payment_url": null             // set after payment initiation
}
```

### GET `/parts/orders`
```json
// Query: ?status=DELIVERED&page=1
```

### GET `/parts/orders/:id`
```json
// Response 200
{
  "id": "uuid",
  "status": "DISPATCHED",
  "items": [...],
  "supplier": { "id": "uuid", "name": "AutoZone Nairobi" },
  "delivery_address": {...},
  "tracking": {
    "dispatched_at": "2026-07-16T12:00:00Z",
    "estimated_delivery": "2026-07-16T16:00:00Z",
    "driver_name": "Samuel",
    "driver_phone": "+254700000000"
  },
  "total": 5200,
  "currency": "KES"
}
```

---

## 8. Payment Processing

### POST `/payments/initiate` ⭐
```json
// Request
{
  "reference_type": "job",           // "job" | "parts_order" | "wallet_topup"
  "reference_id": "uuid",
  "method": "mpesa",                 // "mpesa" | "card" | "wallet"
  "amount": 1000,
  "currency": "KES",
  "phone": "+254712345678"           // required for mpesa
}

// Response 200
{
  "transaction_id": "uuid",
  "status": "PENDING",
  "method": "mpesa",
  "mpesa_checkout_request_id": "ws_CO_...",   // for STK push polling
  "message": "Check your phone for M-Pesa prompt"
}
```

### GET `/payments/status/:transaction_id`
Poll payment status.
```json
// Response 200
{
  "transaction_id": "uuid",
  "status": "ESCROWED",            // PENDING | ESCROWED | SETTLED | FAILED | REFUNDED
  "mpesa_ref": "OEI2AK4XXX",
  "amount": 1000,
  "currency": "KES",
  "paid_at": "2026-07-16T10:35:00Z"
}
```

### POST `/payments/mpesa/callback` (internal — Safaricom IP only)
Daraja STK Push result callback.
```json
// Daraja payload (handled internally, not exposed to clients)
// On success: update transaction → ESCROWED, trigger job flow
// On failure: update transaction → FAILED, notify customer
```

### POST `/payments/flutterwave/webhook` (internal)
Flutterwave payment webhook.

### GET `/payments/history`
```json
// Query: ?type=payment|payout&page=1
// Response 200 — paginated transaction list
```

### POST `/payments/disputes`
Raise a payment dispute.
```json
// Request
{
  "job_id": "uuid",
  "reason": "Work not completed as described",
  "evidence_urls": ["https://..."]
}

// Response 201
{ "dispute_id": "uuid", "status": "OPEN", "sla_hours": 48 }
```

---

## 9. Real-Time Tracking

### GET `/tracking/:job_id`
Get current mechanic location for a job.
```json
// Response 200
{
  "mechanic_id": "uuid",
  "lat": -1.2900,
  "lng": 36.8100,
  "heading": 270,
  "eta_minutes": 8,
  "updated_at": "2026-07-16T10:32:30Z"
}
```

**Realtime (Supabase channel):**
```
Channel: tracking:{job_id}
Event: location_update
Payload: { lat, lng, heading, eta_minutes, timestamp }
```

---

## 10. In-App Messaging

### GET `/jobs/:id/messages`
```json
// Response 200
{
  "data": [
    {
      "id": "uuid",
      "job_id": "uuid",
      "sender_id": "uuid",
      "sender_role": "customer",
      "content": "How far are you?",
      "content_type": "text",       // "text" | "image"
      "image_url": null,
      "sent_at": "2026-07-16T10:33:00Z",
      "read_at": "2026-07-16T10:33:05Z"
    }
  ]
}
```

### POST `/jobs/:id/messages`
```json
// Request
{
  "content": "I'm 5 minutes away",
  "content_type": "text",
  "image_url": null
}
// Response 201 — message object
```

**Realtime (Supabase channel):**
```
Channel: messages:{job_id}
Event: new_message
Payload: message object
```

---

## 11. Ratings

### POST `/jobs/:id/rating`
```json
// Request
{
  "rating": 5,
  "comment": "Very professional and fast",
  "rated_party": "mechanic"    // "mechanic" | "customer"
}

// Response 201
{ "review_id": "uuid", "message": "Rating submitted" }
```

### GET `/mechanics/:id/reviews`
```json
// Response 200
{
  "mechanic_id": "uuid",
  "average_rating": 4.8,
  "total_reviews": 127,
  "data": [
    {
      "id": "uuid",
      "rating": 5,
      "comment": "Fixed my tyre in 20 minutes. Highly recommend.",
      "reviewer_name": "J. K.",   // anonymised
      "service_category": "tyre_change",
      "created_at": "2026-07-10T09:00:00Z"
    }
  ]
}
```

---

## 12. Admin (role: admin | dispatcher)

### GET `/admin/jobs` — All jobs with filters
### PATCH `/admin/jobs/:id/status` — Force status change
### GET `/admin/mechanics` — All mechanic profiles
### PATCH `/admin/mechanics/:id/verify` — Approve/reject KYC
### GET `/admin/disputes` — Open disputes
### PATCH `/admin/disputes/:id/resolve`
```json
// Request
{
  "resolution": "full_refund",      // full_refund | partial_refund | no_refund
  "refund_amount": 1000,
  "notes": "Mechanic did not complete the work"
}
```
### GET `/admin/analytics/summary` — Revenue, jobs, active mechanics

---

## Error Codes

| Code | HTTP | Description |
|---|---|---|
| `AUTH_REQUIRED` | 401 | Missing or invalid JWT |
| `FORBIDDEN` | 403 | Role not permitted |
| `NOT_FOUND` | 404 | Resource not found |
| `JOB_NOT_AVAILABLE` | 409 | Job already taken |
| `PAYMENT_FAILED` | 402 | M-Pesa or card failure |
| `KYC_PENDING` | 403 | Mechanic not yet verified |
| `VEHICLE_REQUIRED` | 422 | No vehicle linked to account |
| `LOCATION_REQUIRED` | 422 | GPS coordinates missing |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Unhandled server error |
