# Sparespark — Client & Mechanic Dashboards Design Specification

**Version:** 1.0 | **Date:** 2026-07-16 | **Status:** Approved for Implementation

---

## 1. Overview

Build complete authenticated web application for Sparespark (Uber for mechanics in Kenya) with:
- **Customer Dashboard**: Booking, tracking, parts marketplace, vehicles, profile
- **Mechanic Dashboard**: Job radar, active jobs, earnings, availability, KYC
- **Shared Auth**: Sign in/up with email/password + phone OTP
- **Real-time**: Supabase Realtime for job tracking, chat, location updates
- **Payments**: M-Pesa STK Push + Flutterwave card fallback
- **Maps**: Google Maps for tracking & navigation

---

## 2. Color System (Orange/Amber Brand)

```css
/* Primitive Tokens */
--color-orange-50: #fff7ed;
--color-orange-100: #ffedd5;
--color-orange-200: #fed7aa;
--color-orange-300: #fdba74;
--color-orange-400: #fb923c;
--color-orange-500: #f97316;  /* Primary */
--color-orange-600: #ea580c;
--color-orange-700: #c2410c;
--color-orange-800: #9a3412;
--color-orange-900: #7c2d12;

--color-amber-50: #fffbeb;
--color-amber-100: #fef3c7;
--color-amber-200: #fde68a;
--color-amber-300: #fcd34d;
--color-amber-400: #fbbf24;   /* Secondary/Accent */
--color-amber-500: #f59e0b;
--color-amber-600: #d97706;
--color-amber-700: #b45309;
--color-amber-800: #92400e;
--color-amber-900: #78350f;

/* Semantic Tokens */
--color-primary: var(--color-orange-500);
--color-primary-hover: var(--color-orange-600);
--color-primary-light: var(--color-orange-100);
--color-secondary: var(--color-amber-500);
--color-secondary-hover: var(--color-amber-600);
--color-success: #16a34a;
--color-warning: var(--color-amber-500);
--color-destructive: #dc2626;
--color-background: #ffffff;
--color-surface: #fafafa;
--color-border: #e5e5e5;

/* Dark Mode */
.dark {
  --color-background: #0c0a09;
  --color-surface: #1c1917;
  --color-border: #44403c;
  --color-primary-light: #7c2d12;
}
```

---

## 3. Route Structure (Next.js 15 App Router)

### Route Groups
```
src/app/
├── (auth)/
│   ├── sign-in/page.tsx
│   ├── sign-up/page.tsx
│   └── callback/route.ts
├── (customer)/
│   ├── layout.tsx
│   ├── page.tsx                    # Dashboard overview
│   ├── bookings/
│   │   ├── page.tsx                # Booking history
│   │   ├── new/page.tsx            # New booking (emergency/scheduled)
│   │   └── [id]/page.tsx           # Booking detail + tracking
│   ├── vehicles/
│   │   ├── page.tsx                # Vehicle list
│   │   └── new/page.tsx            # Add vehicle
│   ├── parts/
│   │   ├── page.tsx                # Marketplace
│   │   ├── cart/page.tsx           # Shopping cart
│   │   ├── checkout/page.tsx       # Checkout with M-Pesa
│   │   └── orders/page.tsx         # Order history
│   ├── profile/page.tsx
│   └── settings/page.tsx
├── (mechanic)/
│   ├── layout.tsx
│   ├── page.tsx                    # Dashboard overview
│   ├── jobs/
│   │   ├── page.tsx                # Job radar (available)
│   │   ├── active/page.tsx         # Current active job
│   │   ├── history/page.tsx        # Completed jobs
│   │   └── [id]/page.tsx           # Job detail
│   ├── availability/page.tsx
│   ├── earnings/page.tsx
│   ├── profile/
│   │   ├── page.tsx
│   │   └── kyc/page.tsx
│   └── settings/page.tsx
├── api/
│   ├── auth/
│   ├── jobs/
│   ├── payments/
│   ├── parts/
│   └── webhooks/
├── components/
│   ├── ui/                         # shadcn/ui components
│   ├── auth/
│   ├── customer/
│   ├── mechanic/
│   ├── shared/
│   └── maps/
├── lib/
│   ├── supabase/
│   ├── utils.ts
│   ├── animations.ts               # Framer Motion variants
│   └── hooks/
├── hooks/
├── types/
└── middleware.ts
```

