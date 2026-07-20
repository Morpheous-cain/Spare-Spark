"use client"

import React, { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { NavigationMenu, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuList } from "@/components/ui/navigation-menu"
import { Switch } from "@/components/ui/switch"
import { FeatureGrid } from "@/components/ui/feature-grid"
import { ServiceCard } from "@/components/ui/service-card"
import { TestimonialsCarousel } from "@/components/ui/testimonials-carousel"
import { PricingModule } from "@/components/ui/pricing-module"
import {
  Phone,
  MapPin,
  CheckCircle,
  Shield,
  Star,
  Car,
  Battery,
  Wind,
  Smartphone,
  Play,
  ChevronRight,
  Apple,
  MonitorSmartphone,
  Calendar,
  Wrench,
  Paintbrush,
  Package,
  AlertTriangle,
  CreditCard,
  ShoppingBag,
  Truck,
  Heart,
  Eye,
  Clock,
  MessageSquare,
  Camera,
  Receipt,
  Zap,
  ShoppingCart,
  Search,
  MapPin as MapPinIcon
} from "lucide-react"
import {
  containerVariants,
  itemVariants,
  fadeInUp,
  fadeInLeft,
  fadeInRight,
  scaleIn,
  pageTransition,
  staggerContainer,
  cardEntrance,
  markerPulse,
  toastSlide,
  modalOverlay,
  modalContent,
  listItem,
} from "@/lib/animations"
import { cn } from "@/lib/utils"

const services = [
  {
    icon: Wind,
    title: "Emergency",
    desc: "Tyre change, jump start, fuel delivery, lockout, breakdown repair & towing.",
    items: ["Tyre Change", "Jump Start", "Fuel Delivery", "Lockout", "Breakdown Repair", "Towing"]
  },
  {
    icon: Calendar,
    title: "Scheduled",
    desc: "Book mechanics in advance for maintenance, diagnostics & repairs.",
    items: ["Maintenance", "Diagnostics", "Repairs", "Pre-purchase Inspection"]
  },
  {
    icon: Wrench,
    title: "Diagnostics",
    desc: "Engine check, electrical issues, brake inspection & AC repair.",
    items: ["Engine Check", "Electrical", "Brake Inspection", "AC Repair"]
  },
  {
    icon: Paintbrush,
    title: "Body Work",
    desc: "Dent repair, painting, panel beating & windshield replacement.",
    items: ["Dent Repair", "Painting", "Panel Beating", "Windshield Replacement"]
  }
]

const parts = [
  { name: "Brake Pads", desc: "Premium Bosch brake pads for Toyota, Nissan, Mazda & more.", price: "KES 2,500", icon: Battery },
  { name: "Car Battery", desc: "Maintenance-free 12V battery with 2-year warranty.", price: "KES 8,500", icon: Battery },
  { name: "Air Filter", desc: "High-flow performance air filter improves fuel efficiency.", price: "KES 1,200", icon: Wind },
]

const trustItems = [
  { icon: Shield, title: "Verified Mechanics", desc: "All mechanics undergo background checks, skill verification & training." },
  { icon: MapPin, title: "Real-Time Tracking", desc: "Watch your mechanic approach live on map with ETA updates." },
  { icon: Shield, title: "Secure Payments", desc: "M-Pesa STK Push & card payments with escrow protection." },
]

const howItWorksSteps = [
  {
    number: 1,
    icon: Phone,
    title: "Request Help",
    desc: "Open the app and tap <span class=\"font-semibold text-orange-600\">\"Get Help Now\"</span> for emergencies or schedule a service for later. Select your issue: flat tyre, jump start, tow, or diagnostics.",
    features: [
      { icon: Zap, text: "Emergency dispatch in < 60 seconds" },
      { icon: MapPin, text: "Auto-detect location or drop pin" },
      { icon: Car, text: "Select your saved vehicle" },
      { icon: CreditCard, text: "M-Pesa, Card, or Wallet payment" }
    ],
    gradient: "from-orange-500 to-amber-500",
    phoneScreen: "request",
    delay: 0
  },
  {
    number: 2,
    icon: MapPin,
    title: "Track Your Mechanic",
    desc: "Watch your mechanic approach in real-time on the map. See their live location, accurate ETA, and profile with ratings. Chat or call directly from the app.",
    features: [
      { icon: Eye, text: "Live GPS tracking on map" },
      { icon: Clock, text: "Real-time ETA updates" },
      { icon: MessageSquare, text: "In-app chat & direct call" },
      { icon: Shield, text: "Verified mechanic profiles" }
    ],
    gradient: "from-orange-500 to-amber-500",
    phoneScreen: "track",
    delay: 0.1
  },
  {
    number: 3,
    icon: Wrench,
    title: "Service Complete",
    desc: "Mechanic arrives, diagnoses, and fixes the issue. Review photos, approve completion, and pay securely via M-Pesa STK Push or card. Rate your experience.",
    features: [
      { icon: Camera, text: "Before/after photos for transparency" },
      { icon: CreditCard, text: "Secure M-Pesa & card payments" },
      { icon: Star, text: "Rate & review your mechanic" },
      { icon: Receipt, text: "Digital receipt & service history" }
    ],
    gradient: "from-orange-500 to-amber-500",
    phoneScreen: "complete",
    delay: 0.2
  },
  {
    number: 4,
    icon: Package,
    title: "Parts & Ongoing Care",
    desc: "Need spare parts? Order genuine components delivered to you or your mechanic. Schedule regular maintenance, access service history, and re-book favorite mechanics.",
    features: [
      { icon: ShoppingBag, text: "Genuine parts marketplace" },
      { icon: Truck, text: "Doorstep or mechanic delivery" },
      { icon: Calendar, text: "Schedule maintenance reminders" },
      { icon: Heart, text: "Re-book trusted mechanics" }
    ],
    gradient: "from-orange-500 to-amber-500",
    phoneScreen: "parts",
    delay: 0.3
  }
]

// Phone Screen Components for How It Works
function PhoneScreenRequestHelp() {
  return (
    <div className="space-y-5">
      <div className="text-center mb-5">
        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center">
          <Car className="h-10 w-10 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-1">How can we help?</h3>
        <p className="text-gray-500 text-sm">Select your issue type</p>
      </div>
      <div className="grid gap-3 grid-cols-2">
        {[
          { icon: AlertTriangle, label: "Flat Tyre", color: "bg-red-500" },
          { icon: Zap, label: "Dead Battery", color: "bg-yellow-500" },
          { icon: Truck, label: "Need Tow", color: "bg-blue-500" },
          { icon: Wrench, label: "Diagnostics", color: "bg-green-500" },
        ].map((item, i) => (
          <motion.button
            key={item.label}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-4 rounded-xl bg-white border border-gray-200 text-left shadow-sm hover:border-orange-300 hover:shadow-md transition-all min-h-[80px]"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center flex-shrink-0`}>
                <item.icon className="h-5 w-5 text-white" />
              </div>
              <span className="font-medium text-base text-gray-900">{item.label}</span>
            </div>
          </motion.button>
        ))}
      </div>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full mt-3 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold text-base shadow-lg shadow-orange-500/25"
      >
        Request Help Now
      </motion.button>
    </div>
  )
}

function PhoneScreenTrack() {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 mb-4 p-4 bg-orange-50 rounded-xl border border-orange-100">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-3 h-3 bg-orange-500 rounded-full flex-shrink-0"
        />
        <div>
          <p className="font-medium text-gray-900 text-base">Live Tracking</p>
          <p className="text-xs text-orange-600">Mechanic en route</p>
        </div>
      </div>
      <div className="bg-white rounded-2xl p-4 border border-gray-100">
        {/* Mini Map */}
        <div className="aspect-square bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2240%22 height=%2240%22 viewBox=%220 0 40 40%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath d=%22M20 0h20v20H20V0zm0 20h20v20H20v-20z%22 fill=%22%23f97316%22 fill-opacity=%220.1%22/%3E%3C/svg%3E')]" />
          <Car className="h-8 w-8 text-orange-500 z-10" />
          <motion.div
            animate={{ x: [0, 50, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute bottom-4 right-4 w-4 h-4 bg-orange-500 rounded-full animate-ping"
          />
        </div>
      </div>
      <div className="grid gap-3 grid-cols-2 text-center">
        <div className="p-4 bg-white rounded-xl border border-gray-100">
          <div className="font-bold text-orange-600 text-2xl">2.3</div>
          <div className="text-xs text-gray-500">km away</div>
        </div>
        <div className="p-4 bg-white rounded-xl border border-gray-100">
          <div className="font-bold text-orange-600 text-2xl">8</div>
          <div className="text-xs text-gray-500">min ETA</div>
        </div>
      </div>
      <div className="h-5 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
          animate={{ width: ['0%', '65%', '65%'] }}
          transition={{ duration: 1.5, delay: 0.5 }}
        />
      </div>
      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 py-3.5 rounded-xl bg-white text-orange-600 font-medium border border-orange-200 flex items-center justify-center gap-2"
        >
          <MessageSquare className="h-5 w-5" /> Chat
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium flex items-center justify-center gap-2"
        >
          <Phone className="h-5 w-5" /> Call
        </motion.button>
      </div>
    </div>
  )
}

function PhoneScreenComplete() {
  return (
    <div className="space-y-5">
      <div className="text-center mb-4 p-5 bg-green-50 rounded-2xl border border-green-100">
        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
          <CheckCircle className="h-10 w-10 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-1">Service Complete!</h3>
        <p className="text-gray-500 text-sm">Peter Mwangi finished the repair</p>
      </div>
      <div className="space-y-3">
        {[
          { icon: Camera, label: "Before/After Photos", desc: "3 photos uploaded" },
          { icon: CreditCard, label: "Payment", desc: "KES 4,500 via M-Pesa" },
          { icon: Star, label: "Rating", desc: "⭐⭐⭐⭐⭐ Excellent" },
          { icon: Receipt, label: "Receipt", desc: "Saved to history" },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            whileHover={{ x: 4 }}
            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100"
          >
            <item.icon className="h-7 w-7 text-orange-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-base text-gray-900">{item.label}</p>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
            <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
          </motion.div>
        ))}
      </div>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold text-base"
      >
        Rate & Review
      </motion.button>
    </div>
  )
}

function PhoneScreenParts() {
  return (
    <div className="space-y-5">
      <div className="text-center mb-4">
        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
          <Package className="h-10 w-10 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-1">Spare Parts Marketplace</h3>
        <p className="text-gray-500 text-sm">Order genuine parts delivered to you</p>
      </div>
      <div className="space-y-3 max-h-72 overflow-y-auto">
        {[
          { name: "Brake Pads (Toyota)", price: "KES 2,500", icon: Battery },
          { name: "Car Battery 12V", price: "KES 8,500", icon: Battery },
          { name: "Air Filter", price: "KES 1,200", icon: Wind },
          { name: "Engine Oil 5L", price: "KES 3,800", icon: Battery },
        ].map((part, i) => (
          <motion.div
            key={part.name}
            whileHover={{ x: 4 }}
            className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100"
          >
            <part.icon className="h-7 w-7 text-orange-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-base text-gray-900">{part.name}</p>
              <p className="text-sm text-gray-500">In stock • Free delivery</p>
            </div>
            <span className="font-bold text-orange-600 text-base">{part.price}</span>
          </motion.div>
        ))}
      </div>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold text-base"
      >
        Browse All Parts
      </motion.button>
    </div>
  )
}

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeScreen, setActiveScreen] = useState("request")

  return (
    <React.Fragment>
      <header className="border-b border-gray-200/50 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center space-x-2">
            <Car className="h-8 w-8 text-orange-500" />
            <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
              Sparespark
            </span>
          </Link>

          {/* Pill Navigation - Desktop */}
          <nav className="hidden md:flex items-center gap-1 bg-gray-100 dark:bg-gray-800/50 rounded-xl p-1">
            <Link
              href="#how-it-works"
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
            >
              How it works
            </Link>
            <Link
              href="#services"
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Services
            </Link>
            <Link
              href="#parts"
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              onClick={() => document.getElementById('parts')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Parts
            </Link>
            <Link
              href="#trust"
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              onClick={() => document.getElementById('trust')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Trust
            </Link>
            <Link
              href="/auth/sign-in"
              className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:opacity-90 transition-opacity"
            >
              Sign In
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Search className="h-5 w-5" />
          </Button>
        </div>

        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-200/50 px-4 py-4 space-y-2 bg-white"
          >
            <Link href="#how-it-works" className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-100" onClick={() => { document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }); setIsMobileMenuOpen(false) }}>How it works</Link>
            <Link href="#services" className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-100" onClick={() => { document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' }); setIsMobileMenuOpen(false) }}>Services</Link>
            <Link href="#parts" className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-100" onClick={() => { document.getElementById('parts')?.scrollIntoView({ behavior: 'smooth' }); setIsMobileMenuOpen(false) }}>Parts</Link>
            <Link href="#trust" className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-100" onClick={() => { document.getElementById('trust')?.scrollIntoView({ behavior: 'smooth' }); setIsMobileMenuOpen(false) }}>Trust</Link>
            <Link href="/auth/sign-in" className="block w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white px-3 py-2 rounded-md font-medium text-center" onClick={() => setIsMobileMenuOpen(false)}>Sign In</Link>
          </motion.div>
        )}
      </header>

      <main>
        <section id="hero" className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">

          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="relative z-10 container mx-auto px-4 py-24"
          >
            <motion.div
              variants={fadeInUp}
              className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center"
            >
              <div className="text-center lg:text-left order-2 lg:order-1">
                <motion.span
                  variants={fadeInUp}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 text-orange-700 text-sm font-medium mb-6 border border-orange-200"
                >
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-2 h-2 bg-orange-500 rounded-full"
                  />
                  Kenya's #1 On-Demand Mechanic Service
                </motion.span>

                <motion.h1
                  variants={fadeInUp}
                  className="mb-6 text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl lg:text-7xl leading-tight"
                >
                  Your Car Broke Down?
                  <br className="hidden sm:inline" />
                  <span className="bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 bg-clip-text text-transparent">
                    We'll Come to You
                  </span>
                </motion.h1>

                <motion.p
                  variants={fadeInUp}
                  className="mb-10 max-w-2xl mx-auto lg:mx-0 text-lg text-gray-600 sm:text-xl md:text-2xl leading-relaxed"
                >
                  Flat tyre? Dead battery? Engine trouble? Tap the app and a verified mechanic
                  arrives in minutes — tracked live, paid via M-Pesa, guaranteed quality.
                </motion.p>

                <motion.div
                  variants={fadeInUp}
                  className="mb-10 flex flex-wrap items-center justify-center lg:justify-start gap-8 sm:gap-12 text-gray-600"
                >
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-2 h-2 bg-green-500 rounded-full"
                    />
                    <span className="font-medium">Active in Nairobi, Mombasa, Kisumu</span>
                  </div>
                  <div className="w-px h-10 bg-gray-200 hidden sm:block" />
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-500" />
                    <span className="font-medium">5,000+ Verified Mechanics</span>
                  </div>
                  <div className="w-px h-10 bg-gray-200 hidden sm:block" />
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                    <span className="font-medium">4.9★ Average Rating</span>
                  </div>
                </motion.div>

                <motion.div
                  variants={fadeInUp}
                  className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                >
                  <Link
                    href="/auth/sign-in"
                    className="group relative px-8 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-lg font-semibold overflow-hidden"
                  >
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="relative flex items-center gap-2"
                    >
                      <Smartphone className="h-5 w-5" />
                      Get Started Free
                    </motion.button>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-orange-600 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </Link>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-8 py-4 rounded-xl border-2 border-orange-500 text-orange-600 text-lg font-semibold hover:bg-orange-50 transition-colors"
                    onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    <Play className="mr-2 h-5 w-5" />
                    Watch Demo
                  </motion.button>
                </motion.div>

                <motion.div
                  variants={fadeInUp}
                  className="mt-16 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-gray-500 text-sm"
                >
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
              </div>

              <div className="relative order-1 lg:order-2">
                <div className="relative mx-auto max-w-xs lg:max-w-sm">
                  <motion.div
                    className="relative mx-auto"
                    style={{ width: '340px', aspectRatio: '9/19.5' }}
                  >
                    <div className="absolute inset-0 bg-gray-900 rounded-[48px] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.4)]" />
                    <div className="absolute inset-4 bg-gray-50 rounded-[44px] p-1.5 flex flex-col items-center justify-between">
                      <div className="flex items-center justify-between px-5 py-3 text-xs text-gray-500 w-full">
                        <span>9:41</span>
                        <div className="flex items-center gap-1.5">
                          <div className="w-7 h-3.5 bg-green-500 rounded-full flex items-center justify-start p-0.5">
                            <div className="w-2.5 h-2.5 bg-white rounded-full" />
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 flex items-center justify-center px-5 w-full overflow-hidden">
                        <div className="w-full bg-white rounded-3xl p-5 shadow-lg max-h-80 overflow-hidden">
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
                      <div className="w-28 h-2 bg-gray-300 rounded-full mx-auto mb-3" />
                    </div>
                  </motion.div>

                  <motion.div
                    animate={{ y: [0, 20, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -bottom-10 -right-10 w-28 h-28 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-2xl"
                  >
                    <Car className="h-14 w-14 text-white" />
                  </motion.div>

                  <motion.div
                    animate={{ x: [0, -15, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-4 -left-4 w-18 h-18 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30"
                  >
                    <MapPinIcon className="h-9 w-9 text-orange-400" />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        <section id="how-it-works" className="py-24 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
              className="text-center mb-16 max-w-3xl mx-auto"
            >
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

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={containerVariants}
              className="relative"
            >
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
                {/* Left: Steps */}
                <div className="space-y-8 lg:pr-8">
                  {howItWorksSteps.map((step) => (
                    <motion.div
                      key={step.number}
                      variants={itemVariants}
                      style={{ transitionDelay: `${step.delay}s` }}
                      className="relative"
                      onMouseEnter={() => setActiveScreen(step.phoneScreen)}
                    >
                      <div className="relative">
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className="relative bg-white rounded-2xl p-6 shadow-lg border border-gray-100 transition-all duration-300"
                        >
                          <div className="flex items-start gap-4">
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-white"
                            >
                              <div className={`w-full h-full rounded-full bg-gradient-to-br ${step.gradient} flex items-center justify-center`}>
                                {step.number}
                              </div>
                            </motion.div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                              <p className="text-gray-600 mb-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: step.desc }} />

                              <div className="space-y-2">
                                {step.features.map((feature) => (
                                  <motion.div
                                    key={feature.text}
                                    whileHover={{ x: 4 }}
                                    className="flex items-center gap-2 text-sm text-gray-600"
                                  >
                                    <feature.icon className="h-5 w-5 text-orange-500 flex-shrink-0" />
                                    <span>{feature.text}</span>
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Right: Phone Mockup with App Screens */}
                <div className="relative lg:sticky lg:top-24">
                  <div className="relative mx-auto max-w-xs">
                    {/* Phone Frame */}
                    <motion.div
                      className="relative mx-auto"
                      style={{ width: '340px', aspectRatio: '9/19.5' }}
                    >
                      <div className="absolute inset-0 bg-gray-900 rounded-[48px] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.4)]" />
                      <div className="absolute inset-4 bg-gray-50 rounded-[44px] p-1.5 flex flex-col items-center justify-between">
                        {/* Status Bar */}
                        <div className="flex items-center justify-between px-5 py-3 text-xs text-gray-500 w-full">
                          <span>9:41</span>
                          <div className="flex items-center gap-1.5">
                            <div className="w-7 h-3.5 bg-green-500 rounded-full flex items-center justify-start p-0.5">
                              <div className="w-2.5 h-2.5 bg-white rounded-full" />
                            </div>
                          </div>
                        </div>

                        {/* Dynamic Screen Content */}
                        <div className="flex-1 flex items-center justify-center px-5 w-full overflow-hidden">
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={activeScreen}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ duration: 0.3, ease: "easeOut" }}
                              className="w-full bg-white rounded-3xl p-5 shadow-lg max-h-80 overflow-hidden"
                            >
                              {activeScreen === "request" && <PhoneScreenRequestHelp />}
                              {activeScreen === "track" && <PhoneScreenTrack />}
                              {activeScreen === "complete" && <PhoneScreenComplete />}
                              {activeScreen === "parts" && <PhoneScreenParts />}
                            </motion.div>
                          </AnimatePresence>
                        </div>

                        {/* Home Indicator */}
                        <div className="w-28 h-2 bg-gray-300 rounded-full mx-auto mb-3" />
                      </div>
                    </motion.div>

                    {/* Floating Animated Elements */}
                    <motion.div
                      animate={{ y: [0, 20, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute -bottom-10 -right-10 w-28 h-28 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-2xl"
                    >
                      <Car className="h-14 w-14 text-white" />
                    </motion.div>

                    <motion.div
                      animate={{ x: [0, -15, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute -top-4 -left-4 w-18 h-18 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30"
                    >
                      <MapPin className="h-9 w-9 text-orange-400" />
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Mobile: Horizontal Scroll */}
              <div className="lg:hidden mt-12">
                <div className="flex overflow-x-auto snap-x pb-4 -mx-4 px-4 space-x-4">
                  {howItWorksSteps.map((step) => (
                    <motion.div
                      key={step.number}
                      whileHover={{ scale: 1.02 }}
                      className="flex-shrink-0 w-72 snap-start bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br text-white flex items-center justify-center font-bold">
                          {step.number}
                        </div>
                        <step.icon className="h-6 w-6 text-orange-500" />
                      </div>
                      <h4 className="font-bold text-gray-900 mb-2">{step.title}</h4>
                      <p className="text-sm text-gray-600">
                        {step.number === 1 && "Tap for emergency or schedule"}
                        {step.number === 2 && "Live GPS tracking & chat"}
                        {step.number === 3 && "On-site repair & payment"}
                        {step.number === 4 && "Parts delivery & maintenance"}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="services" className="py-24 bg-gradient-to-b from-gray-50/50 to-white">
          <div className="container mx-auto px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
              className="text-center mb-16"
            >
              <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl md:text-5xl">Our Services</h2>
              <p className="text-gray-600 max-w-xl mx-auto text-lg">
                From emergency roadside repairs to scheduled maintenance, we've got you covered.
              </p>
            </motion.div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={containerVariants}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
            >
              {services.map((service, index) => (
                <motion.div
                  key={service.title}
                  variants={itemVariants}
                  style={{ transitionDelay: `${index * 0.1}s` }}
                >
                  <Card className="group h-full flex flex-col hover:shadow-xl transition-all duration-300 border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg shadow-orange-500/5">
                    <CardHeader className="pb-4">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center mb-5 shadow-lg shadow-orange-500/25"
                      >
                        <service.icon className="h-7 w-7 text-white" />
                      </motion.div>
                      <CardTitle className="text-xl font-bold">{service.title}</CardTitle>
                      <CardDescription className="text-base">{service.desc}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 pt-0">
                      <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        {service.items.map((item) => (
                          <li key={item} className="flex items-center gap-2.5 group-hover:translate-x-1 transition-transform">
                            <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                            <span className="font-medium">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section id="parts" className="py-24 bg-gradient-to-b from-white to-gray-50/50">
          <div className="container mx-auto px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
              className="text-center mb-16"
            >
              <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl md:text-5xl">Spare Parts Marketplace</h2>
              <p className="text-gray-600 max-w-xl mx-auto text-lg">
                Get genuine parts delivered to your door or mechanic's location.
              </p>
            </motion.div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={containerVariants}
              className="grid gap-6 md:grid-cols-3"
            >
              {parts.map((part, index) => (
                <motion.div
                  key={part.name}
                  variants={itemVariants}
                  style={{ transitionDelay: `${index * 0.1}s` }}
                >
                  <Card className="group h-full flex flex-col hover:shadow-xl transition-all duration-300 border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg shadow-orange-500/5">
                    <CardHeader className="pb-4">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-5 shadow-lg shadow-purple-500/25"
                      >
                        <part.icon className="h-7 w-7 text-white" />
                      </motion.div>
                      <CardTitle className="text-xl font-bold">{part.name}</CardTitle>
                      <CardDescription className="text-base mb-4">{part.desc}</CardDescription>
                      <p className="text-orange-600 font-bold text-xl">{part.price}</p>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-between pt-0">
                      <div className="flex items-center justify-between">
                        <span className="text-emerald-600 font-medium bg-emerald-50 px-3 py-1 rounded-full text-sm">In Stock</span>
                      </div>
                      <Link
                        href="/auth/sign-in"
                        className="w-full mt-4"
                      >
                        <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white font-semibold py-3 rounded-xl">Order Now</Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section id="trust" className="py-20 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #fff7ed 0%, #ffffff 50%, #fffbeb 100%)' }}>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath d=%22M30 0h30v30H30V0zm0 30h30v30H30v-30z%22 fill=%22%23f97316%22 fill-opacity=%220.03%22/%3E%3C/svg%3E')]" />
          <div className="relative container mx-auto px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
              className="text-center mb-12"
            >
              <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">Why Trust Sparespark?</h2>
              <p className="text-gray-600 max-w-xl mx-auto">
                Safety, reliability and transparency built into every service.
              </p>
            </motion.div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={containerVariants}
              className="grid gap-8 md:grid-cols-3"
            >
              {trustItems.map((item, index) => (
                <motion.div
                  key={item.title}
                  variants={itemVariants}
                  style={{ transitionDelay: `${index * 0.1}s` }}
                >
                  <Card className="text-center hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm shadow-lg">
                    <CardHeader>
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/25"
                      >
                        <item.icon className="h-7 w-7 text-white" />
                      </motion.div>
                      <CardTitle>{item.title}</CardTitle>
                      <CardDescription>{item.desc}</CardDescription>
                    </CardHeader>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          className="py-24 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #f97316 0%, #fb923c 50%, #f59e0b 100%)' }}
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2280%22 height=%2280%22 viewBox=%220 0 80 80%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath d=%22M40 0h40v40H40V0zm0 40h40v40H40v-40z%22 fill=%22%23ffffff%22 fill-opacity=%220.05%22/%3E%3C/svg%3E')]" />
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          </div>
          <div className="relative container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="text-center lg:text-left">
                <h2 className="mb-6 text-3xl font-bold sm:text-4xl lg:text-5xl leading-tight text-white">
                  Ready when you need us most
                </h2>
                <p className="mb-10 text-xl text-white/90 max-w-xl lg:mx-0 leading-relaxed">
                  Download Sparespark today and get peace of mind on Kenya's roads.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-white text-orange-600 hover:bg-white/90 text-lg px-8 py-4 rounded-xl font-semibold shadow-lg"
                  >
                    <Apple className="mr-2 h-6 w-6" />
                    App Store
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-white/20 hover:bg-white/30 border-2 border-white/30 text-white text-lg px-8 py-4 rounded-xl font-semibold"
                  >
                    <MonitorSmartphone className="mr-2 h-6 w-6" />
                    Google Play
                  </motion.button>
                </div>
                <p className="mt-8 text-white/70 text-sm">
                  Join 50,000+ Kenyan drivers who trust us with their vehicle emergencies
                </p>
              </div>

              <div className="relative lg:order-first">
                <div className="relative mx-auto max-w-xs lg:max-w-sm">
                  <div className="relative mx-auto" style={{ width: '340px', aspectRatio: '9/19.5' }}>
                    <div className="absolute inset-0 bg-gray-900 rounded-[48px] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.4)]" />
                    <div className="absolute inset-4 bg-gray-50 rounded-[44px] p-1.5 flex flex-col items-center justify-between">
                      <div className="flex items-center justify-between px-5 py-3 text-xs text-gray-500 w-full">
                        <span>9:41</span>
                        <div className="flex items-center gap-1.5">
                          <div className="w-7 h-3.5 bg-green-500 rounded-full flex items-center justify-start p-0.5">
                            <div className="w-2.5 h-2.5 bg-white rounded-full" />
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 flex items-center justify-center px-5 w-full overflow-hidden">
                        <div className="w-full bg-white rounded-3xl p-5 shadow-lg max-h-80 overflow-hidden">
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
                      <div className="w-28 h-2 bg-gray-300 rounded-full mx-auto mb-3" />
                    </div>
                  </div>

                  <motion.div
                    animate={{ y: [0, 20, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -bottom-10 -right-10 w-28 h-28 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-2xl"
                  >
                    <Car className="h-14 w-14 text-white" />
                  </motion.div>

                  <motion.div
                    animate={{ x: [0, -15, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-4 -left-4 w-18 h-18 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30"
                  >
                    <MapPin className="h-9 w-9 text-orange-400" />
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      </main>

      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <Link href="/" className="flex items-center space-x-2 mb-4">
                <Car className="h-8 w-8 text-orange-500" />
                <span className="text-xl font-bold">Sparespark</span>
              </Link>
              <p className="text-gray-400 mb-4">
                Uber for mechanics in Kenya. Emergency roadside assistance & spare parts delivery.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.44 28.35 28.35 0 0 1 8.7-4.6 2 2 0 0 1 2.8 0A28.35 28.35 0 0 1 20.1 11a2 2 0 0 1 1.4 1.44 24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.44 28.35 28.35 0 0 1-8.7 4.6 2 2 0 0 1-2.8 0A28.35 28.35 0 0 1 2.5 17z"/><path d="M10 10.5c0 1.4 1.1 2.5 2.5 2.5S15 11.9 15 10.5S13.9 8 12.5 8 10 9.1 10 10.5z"/><path d="M19 11c0 4.4-3.6 8-8 8s-8-3.6-8-8 3.6-8 8-8 8 3.6 8 8z"/></svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Press</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">Emergency Help</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Scheduled Service</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Spare Parts</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Mechanic Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} Sparespark. All rights reserved. Licensed & regulated by Kenyan authorities.
          </div>
        </div>
      </footer>
    </React.Fragment>
  )
}