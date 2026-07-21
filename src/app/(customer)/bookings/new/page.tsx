"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { formatCurrency, formatDate } from "@/lib/utils"
import { containerVariants, itemVariants, fadeInUp, cardEntrance, staggerContainer } from "@/lib/animations"
import { ArrowLeft, AlertCircle, Calendar, Wrench, Car, MapPin, Camera, Loader2, Check, X, ChevronRight, ChevronLeft, Plus, Trash2, MapPin as MapPinIcon, ArrowRight, CreditCard, Shield, AlertTriangle } from "lucide-react"

const supabase = createClient()

const SERVICE_TYPES = [
  { id: "emergency", label: "Emergency", icon: AlertCircle, desc: "Roadside breakdown assistance", color: "bg-red-500" },
  { id: "scheduled", label: "Scheduled", icon: Calendar, desc: "Pre-booked maintenance", color: "bg-blue-500" },
  { id: "diagnostics", label: "Diagnostics", icon: Wrench, desc: "Vehicle health check", color: "bg-amber-500" },
  { id: "body_work", label: "Body Work", icon: Car, desc: "Collision & paint repair", color: "bg-purple-500" },
] as const

const SERVICE_CATEGORIES = [
  "Engine Repair",
  "Transmission",
  "Brakes",
  "Suspension",
  "Electrical",
  "AC / Heating",
  "Body Work",
  "Tires & Wheels",
  "Oil Change",
  "General Maintenance",
  "Diagnostics",
  "Other",
] as const

const PRICE_ESTIMATES: Record<string, { min: number; max: number }> = {
  "Engine Repair": { min: 15000, max: 80000 },
  "Transmission": { min: 20000, max: 120000 },
  "Brakes": { min: 5000, max: 25000 },
  "Suspension": { min: 8000, max: 40000 },
  "Electrical": { min: 3000, max: 30000 },
  "AC / Heating": { min: 5000, max: 35000 },
  "Body Work": { min: 10000, max: 150000 },
  "Tires & Wheels": { min: 8000, max: 60000 },
  "Oil Change": { min: 2000, max: 8000 },
  "General Maintenance": { min: 3000, max: 15000 },
  "Diagnostics": { min: 2000, max: 10000 },
  "Other": { min: 2000, max: 50000 },
}

const STEPS = [
  { id: 1, label: "Service Type", key: "type" },
  { id: 2, label: "Vehicle", key: "vehicle" },
  { id: 3, label: "Location", key: "location" },
  { id: 4, label: "Issue Details", key: "details" },
  { id: 5, label: "Price Estimate", key: "price" },
  { id: 6, label: "Review", key: "review" },
]