---

## 4. Hero Section Redesign

### New Hero Structure
```tsx
<section className="relative min-h-[90vh] flex items-center overflow-hidden">
  {/* Animated Background */}
  <div className="absolute inset-0">
    <motion.div 
      className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent"
      animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
    />
    {/* Floating Orbs */}
    <motion.div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl"
      animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
      transition={{ duration: 15, repeat: Infinity }}
    />
    <motion.div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl"
      animate={{ x: [0, -50, 0], y: [0, 30, 0] }}
      transition={{ duration: 18, repeat: Infinity, delay: 2 }}
    />
  </div>

  {/* Content */}
  <div className="relative z-10 container mx-auto px-4 py-24">
    <motion.div variants={containerVariants} className="text-center max-w-4xl mx-auto">
      {/* Badge */}
      <motion.span variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 text-orange-700 text-sm font-medium mb-6 border border-orange-200">
        <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
        Kenya's #1 On-Demand Mechanic Service
      </motion.span>

      {/* Headline */}
      <motion.h1 variants={fadeInUp} className="mb-6 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
        Your Car Broke Down?
        <br className="hidden sm:inline" />
        <span className="bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 bg-clip-text text-transparent">
          We'll Come to You
        </span>
      </motion.h1>

      {/* Subheadline */}
      <motion.p variants={fadeInUp} className="mb-8 max-w-2xl mx-auto text-lg sm:text-xl text-gray-600 leading-relaxed">
        Flat tyre? Dead battery? Engine trouble? Tap the app and a verified mechanic 
        arrives in minutes — tracked live, paid via M-Pesa, guaranteed quality.
      </motion.p>

      {/* Stats Bar */}
      <motion.div variants={fadeInUp} className="mb-10 flex flex-wrap items-center justify-center gap-8 sm:gap-12 text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="font-medium">Active in Nairobi, Mombasa, Kisumu</span>
        </div>
        <div className="w-px h-8 bg-gray-200" />
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-green-500" />
          <span className="font-medium">5,000+ Verified Mechanics</span>
        </div>
        <div className="w-px h-8 bg-gray-200" />
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
          <span className="font-medium">4.9★ Average Rating</span>
        </div>
      </motion.div>

      {/* CTA Buttons */}
      <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="group relative px-8 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-lg font-semibold overflow-hidden"
        >
          <span className="relative flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Get Started Free
          </span>
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-orange-600 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity"
          />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          variant="outline"
          className="px-8 py-4 rounded-xl border-2 border-orange-500 text-orange-600 text-lg font-semibold hover:bg-orange-50 transition-colors"
        >
          <Play className="mr-2 h-5 w-5" />
          Watch Demo
        </motion.button>
      </motion.div>

      {/* Trust Indicators */}
      <motion.div variants={fadeInUp} className="mt-16 flex flex-wrap items-center justify-center gap-6 text-gray-500 text-sm">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <span>No membership fees</span>
        </div>
        <div className="w-px h-6 bg-gray-200" />
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <span>Pay after service</span>
        </div>
        <div className="w-px h-6 bg-gray-200" />
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <span>24/7 Emergency support</span>
        </div>
      </motion.div>
    </motion.div>

    {/* Floating Phone Mockup */}
    <motion.div
      variants={floatIn}
      className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-full max-w-md sm:max-w-lg md:max-w-xl pointer-events-none"
    >
      <div className="relative mx-auto" style={{ width: '320px', aspectRatio: '9/19.5' }}>
        <div className="absolute inset-0 bg-gray-900 rounded-[40px] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.4)]" />
        <div className="absolute inset-4 bg-gray-50 rounded-[36px] p-1 flex flex-col items-center justify-between">
          {/* Dynamic status bar */}
          <div className="flex items-center justify-between px-4 py-2 text-xs text-gray-500">
            <span>9:41</span>
            <div className="flex items-center gap-1">
              <div className="w-6 h-3 bg-green-500 rounded-full flex items-center justify-start p-0.5">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
            </div>
          </div>
          {/* App content preview */}
          <div className="flex-1 flex items-center justify-center px-4">
            <div className="w-full bg-white rounded-2xl p-4 shadow-lg max-h-64 overflow-hidden">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center">
                  <Car className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Mechanic En Route</h3>
                <p className="text-gray-500 text-sm mb-4">Peter Mwangi • 4.9★</p>
                <div className="bg-orange-50 rounded-xl p-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Distance</span>
                    <span className="font-semibold text-orange-600">2.3 km</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-gray-600">ETA</span>
                    <span className="font-semibold text-orange-600">8 min</span>
                  </div>
                </div>
                <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
                    animate={{ width: ['0%', '65%', '65%'] }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                  />
                </div>
              </div>
            </div>
          </div>
          {/* Home indicator */}
          <div className="w-24 h-1.5 bg-gray-300 rounded-full mx-auto mb-2" />
        </div>
      </div>
    </motion.div>
  </div>
</section>
```

