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
  PENDING: "bg-yellow-100 text-yellow-800",
  MATCHED: "bg-blue-100 text-blue-800",
  ACCEPTED: "bg-blue-100 text-blue-800",
  EN_ROUTE: "bg-orange-100 text-orange-800",
  ARRIVED: "bg-purple-100 text-purple-800",
  IN_PROGRESS: "bg-green-100 text-green-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  DISPUTED: "bg-red-100 text-red-800",
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
    <div className="min-h-screen bg-gray-50/50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
              <p className="text-gray-500 mt-1">Track and manage all your service requests</p>
            </div>
            <Link href="/customer/bookings/new">
              <Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-90">
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
                  "rounded-lg",
                  filter === f ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white" : ""
                )}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Button>
            ))}
          </div>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-500 border-t-transparent" />
          </div>
        ) : filteredJobs.length === 0 ? (
          <motion.div initial="hidden" animate="visible" className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <Wrench className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
            <p className="text-gray-500 mb-6">{filter === "all" ? "You haven't booked any services yet" : `No ${filter} bookings found`}</p>
            <Link href="/customer/bookings/new">
              <Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-90">
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
                    <Card className={cn("border transition-all hover:shadow-md", job.status === "COMPLETED" ? "border-green-200" : job.status === "CANCELLED" ? "border-red-200" : "border-orange-100")}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">{job.service_category.replace(/_/g, " ")}</h3>
                            <p className="text-sm text-gray-500 mt-1">Booked on {formatDate(job.created_at)}</p>
                          </div>
                          <Badge className={statusColors[job.status] || "bg-gray-100 text-gray-800"}>{job.status}</Badge>
                        </div>

                        <div className="grid gap-3 md:grid-cols-3 mb-4">
                          {job.vehicle && (
                            <div className="flex items-center gap-2">
                              <Car className="h-5 w-5 text-gray-400" />
                              <span className="font-medium text-gray-900">{job.vehicle.make} {job.vehicle.model}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-gray-400" />
                            <span className="text-sm text-gray-600 truncate">{job.location_address}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-gray-400" />
                            <span className="font-bold text-orange-600">{job.agreed_price ? formatCurrency(job.agreed_price) : "Pending"}</span>
                          </div>
                        </div>

                        {job.mechanic && (
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                              {job.mechanic.full_name?.charAt(0) || "M"}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{job.mechanic.full_name}</p>
                              <p className="text-sm text-gray-500">{job.mechanic.rating_avg || 4.9}★ • {job.mechanic.total_jobs || 0} jobs</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" onClick={(e) => e.stopPropagation()}>
                                <MessageSquare className="h-4 w-4 mr-1" /> Chat
                              </Button>
                              <Button variant="outline" size="sm" onClick={(e) => e.stopPropagation()}>
                                <Phone className="h-4 w-4 mr-1" /> Call
                              </Button>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-4 border-t">
                          <span className="text-sm text-gray-500">Status: <span className="font-medium capitalize">{job.status.toLowerCase().replace(/_/g, " ")}</span></span>
                          <Link href={`/customer/bookings/${job.id}`} className="text-orange-600 hover:underline text-sm flex items-center gap-1">
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