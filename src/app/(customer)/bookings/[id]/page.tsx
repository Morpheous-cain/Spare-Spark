"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { formatCurrency, formatDate } from "@/lib/utils"
import { fadeInUp, cardEntrance, staggerContainer, itemVariants } from "@/lib/animations"
import { ArrowLeft, MapPin, Calendar, CreditCard, Phone, MessageSquare, Star, Shield, Clock, Check, X, ChevronRight, ChevronLeft, Car, Wrench, DollarSign, Camera, Trash2, AlertTriangle, Copy, CheckCircle, Loader2, MapPin as MapPinIcon, Download } from "lucide-react"

const supabase = createClient()

const STATUS_ORDER = [
  "PENDING",
  "MATCHED",
  "ACCEPTED",
  "EN_ROUTE",
  "ARRIVED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "DISPUTED",
]

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  MATCHED: "Matched",
  ACCEPTED: "Accepted",
  EN_ROUTE: "En Route",
  ARRIVED: "Arrived",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  DISPUTED: "Disputed",
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-subtle text-amber-glow",
  MATCHED: "bg-blue-500/15 text-blue-300",
  ACCEPTED: "bg-blue-500/15 text-blue-300",
  EN_ROUTE: "bg-amber-subtle text-amber-primary",
  ARRIVED: "bg-violet-500/15 text-violet-300",
  IN_PROGRESS: "bg-emerald-500/15 text-emerald-300",
  COMPLETED: "bg-emerald-500/15 text-emerald-300",
  CANCELLED: "bg-red-500/15 text-red-300",
  DISPUTED: "bg-red-500/15 text-red-300",
}

const StatusIcon: React.FC<{ status: string; current?: boolean }> = ({ status, current }) => {
  const icons: Record<string, React.ComponentType<{ className?: string }>> = {
    PENDING: Clock,
    MATCHED: Shield,
    ACCEPTED: CheckCircle,
    EN_ROUTE: MapPinIcon,
    ARRIVED: MapPinIcon,
    IN_PROGRESS: Wrench,
    COMPLETED: CheckCircle,
    CANCELLED: X,
    DISPUTED: AlertTriangle,
  }
  const Icon = icons[status] || Clock
  return <Icon className={cn("h-5 w-5", current && "text-amber-primary")} />
}