---

## 5. "How It Works" — Enhanced Visual Section

### Structure: 4-Step Interactive Timeline
```tsx
<section id="how-it-works" className="py-24 bg-gradient-to-b from-gray-50 to-white">
  <div className="container mx-auto px-4">
    {/* Header */}
    <motion.div variants={fadeInUp} className="text-center mb-16 max-w-3xl mx-auto">
      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 text-orange-700 text-sm font-medium mb-4 border border-orange-100">
        How It Works
      </span>
      <h2 className="mb-4 text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900">
        Get Help in <span className="text-orange-500">3 Simple Steps</span>
      </h2>
      <p className="text-lg text-gray-600">
        From breakdown to back on the road — we handle everything so you don't have to.
      </p>
    </motion.div>

    {/* Interactive Steps */}
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
      className="relative"
    >
      {/* Connecting Line */}
      <div className="hidden md:block absolute top-20 left-1/2 -translate-x-1/2 w-1 h-[calc(100%-5rem)] bg-gradient-to-b from-orange-200 via-orange-300 to-amber-200" />

      {/* Step 1: Request Help */}
      <motion.div
        variants={itemVariants}
        className="relative md:w-1/2 md:pl-20 pr-8"
      >
        <div className="relative">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative bg-white rounded-2xl p-8 shadow-lg border border-gray-100 h-full"
          >
            {/* Step Badge */}
            <div className="absolute -top-4 left-8 w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-white">
              1
            </div>

            {/* Icon */}
            <div className="mb-6 w-16 h-16 rounded-xl bg-orange-50 flex items-center justify-center mx-auto">
              <Phone className="h-8 w-8 text-orange-500" />
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Request Help</h3>
            <p className="text-gray-600 mb-6 text-center leading-relaxed">
              Open the app and tap <span className="font-semibold text-orange-600">"Get Help Now"</span> for emergencies 
              or schedule a service for later. Select your issue: flat tyre, jump start, tow, or diagnostics.
            </p>

            {/* Feature highlights */}
            <div className="space-y-3">
              {[
                { icon: Zap, text: "Emergency dispatch in < 60 seconds" },
                { icon: MapPin, text: "Auto-detect location or drop pin" },
                { icon: Car, text: "Select your saved vehicle" },
                { icon: CreditCard, text: "M-Pesa, Card, or Wallet payment" }
              ].map((feature) => (
                <motion.div
                  whileHover={{ x: 4 }}
                  key={feature.text}
                  className="flex items-center gap-3 text-sm text-gray-600"
                >
                  <feature.icon className="h-5 w-5 text-orange-500" />
                  <span>{feature.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Step 2: Track Mechanic */}
      <motion.div
        variants={itemVariants}
        style={{ transitionDelay: '0.1s' }}
        className="relative md:w-1/2 md:pr-20 pl-8 mt-16 md:mt-0"
      >
        <div className="relative">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative bg-white rounded-2xl p-8 shadow-lg border border-gray-100 h-full"
          >
            <div className="absolute -top-4 right-8 w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-white">
              2
            </div>

            <div className="mb-6 w-16 h-16 rounded-xl bg-orange-50 flex items-center justify-center mx-auto">
              <MapPin className="h-8 w-8 text-orange-500" />
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Track Your Mechanic</h3>
            <p className="text-gray-600 mb-6 text-center leading-relaxed">
              Watch your mechanic approach in real-time on the map. See their live location, 
              accurate ETA, and profile with ratings. Chat or call directly from the app.
            </p>

            {/* Mini Map Preview */}
            <div className="aspect-square bg-gray-100 rounded-xl relative overflow-hidden mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-100 to-amber-100" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Car className="h-12 w-12 text-orange-500 animate-[float_3s_ease-in-out_infinite]" />
              </div>
              <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur rounded-lg px-3 py-2 text-center text-sm">
                <span className="text-gray-600">Peter Mwangi • </span>
                <span className="font-semibold text-orange-600">3 min away</span>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { icon: Eye, text: "Live GPS tracking on map" },
                { icon: Clock, text: "Real-time ETA updates" },
                { icon: MessageSquare, text: "In-app chat & direct call" },
                { icon: Shield, text: "Verified mechanic profiles" }
              ].map((feature) => (
                <motion.div
                  whileHover={{ x: 4 }}
                  key={feature.text}
                  className="flex items-center gap-3 text-sm text-gray-600"
                >
                  <feature.icon className="h-5 w-5 text-orange-500" />
                  <span>{feature.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Step 3: Service Complete */}
      <motion.div
        variants={itemVariants}
        style={{ transitionDelay: '0.2s' }}
        className="relative md:w-1/2 md:pl-20 pr-8 mt-16 md:mt-0"
      >
        <div className="relative">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative bg-white rounded-2xl p-8 shadow-lg border border-gray-100 h-full"
          >
            <div className="absolute -top-4 left-8 w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-white">
              3
            </div>

            <div className="mb-6 w-16 h-16 rounded-xl bg-orange-50 flex items-center justify-center mx-auto">
              <Wrench className="h-8 w-8 text-orange-500" />
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Service Complete</h3>
            <p className="text-gray-600 mb-6 text-center leading-relaxed">
              Mechanic arrives, diagnoses, and fixes the issue. Review photos, approve 
              completion, and pay securely via M-Pesa STK Push or card. Rate your experience.
            </p>

            <div className="space-y-3">
              {[
                { icon: Camera, text: "Before/after photos for transparency" },
                { icon: CreditCard, text: "Secure M-Pesa & card payments" },
                { icon: Star, text: "Rate & review your mechanic" },
                { icon: Receipt, text: "Digital receipt & service history" }
              ].map((feature) => (
                <motion.div
                  whileHover={{ x: 4 }}
                  key={feature.text}
                  className="flex items-center gap-3 text-sm text-gray-600"
                >
                  <feature.icon className="h-5 w-5 text-orange-500" />
                  <span>{feature.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Step 4: Parts & Ongoing */}
      <motion.div
        variants={itemVariants}
        style={{ transitionDelay: '0.3s' }}
        className="relative md:w-1/2 md:pr-20 pl-8 mt-16 md:mt-0"
      >
        <div className="relative">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative bg-white rounded-2xl p-8 shadow-lg border border-gray-100 h-full"
          >
            <div className="absolute -top-4 right-8 w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-white">
              4
            </div>

            <div className="mb-6 w-16 h-16 rounded-xl bg-orange-50 flex items-center justify-center mx-auto">
              <Package className="h-8 w-8 text-orange-500" />
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Parts & Ongoing Care</h3>
            <p className="text-gray-600 mb-6 text-center leading-relaxed">
              Need spare parts? Order genuine components delivered to you or your mechanic. 
              Schedule regular maintenance, access service history, and re-book favorite mechanics.
            </p>

            <div className="space-y-3">
              {[
                { icon: ShoppingBag, text: "Genuine parts marketplace" },
                { icon: Truck, text: "Doorstep or mechanic delivery" },
                { icon: Calendar, text: "Schedule maintenance reminders" },
                { icon: Heart, text: "Re-book trusted mechanics" }
              ].map((feature) => (
                <motion.div
                  whileHover={{ x: 4 }}
                  key={feature.text}
                  className="flex items-center gap-3 text-sm text-gray-600"
                >
                  <feature.icon className="h-5 w-5 text-orange-500" />
                  <span>{feature.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>

    {/* Mobile Stepper */}
    <div className="md:hidden mt-12">
      <div className="flex overflow-x-auto snap-x pb-4 -mx-4 px-4 space-x-4">
        {[
          { num: 1, title: "Request", icon: Phone, color: "from-orange-500 to-amber-500" },
          { num: 2, title: "Track", icon: MapPin, color: "from-orange-500 to-amber-500" },
          { num: 3, title: "Service", icon: Wrench, color: "from-orange-500 to-amber-500" },
          { num: 4, title: "Parts", icon: Package, color: "from-orange-500 to-amber-500" }
        ].map((step) => (
          <motion.div
            key={step.num}
            whileHover={{ scale: 1.02 }}
            className="flex-shrink-0 w-72 snap-start bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br text-white flex items-center justify-center font-bold">
                {step.num}
              </div>
              <step.icon className="h-6 w-6 text-orange-500" />
            </div>
            <h4 className="font-bold text-gray-900 mb-2">{step.title} Help</h4>
            <p className="text-sm text-gray-600">
              {step.num === 1 && "Tap for emergency or schedule"}
              {step.num === 2 && "Live GPS tracking & chat"}
              {step.num === 3 && "On-site repair & payment"}
              {step.num === 4 && "Parts delivery & maintenance"}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
</section>
```

