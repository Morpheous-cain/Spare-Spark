# Sparkflow — App Flow & User Journeys
**Version:** 1.0 | **Phase:** Preparation

---

## Flow A: Customer — Emergency Mechanic Booking

### A1. Onboarding (first-time)
```
Launch App
  → Phone number entry
  → Africa's Talking OTP
  → Profile setup (name, profile photo)
  → Add vehicle (reg number, make, model, year)
  → Location permission grant
  → Home screen
```

### A2. Emergency Booking Flow
```
Home Screen
  → Tap "Get Help Now" (emergency CTA)
  → Service type selection:
      [ Tyre Change | Jump Start | Tow | Breakdown Repair | Other ]
  → Problem description (optional free text + photo upload)
  → Location confirmation:
      - Auto-detect GPS (primary)
      - Manual pin drop / address search
  → Vehicle selection (from saved vehicles or quick-add)
  → Mechanic matching screen (animated, real-time):
      - Radius search: 5km → 10km → 20km (expanding)
      - Shows available mechanics on map
      - Displays ETA + distance + rating + price estimate
  → Select mechanic OR accept best match
  → Price quote review + approval
  → Payment method selection:
      [ M-Pesa STK Push | Card | Wallet Balance ]
  → M-Pesa: PIN prompt on phone → callback confirmation
  → Job created (status: ACCEPTED)
  → Live tracking screen:
      - Mechanic location dot on map
      - ETA countdown
      - Cancel option (within 2 min, no charge)
      - In-app chat button
  → Mechanic ARRIVED notification
  → Job IN_PROGRESS
  → Job COMPLETED notification
  → Rating prompt (1–5 stars + comment)
  → Receipt / transaction summary
```

### A3. Scheduled Booking Flow
```
Home Screen
  → "Book Mechanic"
  → Service type + description
  → Date/time picker
  → Location
  → Browse available mechanics (filtered by specialisation, rating, price)
  → View mechanic profile (reviews, certifications, services offered)
  → Select + confirm booking
  → Payment (escrow held until completion)
  → Calendar confirmation + reminder notification
```

### A4. Customer Home Screen Sections
- Active job tracker (if job in progress)
- Quick actions: Emergency | Book | Parts | History
- Recent mechanics (re-book shortcuts)
- Promotions / discount banners
- Spare parts shortcut

---

## Flow B: Mechanic — Job Acceptance & Availability Management

### B1. Mechanic Onboarding
```
Sign Up (phone OTP)
  → Role selection: "I am a mechanic"
  → Personal details (name, ID number, photo)
  → KYC upload: National ID front/back, selfie
  → Professional details:
      - Certifications (TVET cert, trade cert — upload)
      - Specialisations (multi-select)
      - Years of experience
      - Tools/equipment owned
  → Vehicle details (service vehicle reg)
  → Service radius setting (1–50km slider)
  → Bank account / M-Pesa number for payouts
  → Submit for review
  → KYC review (24–48h by Sparkflow dispatcher)
  → Approval notification → Verified badge applied
  → Onboarding complete
```

### B2. Availability Toggle & Job Radar
```
Mechanic Home (Dashboard)
  → Availability toggle: ONLINE / OFFLINE
  → When ONLINE:
      - Location broadcast starts (every 30s via Supabase Realtime)
      - Job radar active (listens for nearby job notifications)
  → Incoming job notification:
      - Push notification + in-app modal
      - Job details: type, distance, estimated payout, customer rating
      - Timer: 90 seconds to ACCEPT or DECLINE
      - On timeout: job offered to next mechanic
  → ACCEPT:
      - Navigation starts (Google Maps deep-link or in-app)
      - Status → EN_ROUTE
      - Customer notified
  → Arrive at location:
      - Tap "I've Arrived"
      - Status → ARRIVED
  → Begin work:
      - Tap "Start Job"
      - Status → IN_PROGRESS
      - Can add parts used, labour notes
  → Complete job:
      - Tap "Mark Complete"
      - Photo evidence upload (optional, required for disputes)
      - Customer confirms OR auto-confirm after 15 min
      - Status → COMPLETED
  → Payout triggered (M-Pesa B2C to mechanic account)
```

### B3. Mechanic Dashboard Sections
- Availability toggle (prominent)
- Active job card (if assigned)
- Today's earnings summary
- Pending payouts
- Job history + ratings received
- Notifications inbox
- Profile & document management

### B4. Mechanic Job Management
```
Jobs Tab
  → Active (current job)
  → Upcoming (scheduled bookings)
  → Completed (history with earnings)
  → Disputed (flagged for review)
```

