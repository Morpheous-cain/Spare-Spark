"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  containerVariants,
  itemVariants,
  fadeInUp,
  cardEntrance,
} from "@/lib/animations"
import { Plus, Radar, MapPin, DollarSign, Star, Clock, ChevronRight, Navigation, CheckCircle, XCircle, AlertTriangle, MapPin as MapPinIcon, Loader2, Check, X, Car, Trash2 } from "lucide-react"
import { formatCurrency, formatDate, cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"

const supabase = createClient()

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-subtle text-amber-glow",
  MATCHED: "bg-blue-500/15 text-blue-300",
  ACCEPTED: "bg-blue-500/15 text-blue-300",
  EN_ROUTE: "bg-amber-subtle text-amber-primary",
  ARRIVED: "bg-violet-500/15 text-violet-300",
  IN_PROGRESS: "bg-emerald-500/15 text-emerald-300",
  COMPLETED: "bg-emerald-500/15 text-emerald-300",
  CANCELLED: "bg-red-500/15 text-red-300",
}

const distanceColors: Record<string, string> = {
  near: "bg-green-100 text-green-800",
  medium: "bg-amber-100 text-amber-800",
  far: "bg-red-100 text-red-800",
}

export default function JobsPage() {
  const router = useRouter()
  const [jobs, setJobs] = useState<any[]>([])
  const [filter, setFilter] = useState<"all" | "nearby" | "high_value">("all")
  const [loading, setLoading] = useState(true)
  const [userLocation, setUserLocation] = useState({ lat: -1.2921, lng: 36.8219 })

  useEffect(() => {
    async function fetchJobs() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: jobsData } = await supabase
        .from("jobs")
        .select(`
          *,
          customer:profiles(full_name, rating),
          vehicle:vehicles(make, model, reg_number)
        `)
        .eq("status", "PENDING")
        .order("created_at", { ascending: false })

      if (jobsData) {
        const jobsWithDistance = jobsData.map(job => {
          const distance = calculateDistance(
            userLocation.lat, userLocation.lng,
            job.location_lat, job.location_lng
          )
          let distanceCategory = "far"
          if (distance < 5) distanceCategory = "near"
          else if (distance < 15) distanceCategory = "medium"

          return {
            ...job,
            distance,
            distanceCategory,
            estimatedPayout: job.price_estimate_max || job.price_estimate_min || 0,
          }
        })
        setJobs(jobsWithDistance)
      }
      setLoading(false)
    }

    fetchJobs()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      window.location.reload()
    })
    return () => subscription.unsubscribe()
  }, [userLocation])

  const acceptJob = async (jobId: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from("jobs")
      .update({
        status: "ACCEPTED",
        mechanic_id: user.id,
        accepted_at: new Date().toISOString(),
      })
      .eq("id", jobId)
      .eq("status", "PENDING")

    if (!error) {
      window.location.reload()
    } else {
      alert("Failed to accept job: " + error.message)
    }
  }

  const declineJob = async (jobId: string) => {
    window.location.reload()
  }

  function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
      Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  return (
    <div className="min-h-screen bg-obsidian-bg py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-100">Job Radar</h1>
              <p className="text-slate-400 mt-1">Available jobs near you</p>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={true} disabled className="w-12 h-6" />
              <span className="text-sm text-slate-400">Online</span>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6">
            {["all", "nearby", "high_value"].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f as "all" | "nearby" | "high_value")}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                  filter === f
                    ? "bg-amber-burst text-white"
                    : "bg-slate-700/40 text-slate-300 hover:bg-slate-700"
                )}
              >
                {f.charAt(0).toUpperCase() + f.slice(0).replace("_", " ")}
              </button>
            ))}
          </div>
        </motion.div>

        {jobs.length === 0 && !loading ? (
          <motion.div initial="hidden" animate="visible" className="text-center py-16 bg-obsidian-surface border border-slate-border rounded-2xl shadow-card-elev">
            <Radar className="h-16 w-16 mx-auto text-slate-600 mb-4" />
            <h3 className="text-lg font-medium text-slate-100 mb-2">No jobs available</h3>
            <p className="text-slate-400 mb-6">No pending jobs in your area right now</p>
            <p className="text-sm text-slate-500">Jobs will appear here when customers request help nearby</p>
          </motion.div>
        ) : (
          <motion.div variants={containerVariants} className="space-y-4">
            {jobs
              .filter(job => {
                if (filter === "nearby") return job.distance < 10
                if (filter === "high_value") return job.estimatedPayout > 5000
                return true
              })
              .sort((a, b) => a.distance - b.distance)
              .map((job) => (
                <motion.div key={job.id} variants={cardEntrance}>
                  <Card className="bg-obsidian-surface border border-slate-border rounded-2xl shadow-card-elev hover:shadow-amber-glow/20 transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-slate-100">{job.service_category.replace(/_/g, " ")}</h3>
                          <p className="text-sm text-slate-400">Posted {formatDate(job.created_at)}</p>
                        </div>
                        <Badge className="bg-amber-subtle text-amber-glow">Pending</Badge>
                      </div>

                      <div className="grid gap-3 md:grid-cols-4 mb-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-slate-400" />
                          <span className="font-medium text-slate-100">{job.distance.toFixed(1)} km</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-5 w-5 text-slate-400" />
                          <span className="font-bold text-amber-glow">{formatCurrency(job.estimatedPayout || 0)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="h-5 w-5 text-slate-400" />
                          <span className="font-medium text-slate-100">{job.customer?.rating || 4.5}★</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-slate-400" />
                          <span className="text-sm text-slate-400 truncate max-w-[150px]">{job.location_address}</span>
                        </div>
                      </div>

                      {job.vehicle && (
                        <div className="mb-4 p-3 bg-slate-700/40 rounded-xl flex items-center gap-3">
                          <Car className="h-5 w-5 text-slate-400" />
                          <span className="font-medium text-slate-100">{job.vehicle.make} {job.vehicle.model}</span>
                          <span className="text-slate-400">({job.vehicle.reg_number})</span>
                        </div>
                      )}

                      <div className="flex gap-3">
                        <Button
                          className="flex-1 bg-amber-burst text-white shadow-amber-glow hover:opacity-90 rounded-xl min-h-[56px]"
                          onClick={() => acceptJob(job.id)}
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Accept Job
                        </Button>
                        <Button variant="outline" onClick={() => declineJob(job.id)} className="border-slate-border text-slate-300 hover:bg-slate-700/40 rounded-xl">
                          <X className="h-4 w-4 mr-2" />
                          Decline
                        </Button>
                        <Button variant="outline" className="whitespace-nowrap border-slate-border text-slate-300 hover:bg-slate-700/40 rounded-xl" onClick={() => router.push(`/mechanic/jobs/${job.id}`)}>
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
        )}
      </div>
    </div>
  )
}