---

## 6. Navigation & Toast System

### Working Navigation Links
```tsx
// components/shared/Header.tsx
const navLinks = [
  { href: '/customer/dashboard', label: 'Dashboard', roles: ['customer'] },
  { href: '/customer/bookings', label: 'My Bookings', roles: ['customer'] },
  { href: '/customer/vehicles', label: 'Vehicles', roles: ['customer'] },
  { href: '/customer/parts', label: 'Parts', roles: ['customer'] },
  { href: '/mechanic/dashboard', label: 'Dashboard', roles: ['mechanic'] },
  { href: '/mechanic/jobs', label: 'Job Radar', roles: ['mechanic'] },
  { href: '/mechanic/earnings', label: 'Earnings', roles: ['mechanic'] },
];

// Middleware handles role-based redirects automatically
```

### Toast System with Real Actions
```tsx
// lib/hooks/use-toast.ts
export function useToast() {
  return {
    toast: ({ title, description, action, variant }) => {
      // Integrates with Sonner or custom toast
      // action: { label: 'View Booking', onClick: () => router.push('/customer/bookings/123') }
    }
  }
}

// Usage examples:
// Booking created → toast with "View Booking" link
// Mechanic accepted → toast with "Track Live" link  
// Payment failed → toast with "Retry Payment" action
// Parts delivered → toast with "View Order" link
```