---

## Flow C: Spare Parts Ordering Workflow

### C1. Parts Discovery
```
Home → "Parts" tab
  → Search bar (part name, OBD code, vehicle model)
  → OR browse categories:
      [ Engine | Tyres | Brakes | Electrical | Body | Fluids | Filters ]
  → Filter by:
      - Vehicle compatibility (auto-filter if vehicle set)
      - Supplier location / delivery radius
      - Price range
      - Brand
      - Availability (in-stock vs. order)
  → Part listing card:
      - Image, name, price, supplier, rating, delivery ETA
  → Part detail page:
      - Full specs, compatibility list
      - Supplier profile + rating
      - Reviews
      - "Add to Cart" / "Request Quote"
```

### C2. Parts Checkout
```
Cart review
  → Delivery address (map pin or saved address)
  → Delivery time slot (same-day, next-day, scheduled)
  → Price breakdown (parts + delivery fee + platform fee)
  → Payment method:
      [ M-Pesa STK Push | Card | Wallet ]
  → Order confirmation
  → Supplier notified
  → Order status tracking:
      CONFIRMED → PACKED → DISPATCHED → DELIVERED
  → Delivery confirmation (customer OTP or photo)
  → Rating prompt for supplier
```

### C3. Mechanic Parts Request (In-Job Flow)
```
Job IN_PROGRESS
  → Mechanic taps "Request Parts"
  → Searches required parts
  → Shares part list with customer (in-job chat or notification)
  → Customer approves + pays for parts
  → Supplier dispatches to job location
  → Parts delivery tracked on shared job screen
```

### C4. Supplier Dashboard
```
Supplier Portal (Web)
  → Inventory management (add/edit/remove parts)
  → Incoming orders queue
  → Order fulfillment flow (confirm → pack → dispatch)
  → Earnings + payout history
  → Reviews received
```

---

## Flow D: Payment & Rating System

### D1. Payment Methods
| Method | Flow |
|---|---|
| M-Pesa STK Push | STK prompt → customer enters PIN → Daraja callback → job proceeds |
| Card (Flutterwave) | Flutterwave inline payment widget → webhook confirmation |
| Wallet | Instant deduction from Sparkflow wallet balance |
| Wallet Top-Up | M-Pesa / card → credited to wallet |

### D2. Payment Lifecycle
```
Customer approves quote
  → Platform fee calculated (Sparkflow takes X%)
  → Payment initiated (STK or card)
  → On success: funds held in escrow (Sparkflow account)
  → Job COMPLETED + confirmed
  → Escrow released:
      - Mechanic receives net amount (M-Pesa B2C, 24h SLA)
      - Sparkflow retains platform fee
  → Transaction record created (both parties can see)
```

### D3. Refund / Dispute Flow
```
Customer raises dispute within 24h of job completion
  → Dispute reason + evidence (photos, notes)
  → Dispatcher reviews (target: 48h SLA)
  → Resolution options:
      - Full refund → funds returned to original payment method
      - Partial refund → split settlement
      - No refund → mechanic paid in full
  → Both parties notified of outcome
  → Escrow released per decision
```

### D4. Rating System
```
Post-Job (triggered on COMPLETED)
  → Customer rates mechanic: 1–5 stars + written review (optional)
  → Mechanic rates customer: 1–5 stars (internal, affects priority)
  → Both submitted within 48h window (auto-closes after)
  → Mechanic overall rating = rolling average (last 50 ratings)
  → Rating displayed on profile + affects search rank
  → Below 3.5 avg → dispatcher review triggered
  → Below 3.0 (sustained) → account suspension review
```

### D5. Notifications Map
| Event | Customer | Mechanic | Supplier |
|---|---|---|---|
| Job created | ✅ confirmation | ✅ new job alert | — |
| Mechanic accepted | ✅ ETA + name | — | — |
| Mechanic en route | ✅ tracking active | — | — |
| Mechanic arrived | ✅ push | — | — |
| Job completed | ✅ receipt + rate prompt | ✅ payout initiated | — |
| Parts order confirmed | ✅ | — | ✅ |
| Parts dispatched | ✅ tracking link | — | — |
| Parts delivered | ✅ | — | ✅ |
| Payment failed | ✅ retry prompt | — | — |
| Payout sent | — | ✅ M-Pesa message | ✅ |
| Dispute raised | ✅ | ✅ | — |
| Dispute resolved | ✅ | ✅ | — |