export default function NewBookingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentStep, setCurrentStep] = useState(1)
  const [serviceType, setServiceType] = useState<string>(searchParams.get("type") || "emergency")
  const [vehicles, setVehicles] = useState<any[]>([])
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null)
  const [showAddVehicle, setShowAddVehicle] = useState(false)
  const [newVehicle, setNewVehicle] = useState({ make: "", model: "", year: "", registration: "", color: "" })
  const [location, setLocation] = useState({ address: "", lat: null as number | null, lng: null as number | null })
  const [serviceCategory, setServiceCategory] = useState<string>("")
  const [problemDescription, setProblemDescription] = useState("")
  const [photos, setPhotos] = useState<File[]>([])
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [vehicleLoading, setVehicleLoading] = useState(true)

  useEffect(() => {
    const type = searchParams.get("type")
    if (type && SERVICE_TYPES.some(s => s.id === type)) {
      setServiceType(type)
    }
  }, [searchParams])

  useEffect(() => {
    async function fetchVehicles() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/auth/sign-in"); return }
      const { data } = await supabase.from("vehicles").select("*").eq("owner_id", user.id).order("created_at", { ascending: false })
      setVehicles(data || [])
      if (data && data.length > 0 && !selectedVehicle) setSelectedVehicle(data[0].id)
      setVehicleLoading(false)
    }
    fetchVehicles()
  }, [router, selectedVehicle])

  const handleBack = () => setCurrentStep(prev => Math.max(1, prev - 1))
  const handleNext = () => {
    if (currentStep === 1 && !serviceType) return
    if (currentStep === 2 && !selectedVehicle && vehicles.length > 0) return
    if (currentStep === 3 && !location.address) return
    if (currentStep === 4 && (!serviceCategory || !problemDescription.trim())) return
    setCurrentStep(prev => Math.min(STEPS.length, prev + 1))
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")
      if (!selectedVehicle) throw new Error("No vehicle selected")

      const estimate = PRICE_ESTIMATES[serviceCategory] || PRICE_ESTIMATES["Other"]

      const { data: job, error } = await supabase
        .from("jobs")
        .insert({
          customer_id: user.id,
          vehicle_id: selectedVehicle,
          service_category: serviceCategory,
          location_address: location.address,
          location_lat: location.lat,
          location_lng: location.lng,
          price_estimate_min: estimate.min,
          price_estimate_max: estimate.max,
          status: "PENDING",
          problem_description: problemDescription,
        })
        .select()
        .single()

      if (error) throw error

      // TODO: Upload photos to storage and link to job_photos table

      router.push("/customer/bookings")
    } catch (e: any) {
      setError(e.message)
      setSubmitting(false)
    }
  }

  const handleFileUpload = (files: FileList) => {
    const newFiles = Array.from(files).slice(0, 3 - photos.length)
    setPhotos(prev => [...prev, ...newFiles])
  }

  const removePhoto = (idx: number) => setPhotos(prev => prev.filter((_, i) => i !== idx))

  const getCurrentVehicle = () => vehicles.find(v => v.id === selectedVehicle)

  const completedSteps = STEPS.filter(s => s.id < currentStep).map(s => s.key)

  return (
    <div className="min-h-screen bg-obsidian-bg text-text-primary font-inter">
      <header className="border-b border-slate-border bg-obsidian-surface/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack} className="text-text-secondary hover:text-amber-primary min-h-[44px]">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 text-center">
            <h1 className="text-xl font-bold text-text-primary">Book a Service</h1>
            <p className="text-xs text-text-secondary">Step {currentStep} of {STEPS.length}</p>
          </div>
          <div className="w-10" />
        </div>
        <div className="px-6 pb-4">
          <div className="flex items-center justify-center gap-1 overflow-x-auto pb-2">
            {STEPS.map((step, idx) => (
              <motion.div key={step.key} layout variants={itemVariants} className="flex items-center gap-1.5">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300",
                  idx < currentStep - 1
                    ? "bg-amber-burst border-amber-primary text-white"
                    : idx === currentStep - 1
                    ? "bg-obsidian-surface border-amber-primary text-amber-primary"
                    : "bg-obsidian-surface border-slate-border text-text-secondary"
                )}>
                  {idx < currentStep - 1 ? <Check className="h-4 w-4" /> : step.id}
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={cn(
                    "hidden sm:block w-16 h-0.5",
                    idx < currentStep - 1 ? "bg-amber-burst" : "bg-slate-border"
                  )} />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-3xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            {currentStep === 1 && <ServiceTypeStep
              serviceType={serviceType}
              setServiceType={setServiceType}
              selectedVehicle={selectedVehicle}
            />}

            {currentStep === 2 && <VehicleStep
              vehicles={vehicles}
              setVehicles={setVehicles}
              selectedVehicle={selectedVehicle}
              setSelectedVehicle={setSelectedVehicle}
              showAddVehicle={showAddVehicle}
              setShowAddVehicle={setShowAddVehicle}
              newVehicle={newVehicle}
              setNewVehicle={setNewVehicle}
              vehicleLoading={vehicleLoading}
            />}

            {currentStep === 3 && <LocationStep
              location={location}
              setLocation={setLocation}
            />}

            {currentStep === 4 && <DetailsStep
              serviceCategory={serviceCategory}
              setServiceCategory={setServiceCategory}
              problemDescription={problemDescription}
              setProblemDescription={setProblemDescription}
              photos={photos}
              setPhotos={setPhotos}
              handleFileUpload={handleFileUpload}
              removePhoto={removePhoto}
            />}

            {currentStep === 5 && <PriceStep
              serviceCategory={serviceCategory}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
            />}

            {currentStep === 6 && <ReviewStep
              serviceType={serviceType}
              vehicle={getCurrentVehicle()}
              location={location}
              serviceCategory={serviceCategory}
              problemDescription={problemDescription}
              photos={photos}
              priceRange={priceRange}
              submitting={submitting}
              error={error}
              onSubmit={handleSubmit}
            />}
          </motion.div>
        </AnimatePresence>

        <div className="fixed bottom-0 left-0 right-0 bg-obsidian-surface/95 backdrop-blur-sm border-t border-slate-border p-4 md:static md:bg-transparent md:border-0 md:p-0 mt-8">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="min-h-[56px] px-6"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            {currentStep < STEPS.length ? (
              <Button
                onClick={handleNext}
                disabled={
                  (currentStep === 1 && !serviceType) ||
                  (currentStep === 2 && !selectedVehicle && vehicles.length > 0) ||
                  (currentStep === 3 && !location.address) ||
                  (currentStep === 4 && (!serviceCategory || !problemDescription.trim()))
                }
                className="min-h-[56px] px-8 bg-amber-burst shadow-amber-glow hover:opacity-90 rounded-xl flex-1"
                style={{ boxShadow: "0 0 30px rgba(255, 94, 58, 0.4)" }}
              >
                Continue
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="min-h-[56px] px-8 bg-amber-burst shadow-amber-glow hover:opacity-90 rounded-xl flex-1"
                style={{ boxShadow: "0 0 30px rgba(255, 94, 58, 0.4)" }}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Confirming...
                  </>
                ) : (
                  <>
                    <Shield className="h-5 w-5 mr-2" />
                    Confirm Booking
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

function ServiceTypeStep({ serviceType, setServiceType, selectedVehicle }: any) {
  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text-primary mb-2">What type of service do you need?</h2>
        <p className="text-text-secondary">Select the category that best describes your situation</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {SERVICE_TYPES.map((type, idx) => (
          <motion.button
            key={type.id}
            variants={cardEntrance}
            style={{ transitionDelay: `${idx * 0.08}s` }}
            onClick={() => setServiceType(type.id)}
            className={cn(
              "relative p-6 rounded-2xl border-2 transition-all duration-300",
              "bg-obsidian-surface shadow-card-elev",
              serviceType === type.id
                ? "border-amber-primary bg-amber-subtle shadow-amber-glow"
                : "border-slate-border hover:border-amber-primary/50 hover:bg-slate-surface"
            )}
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center mb-4", type.color)}>
              {(() => {
                const Icon = type.icon
                return <Icon className="h-7 w-7 text-white" />
              })()}
            </div>
            <h3 className="font-bold text-text-primary mb-1">{type.label}</h3>
            <p className="text-text-secondary text-sm">{type.desc}</p>
            {serviceType === type.id && (
              <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-amber-burst flex items-center justify-center">
                <Check className="h-4 w-4 text-white" />
              </div>
            )}
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}

function VehicleStep({ vehicles, setVehicles, selectedVehicle, setSelectedVehicle, showAddVehicle, setShowAddVehicle, newVehicle, setNewVehicle, vehicleLoading }: any) {
  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data, error } = await supabase.from("vehicles").insert({
      owner_id: user.id,
      ...newVehicle,
    }).select().single()
    if (!error && data) {
      setVehicles((prev: any[]) => [data, ...prev])
      setSelectedVehicle(data.id)
      setShowAddVehicle(false)
      setNewVehicle({ make: "", model: "", year: "", registration: "", color: "" })
    }
  }

  if (vehicleLoading) {
    return (
      <div className="space-y-4" role="status" aria-label="Loading vehicles">
        {[1, 2, 3].map(i => (
          <Card key={i} className="bg-obsidian-surface border-slate-border">
            <CardContent className="p-6">
              <Skeleton className="h-16 w-full rounded-xl" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text-primary mb-2">Select Your Vehicle</h2>
        <p className="text-text-secondary">Choose the vehicle for this service</p>
      </div>

      {vehicles.length > 0 && (
        <div className="space-y-3">
          {vehicles.map((vehicle, idx) => (
            <motion.button
              key={vehicle.id}
              variants={cardEntrance}
              style={{ transitionDelay: `${idx * 0.08}s` }}
              onClick={() => setSelectedVehicle(vehicle.id)}
              className={cn(
                "w-full p-4 rounded-2xl border-2 text-left transition-all duration-300",
                "bg-obsidian-surface shadow-card-elev",
                selectedVehicle === vehicle.id
                  ? "border-amber-primary bg-amber-subtle shadow-amber-glow"
                  : "border-slate-border hover:border-amber-primary/50 hover:bg-slate-surface"
              )}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-amber-subtle flex items-center justify-center">
                  <Car className="h-8 w-8 text-amber-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-text-primary truncate">{vehicle.make} {vehicle.model}</h3>
                    {selectedVehicle === vehicle.id && (
                      <Badge variant="secondary" className="bg-amber-burst text-white">Selected</Badge>
                    )}
                  </div>
                  <p className="text-text-secondary text-sm font-mono">{vehicle.registration}</p>
                  <p className="text-text-secondary text-xs">{vehicle.year} · {vehicle.color}</p>
                </div>
                {selectedVehicle === vehicle.id && (
                  <Check className="h-6 w-6 text-amber-primary" />
                )}
              </div>
            </motion.button>
          ))}
        </div>
      )}

      <Button
        variant="outline"
        onClick={() => setShowAddVehicle(!showAddVehicle)}
        className="w-full min-h-[56px] border-slate-border hover:border-amber-primary/50"
      >
        <Plus className="h-4 w-4 mr-2" />
        {showAddVehicle ? "Cancel" : "Add New Vehicle"}
      </Button>

      <AnimatePresence>
        {showAddVehicle && (
          <motion.form
            onSubmit={handleAddVehicle}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-4 p-4 bg-slate-surface rounded-2xl border border-slate-border"
          >
            <h3 className="font-bold text-text-primary">Add New Vehicle</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="block text-sm font-medium text-text-secondary mb-1">Make</Label>
                <Input value={newVehicle.make} onChange={e => setNewVehicle({ ...newVehicle, make: e.target.value })} placeholder="Toyota" required />
              </div>
              <div>
                <Label className="block text-sm font-medium text-text-secondary mb-1">Model</Label>
                <Input value={newVehicle.model} onChange={e => setNewVehicle({ ...newVehicle, model: e.target.value })} placeholder="Corolla" required />
              </div>
              <div>
                <Label className="block text-sm font-medium text-text-secondary mb-1">Year</Label>
                <Input type="number" value={newVehicle.year} onChange={e => setNewVehicle({ ...newVehicle, year: e.target.value })} placeholder="2020" required />
              </div>
              <div>
                <Label className="block text-sm font-medium text-text-secondary mb-1">Color</Label>
                <Input value={newVehicle.color} onChange={e => setNewVehicle({ ...newVehicle, color: e.target.value })} placeholder="Silver" required />
              </div>
            </div>
            <div>
              <Label className="block text-sm font-medium text-text-secondary mb-1">Registration Number</Label>
              <Input value={newVehicle.registration} onChange={e => setNewVehicle({ ...newVehicle, registration: e.target.value })} placeholder="KAA 123B" className="font-mono" required />
            </div>
            <Button type="submit" className="w-full min-h-[56px] bg-amber-burst shadow-amber-glow hover:opacity-90 rounded-xl">Add Vehicle</Button>
          </motion.form>
        )}
      </AnimatePresence>

      {vehicles.length === 0 && !showAddVehicle && (
        <Card className="bg-obsidian-surface border-slate-border text-center py-8">
          <CardContent>
            <Car className="h-12 w-12 text-text-secondary mx-auto mb-4" />
            <h3 className="text-text-primary font-bold mb-2">No Vehicles Added</h3>
            <p className="text-text-secondary mb-4">Add your first vehicle to continue booking</p>
            <Button variant="outline" onClick={() => setShowAddVehicle(true)} className="min-h-[56px]">
              <Plus className="h-4 w-4 mr-2" />
              Add Vehicle
            </Button>
          </CardContent>
        </Card>
      )}
    </motion.div>
  )
}

function LocationStep({ location, setLocation }: any) {
  const handleUseLocation = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(pos => {
      setLocation(prev => ({
        ...prev,
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        address: `Lat: ${pos.coords.latitude.toFixed(6)}, Lng: ${pos.coords.longitude.toFixed(6)}`
      }))
    })
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text-primary mb-2">Where should we come?</h2>
        <p className="text-text-secondary">Enter your location or use GPS</p>
      </div>

      <Card className="bg-obsidian-surface border-slate-border">
        <CardContent className="p-6 space-y-4">
          <div>
            <Label className="block text-sm font-medium text-text-secondary mb-1">Address</Label>
            <div className="relative">
              <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary" />
              <Input
                value={location.address}
                onChange={e => setLocation({ ...location, address: e.target.value })}
                placeholder="Enter pickup/dropoff address"
                className="pl-10 min-h-[56px]"
              />
            </div>
          </div>

          <Button
            variant="outline"
            onClick={handleUseLocation}
            className="w-full min-h-[56px] gap-2"
          >
            <MapPin className="h-5 w-5" />
            Use My Current Location
          </Button>

          <div className="aspect-video bg-slate-surface rounded-xl border border-slate-border relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center text-text-secondary">
              <MapPinIcon className="h-10 w-10 text-amber-primary/50 mb-2" />
              <p>Map Preview</p>
            </div>
            {location.lat && location.lng && (
              <div className="absolute bottom-3 left-3 right-3 bg-obsidian-surface/90 backdrop-blur-sm rounded-lg p-2 text-xs text-text-secondary">
                GPS: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function DetailsStep({ serviceCategory, setServiceCategory, problemDescription, setProblemDescription, photos, setPhotos, handleFileUpload, removePhoto }: any) {
  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text-primary mb-2">Describe the Issue</h2>
        <p className="text-text-secondary">Help us understand what needs to be done</p>
      </div>

      <Card className="bg-obsidian-surface border-slate-border">
        <CardContent className="p-6 space-y-6">
          <div>
            <Label className="block text-sm font-medium text-text-secondary mb-1">Service Category</Label>
            <Select value={serviceCategory} onValueChange={setServiceCategory}>
              <SelectTrigger className="min-h-[56px]">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {SERVICE_CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="block text-sm font-medium text-text-secondary mb-1">Problem Description</Label>
            <Textarea
              value={problemDescription}
              onChange={e => setProblemDescription(e.target.value)}
              placeholder="Describe the issue, sounds, symptoms, when it started..."
              className="min-h-[120px] bg-slate-surface border-slate-border"
              rows={4}
              required
            />
            <p className="text-xs text-text-secondary mt-1">Be as detailed as possible for accurate quotes</p>
          </div>

          <div>
            <Label className="block text-sm font-medium text-text-secondary mb-1">Photos (Optional, up to 3)</Label>
            <div className="grid grid-cols-3 gap-3">
              {photos.map((file, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-slate-surface border border-slate-border">
                  <img src={URL.createObjectURL(file)} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removePhoto(idx)} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-500">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {photos.length < 3 && (
                <label className="relative aspect-square rounded-xl border-2 border-dashed border-slate-border bg-slate-surface cursor-pointer hover:border-amber-primary/50 hover:bg-amber-subtle transition-all flex items-center justify-center">
                  <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => e.target.files && handleFileUpload(e.target.files)} />
                  <Camera className="h-8 w-8 text-text-secondary" />
                </label>
              )}
            </div>
            <p className="text-xs text-text-secondary mt-1">{photos.length}/3 photos added</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function PriceStep({ serviceCategory, priceRange, setPriceRange }: any) {
  const estimate = serviceCategory ? PRICE_ESTIMATES[serviceCategory] : PRICE_ESTIMATES["Other"]

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text-primary mb-2">Price Estimate</h2>
        <p className="text-text-secondary">Set your budget range for this service</p>
      </div>

      <Card className="bg-obsidian-surface border-slate-border">
        <CardContent className="p-6 space-y-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="text-center">
                <p className="text-text-secondary text-sm">Estimated Range</p>
                <p className="text-3xl font-bold text-amber-primary font-mono">{formatCurrency(estimate.min)} - {formatCurrency(estimate.max)}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Min Budget</span>
                <span className="font-bold text-text-primary font-mono">{formatCurrency(priceRange[0])}</span>
              </div>
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                max={estimate.max * 1.5}
                min={0}
                step={1000}
                className="h-2"
              />
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Max Budget</span>
                <span className="font-bold text-text-primary font-mono">{formatCurrency(priceRange[1])}</span>
              </div>
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                max={estimate.max * 1.5}
                min={0}
                step={1000}
                className="h-2"
              />
            </div>
          </div>

          <div className="p-4 bg-slate-surface rounded-xl border border-slate-border">
            <p className="text-text-secondary text-sm">
              <strong>Note:</strong> Final price will be agreed with the mechanic after inspection. This range helps match you with mechanics in your budget.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function ReviewStep({ serviceType, vehicle, location, serviceCategory, problemDescription, photos, priceRange, submitting, error, onSubmit }: any) {
  const serviceTypeInfo = SERVICE_TYPES.find(s => s.id === serviceType)

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text-primary mb-2">Review Your Booking</h2>
        <p className="text-text-secondary">Confirm all details are correct</p>
      </div>

      <div className="space-y-4">
        <Card className="bg-obsidian-surface border-slate-border">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              {(() => {
                const Icon = serviceTypeInfo?.icon
                return Icon ? <Icon className={cn("h-5 w-5", serviceTypeInfo?.color)} /> : null
              })()}
              Service Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-text-primary font-medium">{serviceTypeInfo?.label}</p>
            <p className="text-text-secondary text-sm">{serviceTypeInfo?.desc}</p>
          </CardContent>
        </Card>

        {vehicle && (
          <Card className="bg-obsidian-surface border-slate-border">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5 text-amber-primary" />
                Vehicle
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-bold text-text-primary">{vehicle.make} {vehicle.model}</p>
              <p className="text-text-secondary font-mono text-sm">{vehicle.registration}</p>
              <p className="text-text-secondary text-xs">{vehicle.year} · {vehicle.color}</p>
            </CardContent>
          </Card>
        )}

        <Card className="bg-obsidian-surface border-slate-border">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-amber-primary" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium text-text-primary">{location.address}</p>
            {location.lat && location.lng && (
              <p className="text-text-secondary text-xs font-mono">GPS: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-obsidian-surface border-slate-border">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-amber-primary" />
              Service Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-text-secondary">Category</span>
              <span className="font-medium text-text-primary">{serviceCategory}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Description</span>
              <span className="font-medium text-text-primary text-right max-w-[60%]">{problemDescription}</span>
            </div>
            {photos.length > 0 && (
              <div className="flex justify-between">
                <span className="text-text-secondary">Photos</span>
                <span className="font-medium text-text-primary">{photos.length} attached</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-obsidian-surface border-slate-border border-amber-primary/20 bg-amber-subtle/30">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-amber-primary" />
              Estimated Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Range</span>
              <span className="text-2xl font-bold text-amber-primary font-mono">{formatCurrency(priceRange[0])} - {formatCurrency(priceRange[1])}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <div className="p-4 bg-status-danger/10 border border-status-danger/20 rounded-xl text-status-danger text-sm flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          {error}
        </div>
      )}

      <p className="text-xs text-text-secondary text-center">
        By confirming, you agree to our Terms of Service and authorize SpareSpark to match you with verified mechanics.
      </p>
    </motion.div>
  )
}