---

## 7. Customer Dashboard Pages

### 7.1 Dashboard Overview (`/customer/dashboard`)
```tsx
// Server Component - fetches user data
export default async function CustomerDashboard() {
  const { user, activeBooking, vehicles, stats } = await getCustomerData();
  
  return (
    <DashboardLayout user={user}>
      {/* Active Job Card - Full Width */}
      {activeBooking && (
        <motion.section variants={fadeInUp} className="mb-8">
          <ActiveJobCard booking={activeBooking} />
        </motion.section>
      )}
      
      {/* Stats Grid */}
      <motion.div variants={containerVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard label="Active Jobs" value={stats.activeJobs} icon={Wrench} trend="+2 this week" />
        <StatCard label="Vehicles" value={vehicles.length} icon={Car} />
        <StatCard label="Total Spent" value={formatCurrency(stats.totalSpent)} icon={CreditCard} />
        <StatCard label="Rating" value={`${stats.rating}★`} icon={Star} />
      </motion.div>
      
      {/* Quick Actions */}
      <motion.div variants={containerVariants} className="grid gap-4 md:grid-cols-3 mb-8">
        <QuickActionCard 
          title="Emergency Help" 
          desc="Get help now for breakdowns"
          icon={AlertTriangle}
          href="/customer/bookings/new?type=emergency"
          color="orange"
        />
        <QuickActionCard 
          title="Schedule Service" 
          desc="Book maintenance in advance"
          icon={Calendar}
          href="/customer/bookings/new?type=scheduled"
          color="amber"
        />
        <QuickActionCard 
          title="Order Parts" 
          desc="Browse genuine spare parts"
          icon={Package}
          href="/customer/parts"
          color="green"
        />
      </motion.div>
      
      {/* Recent Bookings */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Recent Bookings</h2>
          <Link href="/customer/bookings" className="text-orange-600 hover:underline text-sm">View all</Link>
        </div>
        <motion.div variants={containerVariants} className="space-y-3">
          {recentBookings.map(booking => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </motion.div>
      </section>
    </DashboardLayout>
  )
}
```

