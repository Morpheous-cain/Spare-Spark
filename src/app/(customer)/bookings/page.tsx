"use client"

import { useState, useEffect } from "react"
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
import { Plus, Calendar, MapPin, CreditCard, ChevronRight, ArrowLeft, MessageSquare, Phone, Star, Shield, Clock, Check, Wrench, Car } from "lucide-react"
import { formatCurrency, formatDate, cn } from "@/lib/utils"

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
  DISPUTED: "bg-red-500/15 text-red-300",
}

const statusOrder = ["PENDING", "MATCHED", "ACCEPTED", "EN_ROUTE", "ARRIVED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "DISPUTED"]

export default function BookingsPage() {
  const [jobs, setJobs] = useState<any[]>([])
  const [filter, setFilter] = useState<"all" | "active" | "completed" | "cancelled">("all")
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    async function fetchJobs() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: jobsData } = await supabase
        .from("jobs")
        .select(`
          *,
          vehicle:vehicles(*),
          mechanic:mechanic_profiles(
            id,
            full_name,
            rating_avg,
            total_jobs,
            avatar_url
          ),
          transaction:transactions(*)
        `)
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false })

      if (jobsData) setJobs(jobsData)
      setLoading(false)
    }
    fetchJobs()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => window.location.reload())
    return () => subscription.unsubscribe()
  }, [])

  const filteredJobs = jobs.filter(job => {
    if (filter === "all") return true
    if (filter === "active") return !["COMPLETED", "CANCELLED"].includes(job.status)
    if (filter === "completed") return job.status === "COMPLETED"
    if (filter === "cancelled") return job.status === "CANCELLED"
    return true
  })

  const getStatusIndex = (status: string) => statusOrder.indexOf(status)

  return (
    <div className="min-h-screen bg-obsidian-bg py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-100">My Bookings</h1>
              <p className="text-slate-400 mt-1">Track and manage all your service requests</p>
            </div>
            <Link href="/customer/bookings/new">
              <Button className="bg-amber-burst text-white shadow-amber-glow hover:opacity-90 rounded-xl min-h-[56px]">
                <Plus className="h-4 w-4 mr-2" />
                New Booking
              </Button>
            </Link>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6">
            {["all", "active", "completed", "cancelled"].map(f => (
              <Button
                key={f}
                variant={filter === f ? "default" : "outline"}
                onClick={() => setFilter(f as "all" | "active" | "completed" | "cancelled")}
                className={cn(
                  "rounded-xl",
                  filter === f ? "bg-amber-burst text-white border-slate-border" : "border-slate-border text-slate-300 hover:bg-slate-700/40"
                )}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Button>
            ))}
          </div>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-amber-primary border-t-transparent" />
          </div>
        ) : filteredJobs.length === 0 ? (
          <motion.div initial="hidden" animate="visible" className="text-center py-16 bg-obsidian-surface border border-slate-border rounded-2xl shadow-card-elev">
            <Wrench className="h-16 w-16 mx-auto text-slate-600 mb-4" />
            <h3 className="text-lg font-medium text-slate-100 mb-2">No bookings yet</h3>
            <p className="text-slate-400 mb-6">{filter === "all" ? "You haven't booked any services yet" : `No ${filter} bookings found`}</p>
            <Link href="/customer/bookings/new">
              <Button className="bg-amber-burst text-white shadow-amber-glow hover:opacity-90 rounded-xl min-h-[56px]">
                <Plus className="h-4 w-4 mr-2" />
                Book Your First Service
              </Button>
            </Link>
          </motion.div>
        ) : (
          <motion.div variants={containerVariants} className="space-y-4">
            {filteredJobs
              .sort((a, b) => getStatusIndex(a.status) - getStatusIndex(b.status))
              .map((job) => (
                <motion.div key={job.id} variants={cardEntrance}>
                  <Link href={`/customer/bookings/${job.id}`} className="block">
                    <Card className={cn("bg-obsidian-surface border rounded-2xl shadow-card-elev transition-all hover:shadow-amber-glow", job.status === "COMPLETED" ? "border-emerald-500/30" : job.status === "CANCELLED" ? "border-red-500/30" : "border-slate-border")}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-bold text-slate-100">{job.service_category.replace(/_/g, " ")}</h3>
                            <p className="text-sm text-slate-400 mt-1">Booked on {formatDate(job.created_at)}</p>
                          </div>
                          <Badge className={statusColors[job.status] || "bg-slate-700/40 text-slate-300"}>{job.status}</Badge>
                        </div>

                        <div className="grid gap-3 md:grid-cols-3 mb-4">
                          {job.vehicle && (
                            <div className="flex items-center gap-2">
                              <Car className="h-5 w-5 text-slate-400" />
                              <span className="font-medium text-slate-100">{job.vehicle.make} {job.vehicle.model}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-slate-400" />
                            <span className="text-sm text-slate-400 truncate">{job.location_address}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-slate-400" />
                            <span className="font-bold text-amber-glow">{job.agreed_price ? formatCurrency(job.agreed_price) : "Pending"}</span>
                          </div>
                        </div>

                        {job.mechanic && (
                          <div className="flex items-center gap-3 p-3 bg-slate-700/40 rounded-xl">
                            <div className="w-10 h-10 rounded-full bg-amber-subtle flex items-center justify-center text-amber-primary font-bold">
                              {job.mechanic.full_name?.charAt(0) || "M"}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-slate-100">{job.mechanic.full_name}</p>
                              <p className="text-sm text-slate-400">{job.mechanic.rating_avg || 4.9}★ • {job.mechanic.total_jobs || 0} jobs</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" onClick={(e) => e.stopPropagation()} className="border-slate-border text-slate-300 hover:bg-slate-700/40">
                                <MessageSquare className="h-4 w-4 mr-1" /> Chat
                              </Button>
                              <Button variant="outline" size="sm" onClick={(e) => e.stopPropagation()} className="border-slate-border text-slate-300 hover:bg-slate-700/40">
                                <Phone className="h-4 w-4 mr-1" /> Call
                              </Button>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-4 border-t border-slate-border">
                          <span className="text-sm text-slate-400">Status: <span className="font-medium capitalize">{job.status.toLowerCase().replace(/_/g, " ")}</span></span>
                          <Link href={`/customer/bookings/${job.id}`} className="text-amber-primary hover:underline text-sm flex items-center gap-1">
                            View Details <ChevronRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
        )}
      </div>
    </div>
  )
}