export default function BookingDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [job, setJob] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState("")
  const [submittingReview, setSubmittingReview] = useState(false)
  const [showReviewDialog, setShowReviewDialog] = useState(false)

  useEffect(() => {
    async function fetchJob() {
      try {
        const { data, error } = await supabase
          .from("jobs")
          .select(`
            *,
            vehicle:vehicles(*),
            mechanic:mechanic_profiles(id, full_name, phone, rating_avg, total_jobs, avatar_url),
            transaction:transactions(*)
          `)
          .eq("id", id)
          .single()

        if (error) throw error
        setJob(data)
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    fetchJob()

    const channel = supabase
      .channel(`job:${id}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "jobs", filter: `id=eq.${id}` }, payload => {
        setJob((prev: any) => prev ? { ...prev, ...payload.new } : null)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel).catch(() => {})
    }
  }, [id])

  useEffect(() => {
    if (job?.status === "EN_ROUTE" || job?.status === "ARRIVED") {
      const channel = supabase
        .channel(`mechanic_location:${job.mechanic?.id}`)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "mechanic_locations", filter: `mechanic_id=eq.${job.mechanic?.id}` }, payload => {
          console.log("Mechanic location update:", payload.new)
        })
        .subscribe()
      return () => {
        supabase.removeChannel(channel).catch(() => {})
      }
    }
  }, [job?.status, job?.mechanic?.id])

  const handleCancel = async () => {
    setCancelling(true)
    try {
      const { error } = await supabase.from("jobs").update({ status: "CANCELLED" }).eq("id", id)
      if (error) throw error
      router.refresh()
      setShowCancelDialog(false)
    } catch (e: any) {
      alert(e.message)
    } finally {
      setCancelling(false)
    }
  }

  const handleSubmitReview = async () => {
    setSubmittingReview(true)
    try {
      const { error } = await supabase.from("reviews").insert({
        job_id: id,
        customer_id: job.customer_id,
        mechanic_id: job.mechanic_id,
        rating,
        comment: review,
      })
      if (error) throw error
      await supabase.from("jobs").update({ rating_submitted: true }).eq("id", id)
      setShowReviewDialog(false)
      router.refresh()
    } catch (e: any) {
      alert(e.message)
    } finally {
      setSubmittingReview(false)
    }
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(job.location_address)
    alert("Address copied to clipboard")
  }

  const currentStatusIndex = STATUS_ORDER.indexOf(job?.status || "PENDING")

  if (loading) {
    return (
      <div className="min-h-screen bg-obsidian-bg text-text-primary font-inter">
        <header className="border-b border-slate-border bg-obsidian-surface/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-6 py-4 flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-text-secondary hover:text-amber-primary min-h-[44px]">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1 text-center">
              <h1 className="text-xl font-bold text-text-primary">Booking Details</h1>
            </div>
            <div className="w-10" />
          </div>
        </header>
        <main className="container mx-auto px-6 py-8">
          <div className="space-y-6 animate-pulse" role="status" aria-label="Loading booking details">
            <Card className="bg-obsidian-surface border-slate-border">
              <CardContent className="p-6">
                <Skeleton className="h-8 w-48 rounded mb-4" />
                <Skeleton className="h-4 w-3/4 rounded" />
              </CardContent>
            </Card>
            <Card className="bg-obsidian-surface border-slate-border">
              <CardContent className="p-6">
                <Skeleton className="h-8 w-48 rounded mb-4" />
                <Skeleton className="h-4 w-full rounded" />
              </CardContent>
            </Card>
            <Card className="bg-obsidian-surface border-slate-border">
              <CardContent className="p-6">
                <Skeleton className="h-8 w-48 rounded mb-4" />
                <Skeleton className="h-4 w-full rounded" />
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-obsidian-bg text-text-primary font-inter flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center px-6">
          <AlertTriangle className="h-16 w-16 text-status-danger mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-text-primary mb-3">Booking Not Found</h1>
          <p className="text-text-secondary mb-6">This booking may have been removed or you don't have access to it.</p>
          <Button onClick={() => router.push("/customer/dashboard")} className="min-h-[56px] bg-amber-burst shadow-amber-glow hover:opacity-90 rounded-xl">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </motion.div>
      </div>
    )
  }

  const canCancel = ["PENDING", "MATCHED"].includes(job.status)
  const canReview = job.status === "COMPLETED" && !job.rating_submitted
  const showTracking = ["EN_ROUTE", "ARRIVED"].includes(job.status)

  return (
    <div className="min-h-screen bg-obsidian-bg text-text-primary font-inter">
      <header className="border-b border-slate-border bg-obsidian-surface/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-text-secondary hover:text-amber-primary min-h-[44px]">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-text-primary">Booking #{job.id?.slice(0, 8)}</h1>
            <Badge variant="outline" className={cn("mt-1", STATUS_COLORS[job.status])}>
              {STATUS_LABELS[job.status]}
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
          <motion.div variants={cardEntrance} className="relative">
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center relative">
                {STATUS_ORDER.map((status, idx) => (
                  <motion.div key={status} variants={itemVariants} style={{ transitionDelay: `${idx * 0.05}s` }}>
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center border-2 mb-2 relative z-10 transition-all duration-300",
                      idx < currentStatusIndex
                        ? "bg-amber-burst border-amber-primary text-white shadow-amber-glow"
                        : idx === currentStatusIndex
                        ? "bg-obsidian-surface border-amber-primary text-amber-primary shadow-amber-glow/50"
                        : ["CANCELLED", "DISPUTED"].includes(job.status) && idx === STATUS_ORDER.indexOf(job.status)
                        ? "bg-red-500/20 border-red-500 text-red-400"
                        : "bg-obsidian-surface border-slate-border text-text-secondary"
                    )}>
                      {idx < currentStatusIndex ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <StatusIcon status={status} current={idx === currentStatusIndex} />
                      )}
                    </div>
                    {idx < STATUS_ORDER.length - 1 && (
                      <motion.div
                        className="w-0.5 flex-1 max-h-16"
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: idx < currentStatusIndex ? 1 : 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                        style={{ background: idx < currentStatusIndex ? "linear-gradient(to bottom, #FF5E3A, #FF8A50)" : "#2A3548" }}
                      />
                    )}
                    <span className={cn(
                      "text-xs text-center w-24 mt-1",
                      idx <= currentStatusIndex ? "text-text-primary font-medium" : "text-text-secondary"
                    )}>
                      {STATUS_LABELS[status]}
                    </span>
                  </motion.div>
                ))}
              </div>
              <div className="flex-1">
                {job.status === "EN_ROUTE" && (
                  <div className="mb-4 p-3 bg-amber-subtle border border-amber-primary/30 rounded-xl flex items-center gap-3 animate-pulse">
                    <div className="w-3 h-3 rounded-full bg-amber-primary animate-ping" style={{ boxShadow: "0 0 0 4px rgba(255, 94, 58, 0.4)" }} />
                    <span className="text-amber-primary font-medium">LIVE TRACKING ACTIVE</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div variants={cardEntrance}>
            <Card className="bg-obsidian-surface border-slate-border shadow-card-elev rounded-2xl">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2">
                      <Car className="h-5 w-5 text-amber-primary" />
                      Vehicle Details
                    </h3>
                    {job.vehicle && (
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Make & Model</span>
                          <span className="font-medium text-text-primary font-mono">{job.vehicle.make} {job.vehicle.model}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Registration</span>
                          <span className="font-medium text-text-primary font-mono">{job.vehicle.registration}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Year</span>
                          <span className="font-medium text-text-primary">{job.vehicle.year}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Color</span>
                          <span className="font-medium text-text-primary">{job.vehicle.color}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-amber-primary" />
                      Service Location
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-text-secondary mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-text-primary">{job.location_address}</p>
                          {job.location_lat && job.location_lng && (
                            <p className="text-xs text-text-secondary font-mono">GPS: {job.location_lat.toFixed(6)}, {job.location_lng.toFixed(6)}</p>
                          )}
                        </div>
                        <Button variant="ghost" size="sm" onClick={copyAddress} className="text-text-secondary hover:text-amber-primary">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-3 ml-8">
                        <Calendar className="h-5 w-5 text-text-secondary flex-shrink-0" />
                        <span className="text-text-secondary">{formatDate(job.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardEntrance}>
            <Card className="bg-obsidian-surface border-slate-border shadow-card-elev rounded-2xl">
              <CardContent className="p-6">
                <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-amber-primary" />
                  Service Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-text-secondary text-sm">Category</p>
                    <p className="font-medium text-text-primary">{job.service_category}</p>
                  </div>
                  <div>
                    <p className="text-text-secondary text-sm">Estimated Price</p>
                    <p className="font-medium text-text-primary font-mono">
                      {formatCurrency(job.price_estimate_min)} - {formatCurrency(job.price_estimate_max)}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-secondary text-sm">Agreed Price</p>
                    <p className="font-medium text-text-primary font-mono">
                      {job.agreed_price ? formatCurrency(job.agreed_price) : "Not agreed"}
                    </p>
                  </div>
                  <div className="md:col-span-3">
                    <p className="text-text-secondary text-sm">Problem Description</p>
                    <p className="font-medium text-text-primary mt-1 whitespace-pre-wrap">{job.problem_description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {job.mechanic && (
            <motion.div variants={cardEntrance}>
              <Card className="bg-obsidian-surface border-slate-border shadow-card-elev rounded-2xl">
                <CardContent className="p-6">
                  <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-amber-primary" />
                    Assigned Mechanic
                  </h3>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={job.mechanic.avatar_url} alt={job.mechanic.full_name} />
                      <AvatarFallback className="bg-amber-burst text-white text-xl font-bold">
                        {job.mechanic.full_name?.charAt(0) || "M"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-text-primary">{job.mechanic.full_name}</h4>
                      <div className="flex items-center gap-4 mt-1 text-sm text-text-secondary">
                        <span className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          {job.mechanic.rating_avg?.toFixed(1) || "5.0"}
                        </span>
                        <span>{job.mechanic.total_jobs || 0} jobs completed</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" className="min-h-[44px] min-w-[44px]" onClick={() => window.open(`tel:${job.mechanic.phone}`)}>
                        <Phone className="h-5 w-5" />
                      </Button>
                      <Button variant="outline" size="icon" className="min-h-[44px] min-w-[44px]">
                        <MessageSquare className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {showTracking && job.mechanic && (
            <motion.div variants={cardEntrance}>
              <Card className="bg-obsidian-surface border-slate-border shadow-card-elev rounded-2xl border-amber-primary/20 bg-amber-subtle/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPinIcon className="h-5 w-5 text-amber-primary animate-pulse" />
                    Live Tracking
                  </CardTitle>
                  <CardDescription>Mechanic is en route to your location</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-4 h-4 rounded-full bg-amber-primary">
                        <motion.div animate={{ scale: [1, 1.3, 1], transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" } }} className="w-full h-full rounded-full bg-amber-primary opacity-30" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-text-primary">{job.mechanic.full_name} is on the way</p>
                      <p className="text-text-secondary text-sm">Approximately 2.3 km away · ETA: 8 min</p>
                    </div>
                  </div>
                  <Progress value={65} className="h-3 bg-slate-border" />
                  <div className="flex justify-between text-sm text-text-secondary">
                    <span>Your Location</span>
                    <span>Mechanic Location</span>
                  </div>
                  <div className="aspect-video bg-slate-surface rounded-xl border border-slate-border relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center text-text-secondary">
                      <MapPinIcon className="h-10 w-10 text-amber-primary/50 mb-2" />
                      <p>Live Map View</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {job.transaction && (
            <motion.div variants={cardEntrance}>
              <Card className="bg-obsidian-surface border-slate-border shadow-card-elev rounded-2xl">
                <CardContent className="p-6">
                  <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-amber-primary" />
                    Payment
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-text-secondary text-sm">Status</p>
                      <Badge variant="outline" className={cn(
                        job.transaction.status === "COMPLETED" && "bg-emerald-500/15 text-emerald-300",
                        job.transaction.status === "PENDING" && "bg-amber-subtle text-amber-glow",
                        job.transaction.status === "FAILED" && "bg-red-500/15 text-red-300"
                      )}>
                        {job.transaction.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-text-secondary text-sm">Method</p>
                      <p className="font-medium text-text-primary capitalize">{job.transaction.method?.toLowerCase() || "M-Pesa"}</p>
                    </div>
                    <div>
                      <p className="text-text-secondary text-sm">Amount</p>
                      <p className="font-bold text-text-primary text-lg font-mono">{formatCurrency(job.transaction.amount)}</p>
                    </div>
                    <div className="md:col-span-3 flex gap-2">
                      <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" /> Download Receipt</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <motion.div variants={cardEntrance}>
            <Card className="bg-obsidian-surface border-slate-border shadow-card-elev rounded-2xl">
              <CardContent className="p-6">
                <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2">
                  <Camera className="h-5 w-5 text-amber-primary" />
                  Service Photos
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="aspect-square rounded-xl bg-slate-surface border border-slate-border flex items-center justify-center">
                      <Camera className="h-10 w-10 text-text-secondary" />
                    </div>
                  ))}
                </div>
                <p className="text-text-secondary text-sm mt-3 text-center">Before/after photos will appear here after service completion</p>
              </CardContent>
            </Card>
          </motion.div>

          {canReview && (
            <motion.div variants={cardEntrance}>
              <Card className="bg-obsidian-surface border-slate-border shadow-card-elev rounded-2xl border-emerald-500/20 bg-emerald-500/5">
                <CardContent className="p-6">
                  <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-400" />
                    Rate Your Experience
                  </h3>
                  <p className="text-text-secondary mb-6">How was your service with {job.mechanic?.full_name || "the mechanic"}?</p>
                  <Button
                    variant="outline"
                    onClick={() => setShowReviewDialog(true)}
                    className="w-full min-h-[56px] bg-amber-burst shadow-amber-glow hover:opacity-90 border-amber-primary"
                  >
                    <Star className="h-5 w-5 mr-2 fill-yellow-400 text-yellow-400" />
                    Write a Review
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {canCancel && (
            <motion.div variants={cardEntrance}>
              <Card className="bg-obsidian-surface border-slate-border shadow-card-elev rounded-2xl border-red-500/20 bg-red-500/5">
                <CardContent className="p-6">
                  <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full min-h-[56px] border-red-500/50 text-red-400 hover:bg-red-500/10">
                        <X className="h-5 w-5 mr-2" />
                        Cancel Booking
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-obsidian-surface border-slate-border">
                      <DialogHeader>
                        <DialogTitle>Cancel Booking?</DialogTitle>
                        <DialogDescription>This action cannot be undone. The mechanic will be notified.</DialogDescription>
                      </DialogHeader>
                      <div className="flex gap-3 mt-4">
                        <Button variant="outline" onClick={() => setShowCancelDialog(false)} className="flex-1">Keep Booking</Button>
                        <Button onClick={handleCancel} disabled={cancelling} className="flex-1 bg-red-500 hover:bg-red-600">
                          {cancelling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <>Confirm Cancel</>}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </main>

      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="bg-obsidian-surface border-slate-border max-w-md">
          <DialogHeader>
            <DialogTitle>Rate & Review</DialogTitle>
            <DialogDescription>Your feedback helps others choose the best mechanic</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-center gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 text-3xl transition-colors"
                  style={{ color: star <= rating ? "#F59E0B" : "#2A3548" }}
                >
                  ★
                </button>
              ))}
            </div>
            <Textarea
              value={review}
              onChange={e => setReview(e.target.value)}
              placeholder="Write your review..."
              className="min-h-[100px] bg-slate-surface border-slate-border"
              rows={4}
            />
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowReviewDialog(false)} className="flex-1">Cancel</Button>
              <Button onClick={handleSubmitReview} disabled={submittingReview || rating === 0} className="flex-1 bg-amber-burst shadow-amber-glow hover:opacity-90">
                {submittingReview ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <>Submit Review</>}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}