### 7.2 New Booking Flow (`/customer/bookings/new`)
- **Step 1**: Emergency vs Scheduled toggle
- **Step 2**: Service category (with visual cards)
- **Step 3**: Location (map + address autocomplete)
- **Step 4**: Vehicle selection (with add new)
- **Step 5**: Price estimate + payment method
- **Step 6**: Confirmation → real-time matching screen

### 7.3 Booking Detail + Tracking (`/customer/bookings/[id]`)
- **Header**: Status badge, service type, mechanic info
- **Map**: Full-screen Google Map with live mechanic marker
- **Timeline**: Visual progress (Requested → Matched → En Route → Arrived → In Progress → Complete)
- **Chat**: Real-time messaging with mechanic
- **Actions**: Call, Cancel (within 2 min), Confirm Completion

### 7.4 Vehicles (`/customer/vehicles`)
- List with default badge, edit/delete, set default
- Add vehicle modal: reg number, make, model, year, color
- VIN scanner (camera) for auto-fill

### 7.5 Parts Marketplace (`/customer/parts`)
- Search/filter sidebar (category, brand, vehicle compatibility, price)
- Grid/List toggle
- Product cards with image, price, stock, seller rating
- Cart slide-over panel
- Checkout with M-Pesa/Card/Wallet

---

## 8. Mechanic Dashboard Pages

### 8.1 Dashboard Overview (`/mechanic/dashboard`)
```tsx
export default async function MechanicDashboard() {
  const { mechanic, activeJob, stats, todayEarnings } = await getMechanicData();
  
  return (
    <DashboardLayout user={mechanic}>
      {/* Availability Toggle - Prominent */}
      <motion.div variants={fadeInUp} className="mb-8">
        <AvailabilityToggle 
          isOnline={mechanic.is_online}
          onToggle={handleAvailabilityToggle}
          radius={mechanic.service_radius_km}
        />
      </motion.div>
      
      {/* Active Job Card */}
      {activeJob && (
        <motion.section variants={fadeInUp} className="mb-8">
          <ActiveJobCardMechanic job={activeJob} />
        </motion.section>
      )}
      
      {/* Stats Grid */}
      <motion.div variants={containerVariants} className="grid gap-4 md:grid-cols-4 mb-8">
        <StatCard label="Today's Earnings" value={formatCurrency(todayEarnings)} icon={DollarSign} trend="+15% vs yesterday" />
        <StatCard label="Jobs This Week" value={stats.jobsThisWeek} icon={Wrench} />
        <StatCard label="Rating" value={`${mechanic.rating_avg}★`} icon={Star} trend={`${mechanic.rating_count} reviews`} />
        <StatCard label="Completion Rate" value={`${stats.completionRate}%`} icon={CheckCircle} />
      </motion.div>
      
      {/* Quick Actions */}
      <motion.div variants={containerVariants} className="grid gap-4 md:grid-cols-3 mb-8">
        <QuickActionCard title="Job Radar" desc="View nearby jobs" icon={Radar} href="/mechanic/jobs" color="orange" />
        <QuickActionCard title="Earnings" desc="View detailed earnings" icon={DollarSign} href="/mechanic/earnings" color="green" />
        <QuickActionCard title="Availability" desc="Update schedule & radius" icon={Settings} href="/mechanic/availability" color="amber" />
      </motion.div>
    </DashboardLayout>
  )
}
```

### 8.2 Job Radar (`/mechanic/jobs`)
- Map view with pending job markers (color-coded by distance)
- List view with: service type, distance, estimated payout, customer rating, 90s timer
- Accept/Decline buttons with haptic feedback
- Filter by service type, distance, payout range

### 8.3 Active Job (`/mechanic/jobs/active`)
- Navigation button (opens Google Maps)
- Status progression: En Route → Arrived → In Progress → Complete
- Chat with customer
- Evidence upload (photos)
- Parts request (if needed during job)

### 8.4 Availability (`/mechanic/availability`)
- Online/Offline toggle (large, prominent)
- Service radius slider (1-50km)
- Working hours scheduler
- Specialisation tags
- Break timer

### 8.5 Earnings (`/mechanic/earnings`)
- Chart: Daily/Weekly/Monthly (Recharts with Framer Motion)
- Pending payouts with M-Pesa status
- Payout history
- Bank account / M-Pesa number management

### 8.6 KYC Profile (`/mechanic/profile/kyc`)
- Document upload: ID Front, ID Back, Selfie, Certificates
- Status badges: Pending → Under Review → Approved/Rejected
- Progress stepper
- Rejection reasons with resubmit option

---

## 9. Framer Motion Animation Library

```typescript
// lib/animations.ts
export const animations = {
  // Page transitions
  pageTransition: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  
  // Staggered containers
  staggerContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    }
  },
  
  // Card entrance
  cardEntrance: {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
    }
  },
  
  // Button interactions
  buttonHover: { scale: 1.02 },
  buttonTap: { scale: 0.98 },
  
  // Map marker
  markerPulse: {
    scale: [1, 1.3, 1],
    transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
  },
  
  // Progress ring
  progressRing: {
    strokeDashoffset: [251, 0],
    transition: { duration: 1, ease: 'easeOut' }
  },
  
  // Toast slide
  toastSlide: {
    initial: { x: 300, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 300, opacity: 0 },
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  
  // Modal
  modalOverlay: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  modalContent: {
    initial: { opacity: 0, scale: 0.95, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: 20 },
    transition: { duration: 0.2, ease: 'easeOut' }
  },
  
  // List item
  listItem: {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } }
  }
};
```

---

## 10. Real-Time Features

### Supabase Channels
```typescript
// hooks/use-realtime-job.ts
export function useRealtimeJob(jobId: string) {
  const [job, setJob] = useState<Job>();
  const [mechanicLocation, setMechanicLocation] = useState<Location>();
  const [messages, setMessages] = useState<Message[]>([]);
  
  useEffect(() => {
    const jobChannel = supabase.channel(`job:${jobId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'jobs', filter: `id=eq.${jobId}` }, 
        (payload) => setJob(payload.new as Job))
      .subscribe();
      
    const locationChannel = supabase.channel(`tracking:${jobId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'mechanic_locations' },
        (payload) => setMechanicLocation(payload.new as Location))
      .subscribe();
      
    const messageChannel = supabase.channel(`messages:${jobId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `job_id=eq.${jobId}` },
        (payload) => setMessages(prev => [...prev, payload.new as Message]))
      .subscribe();
      
    return () => {
      jobChannel.unsubscribe();
      locationChannel.unsubscribe();
      messageChannel.unsubscribe();
    };
  }, [jobId]);
  
  return { job, mechanicLocation, messages };
}
```

---

## 11. Payment Flow Integration

```typescript
// components/shared/PaymentModal.tsx
export function PaymentModal({ 
  amount, 
  referenceId, 
  referenceType, 
  onSuccess, 
  onError 
}) {
  const [method, setMethod] = useState<'mpesa' | 'card' | 'wallet'>('mpesa');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleMpesa = async () => {
    setLoading(true);
    const { data } = await supabase.functions.invoke('mpesa-stk-push', {
      body: { amount, phone, referenceId, referenceType }
    });
    if (data.success) {
      // Poll for status
      const interval = setInterval(async () => {
        const { data: status } = await supabase
          .from('transactions')
          .select('status')
          .eq('reference_id', referenceId)
          .single();
        if (status.status === 'ESCROWED') {
          clearInterval(interval);
          onSuccess();
        } else if (status.status === 'FAILED') {
          clearInterval(interval);
          onError(status.error_message);
        }
      }, 3000);
    }
    setLoading(false);
  };
  
  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Payment - {formatCurrency(amount)}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <RadioGroup value={method} onValueChange={setMethod}>
            <RadioGroupItem value="mpesa" className="flex items-center gap-3 p-4 border rounded-xl hover:bg-orange-50">
              <MpesaLogo className="h-6 w-auto" />
              <div>
                <p className="font-medium">M-Pesa STK Push</p>
                <p className="text-sm text-gray-500">Enter phone number to receive prompt</p>
              </div>
            </RadioGroupItem>
            <RadioGroupItem value="card" className="flex items-center gap-3 p-4 border rounded-xl hover:bg-gray-50">
              <CreditCard className="h-6 w-6" />
              <div>
                <p className="font-medium">Credit/Debit Card</p>
                <p className="text-sm text-gray-500">Powered by Flutterwave</p>
              </div>
            </RadioGroupItem>
            <RadioGroupItem value="wallet" className="flex items-center gap-3 p-4 border rounded-xl hover:bg-gray-50">
              <Wallet className="h-6 w-6" />
              <div>
                <p className="font-medium">Sparespark Wallet</p>
                <p className="text-sm text-gray-500">Instant from balance</p>
              </div>
            </RadioGroupItem>
          </RadioGroup>
          
          {method === 'mpesa' && (
            <Input
              placeholder="+254 7XX XXX XXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              label="Phone Number"
            />
          )}
          
          <Button 
            className="w-full" 
            onClick={handleMpesa} 
            disabled={loading || (method === 'mpesa' && !phone)}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Pay ${formatCurrency(amount)}`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 12. Implementation Priority Order

### Phase 1: Foundation (Week 1-2)
1. Update Tailwind config with orange/amber colors
2. Create animation library (`lib/animations.ts`)
3. Build shared layout components (Sidebar, Header, DashboardLayout)
4. Implement Toast system with actions
5. Hero section redesign

### Phase 2: Customer Core (Week 2-3)
6. Customer dashboard overview with active job card
7. New booking flow (multi-step with Framer Motion)
8. Booking detail + live tracking map
9. Vehicles CRUD

### Phase 3: Parts Marketplace (Week 3-4)
10. Parts marketplace with search/filter
11. Shopping cart + checkout
12. Order tracking

### Phase 4: Mechanic Core (Week 4-5)
13. Mechanic dashboard with availability toggle
14. Job radar (map + list with real-time)
15. Active job with navigation + status progression
16. Earnings dashboard with charts

### Phase 5: KYC & Profile (Week 5-6)
17. Mechanic KYC document upload
18. Profile pages for both roles
19. Settings & notifications

### Phase 6: Polish & Real-time (Week 6-7)
20. Chat system with real-time
21. Payment flow integration (M-Pesa + Flutterwave)
22. Push notifications
23. Performance optimization
24. Testing & bug fixes

---

## 13. Success Criteria

- [ ] All pages load in < 2s (LCP)
- [ ] Framer Motion animations at 60fps
- [ ] Real-time updates < 500ms latency
- [ ] M-Pesa STK Push success rate > 95%
- [ ] Mobile responsive on all screens
- [ ] Accessibility score > 95 (Lighthouse)
- [ ] Zero TypeScript errors
- [ ] All nav links functional with real data

---

**Approved for Implementation** ✅