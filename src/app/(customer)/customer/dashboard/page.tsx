"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  containerVariants,
  itemVariants,
  fadeInUp,
  cardEntrance,
  staggerContainer,
} from "@/lib/animations"
import {
  Activity,
  Car,
  DollarSign,
  Star,
  AlertCircle,
  Calendar,
  Package,
  ArrowRight,
  MapPin,
  Phone,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Navigation,
  Wrench,
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  Eye,
  X,
  TrendingUp,
  Search,
} from "lucide-react"
import { formatCurrency, formatDate, cn } from "@/lib/utils"

const supabase = createClient()

// ── Status configs (shared) ──────────────────────────────────────────

const STATUS_ORDER = [
  "PENDING", "MATCHED", "ACCEPTED", "EN_ROUTE", "ARRIVED", "IN_PROGRESS", "COMPLETED",
] as const

const STATUS_CONFIG: Record<string, { label: string; icon: typeof CheckCircle; classes: string }> = {
  PENDING:     { label: "Finding Mechanic", icon: Search,      classes: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" },
  MATCHED:     { label: "Matched",          icon: CheckCircle, classes: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
  ACCEPTED:    { label: "Accepted",         icon: CheckCircle, classes: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
  EN_ROUTE:    { label: "En Route",         icon: Navigation,  classes: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300" },
  ARRIVED:     { label: "Arrived",          icon: MapPin,      classes: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" },
  IN_PROGRESS: { label: "In Progress",      icon: Wrench,      classes: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300" },
  COMPLETED:   { label: "Completed",        icon: CheckCircle, classes: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300" },
  CANCELLED:   { label: "Cancelled",        icon: XCircle,     classes: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
  DISPUTED:    { label: "Disputed",         icon: XCircle,     classes: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
}

// ── Stat Card ────────────────────────────────────────────────────────

const STAT_COLORS = {
  orange: "bg-gradient-to-br from-orange-500/10 to-amber-500/10 text-orange-600 dark:text-orange-400",
  green:  "bg-gradient-to-br from-emerald-500/10 to-green-500/10 text-emerald-600 dark:text-emerald-400",
  amber:  "bg-gradient-to-br from-amber-500/10 to-yellow-500/10 text-amber-600 dark:text-amber-400",
  purple: "bg-gradient-to-br from-purple-500/10 to-violet-500/10 text-purple-600 dark:text-purple-400",
} as const

function StatCard({
  label, value, icon: Icon, trend, trendUp = true, color = "orange", loading = false,
}: {
  label: string; value: string; icon: typeof Activity; trend?: string; trendUp?: boolean
  color?: keyof typeof STAT_COLORS; loading?: boolean
}) {
  if (loading) {
    return (
      <Card className="border-0 shadow-sm bg-white dark:bg-gray-900">
        <CardContent className="flex items-center justify-between p-5">
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-7 w-16" />
          </div>
          <Skeleton className="h-11 w-11 rounded-xl" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="group border-0 shadow-sm hover:shadow-md bg-white dark:bg-gray-900 transition-all duration-200">
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-[13px] font-medium text-muted-foreground mb-1">{label}</p>
          <p className="text-2xl font-bold tracking-tight tabular-nums">{value}</p>
          {trend && (
            <p className={cn(
              "text-xs mt-1.5 flex items-center gap-1 font-medium",
              trendUp ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"
            )}>
              <TrendingUp className={cn("h-3 w-3", !trendUp && "rotate-180")} />
              {trend}
            </p>
          )}
        </div>
        <div className={cn("p-2.5 rounded-xl transition-transform duration-200 group-hover:scale-110", STAT_COLORS[color])}>
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  )
}

// ── Quick Action Card ────────────────────────────────────────────────

const ACTION_COLORS = {
  orange: "from-orange-500 to-amber-500",
  amber:  "from-amber-500 to-yellow-500",
  green:  "from-emerald-500 to-green-500",
} as const

function QuickActionCard({
  title, desc, icon: Icon, href, color = "orange", badge,
}: {
  title: string; desc: string; icon: typeof AlertCircle
  href?: string; color?: keyof typeof ACTION_COLORS; badge?: string
}) {
  const inner = (
    <motion.div
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "group relative p-5 rounded-2xl text-white overflow-hidden cursor-pointer",
        "bg-gradient-to-br", ACTION_COLORS[color],
        "shadow-lg shadow-orange-500/10 hover:shadow-xl hover:shadow-orange-500/20 transition-shadow duration-300"
      )}
    >
      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
      <div className="relative z-10">
        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-bold text-[15px]">{title}</h3>
          {badge && (
            <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-white/20">{badge}</span>
          )}
        </div>
        <p className="text-white/75 text-sm mb-3 leading-relaxed">{desc}</p>
        <div className="flex items-center gap-1 text-white/60 text-xs font-medium">
          <span>Get Started</span>
          <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </motion.div>
  )

  return href ? <Link href={href}>{inner}</Link> : inner
}

// ── Active Job Tracker ───────────────────────────────────────────────

function ActiveJobTracker({ booking }: { booking: any }) {
  const [mechanicLocation, setMechanicLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [eta, setEta] = useState<number | null>(null)

  const currentIndex = STATUS_ORDER.indexOf(booking.status as typeof STATUS_ORDER[number])
  const progressPercent = booking.status === "COMPLETED" ? 100 : Math.max(((currentIndex + 1) / STATUS_ORDER.length) * 100, 15)
  const currentStatus = STATUS_CONFIG[booking.status] || STATUS_CONFIG.PENDING
  const StatusIcon = currentStatus.icon

  useEffect(() => {
    if (!["EN_ROUTE", "ARRIVED"].includes(booking.status) || !booking.mechanic?.id) return
    const channel = supabase
      .channel(`tracking:${booking.id}`)
      .on("postgres_changes", {
        event: "UPDATE", schema: "public", table: "mechanic_locations",
        filter: `mechanic_id=eq.${booking.mechanic.id}`,
      }, (payload) => {
        setMechanicLocation({ lat: payload.new.lat, lng: payload.new.lng })
        if (payload.new.eta_minutes) setEta(payload.new.eta_minutes)
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [booking.id, booking.status, booking.mechanic?.id])

  return (
    <motion.div initial="hidden" animate="visible" variants={cardEntrance}>
      <Card className="relative border-0 shadow-lg overflow-hidden bg-gradient-to-br from-white to-orange-50/50 dark:from-gray-900 dark:to-orange-950/20">
        {/* Accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-amber-400" />

        <CardHeader className="pb-2 pt-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-md shadow-orange-500/20">
                <StatusIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold">{booking.service_category?.replace(/_/g, " ") || "Service"}</h3>
                <p className="text-xs text-muted-foreground">{formatDate(booking.created_at)}</p>
              </div>
            </div>
            <Badge className={cn("text-xs font-semibold", currentStatus.classes)}>
              {currentStatus.label}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pb-5">
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-[11px] text-muted-foreground font-medium">
              <span>Finding</span>
              <span>En Route</span>
              <span>Complete</span>
            </div>
            <div className="relative h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-500 to-amber-400 rounded-full"
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Job info grid */}
          <div className="grid gap-2.5 sm:grid-cols-3">
            <div className="p-3 bg-white dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
              <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Vehicle</p>
              <p className="font-semibold text-sm mt-0.5">{booking.vehicle?.make} {booking.vehicle?.model}</p>
              <p className="text-xs text-muted-foreground font-mono">{booking.vehicle?.reg_number}</p>
            </div>
            <div className="p-3 bg-white dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
              <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Location</p>
              <p className="font-semibold text-sm mt-0.5 truncate">{booking.location_address || "—"}</p>
            </div>
            <div className="p-3 bg-white dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
              <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Price</p>
              <p className="font-bold text-sm mt-0.5 text-orange-600 dark:text-orange-400 tabular-nums">
                {booking.agreed_price ? formatCurrency(booking.agreed_price) : "Pending"}
              </p>
            </div>
          </div>

          {/* Mechanic card + live tracking */}
          {booking.mechanic && (
            <div className="p-3 bg-white dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 space-y-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-orange-200 dark:border-orange-800">
                  <AvatarImage src={booking.mechanic.avatar_url} alt={booking.mechanic.full_name} />
                  <AvatarFallback className="bg-gradient-to-br from-orange-500 to-amber-500 text-white font-bold">
                    {booking.mechanic.full_name?.charAt(0) || "M"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{booking.mechanic.full_name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    {booking.mechanic.rating_avg || "4.9"} · {booking.mechanic.total_jobs || 0} jobs
                  </p>
                </div>
              </div>

              {["EN_ROUTE", "ARRIVED"].includes(booking.status) && (
                <div className="p-2.5 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-100 dark:border-orange-900/50">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-medium text-muted-foreground">Live Tracking</span>
                    <span className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400 font-semibold">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
                      </span>
                      LIVE
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-orange-500" />
                      <span className="text-muted-foreground">Distance</span>
                    </div>
                    <span className="font-semibold text-orange-600 dark:text-orange-400 text-right tabular-nums">
                      {mechanicLocation ? "2.3 km" : "Calculating..."}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-orange-500" />
                      <span className="text-muted-foreground">ETA</span>
                    </div>
                    <span className="font-semibold text-orange-600 dark:text-orange-400 text-right tabular-nums">
                      {booking.status === "ARRIVED" ? "Arrived!" : (eta ? `${eta} min` : "8 min")}
                    </span>
                  </div>
                  <Progress value={booking.status === "ARRIVED" ? 100 : 65} className="h-1.5 mt-2.5" />
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-1">
            {booking.mechanic?.phone && (
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => window.open(`tel:${booking.mechanic.phone}`)}>
                <Phone className="h-3.5 w-3.5" /> Call
              </Button>
            )}
            {!["COMPLETED", "CANCELLED"].includes(booking.status) && (
              <Button variant="outline" size="sm" className="gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" /> Chat
              </Button>
            )}
            {booking.status === "COMPLETED" && !booking.rating_submitted && (
              <Button size="sm" className="gap-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:opacity-90">
                <Star className="h-3.5 w-3.5" /> Rate & Review
              </Button>
            )}
            <Link href={`/customer/bookings/${booking.id}`}>
              <Button variant="ghost" size="sm" className="gap-1.5">
                <Eye className="h-3.5 w-3.5" /> Details
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ── Vehicles Tab ─────────────────────────────────────────────────────

function VehiclesTab({ vehicles, setVehicles }: { vehicles: any[]; setVehicles: (fn: (prev: any[]) => any[]) => void }) {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ reg_number: "", make: "", model: "", year: "", color: "", is_default: false })
  const [saving, setSaving] = useState(false)

  const resetForm = () => { setForm({ reg_number: "", make: "", model: "", year: "", color: "", is_default: false }); setEditing(null); setShowForm(false) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }

    if (form.is_default) {
      await supabase.from("vehicles").update({ is_default: false }).eq("owner_id", user.id)
    }

    const payload = { ...form, owner_id: user.id }
    const { error } = editing
      ? await supabase.from("vehicles").update(payload).eq("id", editing.id)
      : await supabase.from("vehicles").insert(payload)

    if (!error) { resetForm(); window.location.reload() }
    setSaving(false)
  }

  const deleteVehicle = async (id: string) => {
    if (!confirm("Delete this vehicle?")) return
    const { error } = await supabase.from("vehicles").delete().eq("id", id)
    if (!error) setVehicles((prev: any[]) => prev.filter((v: any) => v.id !== id))
  }

  const setDefault = async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from("vehicles").update({ is_default: false }).eq("owner_id", user.id)
    await supabase.from("vehicles").update({ is_default: true }).eq("id", id)
    window.location.reload()
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">My Vehicles</h2>
          <p className="text-sm text-muted-foreground">Manage your registered vehicles</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true) }} size="sm" className="gap-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:opacity-90">
          <Plus className="h-4 w-4" /> Add Vehicle
        </Button>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={(e) => { if (e.target === e.currentTarget) resetForm() }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-800"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold">{editing ? "Edit Vehicle" : "Add Vehicle"}</h2>
                <button onClick={resetForm} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="reg">Registration Number</Label>
                  <Input id="reg" value={form.reg_number} onChange={e => setForm(p => ({ ...p, reg_number: e.target.value.toUpperCase() }))} placeholder="KCA 123A" required disabled={saving} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Make</Label>
                    <Input value={form.make} onChange={e => setForm(p => ({ ...p, make: e.target.value }))} placeholder="Toyota" required disabled={saving} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Model</Label>
                    <Input value={form.model} onChange={e => setForm(p => ({ ...p, model: e.target.value }))} placeholder="Premio" required disabled={saving} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Year</Label>
                    <Input type="number" value={form.year} onChange={e => setForm(p => ({ ...p, year: e.target.value }))} placeholder="2019" min="1990" max={new Date().getFullYear() + 1} required disabled={saving} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Color</Label>
                    <Input value={form.color} onChange={e => setForm(p => ({ ...p, color: e.target.value }))} placeholder="Silver" disabled={saving} />
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.is_default} onChange={e => setForm(p => ({ ...p, is_default: e.target.checked }))} className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500" disabled={saving} />
                  <span className="text-sm text-muted-foreground">Set as default vehicle</span>
                </label>
                <div className="flex gap-2.5 pt-2">
                  <Button type="button" variant="outline" onClick={resetForm} className="flex-1" disabled={saving}>Cancel</Button>
                  <Button type="submit" disabled={saving} className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:opacity-90">
                    {saving ? <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" />Saving...</> : (editing ? "Update" : "Save")}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vehicle grid */}
      {vehicles.length === 0 ? (
        <motion.div variants={cardEntrance} initial="hidden" animate="visible"
          className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800"
        >
          <Car className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-700 mb-3" />
          <h3 className="font-semibold mb-1">No vehicles yet</h3>
          <p className="text-sm text-muted-foreground mb-5">Add your first vehicle to book services faster</p>
          <Button onClick={() => { resetForm(); setShowForm(true) }} className="gap-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:opacity-90">
            <Plus className="h-4 w-4" /> Add Vehicle
          </Button>
        </motion.div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          {vehicles.map((v: any) => (
            <motion.div key={v.id} variants={cardEntrance}>
              <Card className="group border-0 shadow-sm hover:shadow-md bg-white dark:bg-gray-900 transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-[15px]">{v.make} {v.model}</h3>
                      <p className="text-xs text-muted-foreground">{v.year} · {v.color}</p>
                    </div>
                    {v.is_default && <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 text-[10px]">Default</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground font-mono mb-3">{v.reg_number}</p>
                  <div className="flex items-center gap-1.5">
                    {!v.is_default && (
                      <Button variant="ghost" size="sm" className="text-xs h-7 px-2" onClick={() => setDefault(v.id)}>Set Default</Button>
                    )}
                    <Button variant="ghost" size="sm" className="text-xs h-7 px-2" onClick={() => { setEditing(v); setForm({ reg_number: v.reg_number, make: v.make, model: v.model, year: v.year, color: v.color, is_default: v.is_default }); setShowForm(true) }}>
                      <Edit className="h-3 w-3 mr-1" /> Edit
                    </Button>
                    <Button variant="ghost" size="sm" className="text-xs h-7 px-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20" onClick={() => deleteVehicle(v.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}

// ── Jobs Tab ─────────────────────────────────────────────────────────

function JobsTab({ jobs }: { jobs: any[] }) {
  const [filter, setFilter] = useState<"all" | "completed" | "cancelled">("all")

  const filtered = jobs.filter(j => {
    if (filter === "completed") return j.status === "COMPLETED"
    if (filter === "cancelled") return j.status === "CANCELLED"
    return true
  })

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold">Job History</h2>
        <p className="text-sm text-muted-foreground">All your past service requests</p>
      </div>

      <div className="flex gap-1.5">
        {(["all", "completed", "cancelled"] as const).map(f => (
          <Button key={f} variant={filter === f ? "default" : "outline"} size="sm"
            onClick={() => setFilter(f)} className="rounded-lg text-xs capitalize"
          >
            {f}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
          <Wrench className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-700 mb-3" />
          <h3 className="font-semibold mb-1">No bookings found</h3>
          <p className="text-sm text-muted-foreground mb-5">
            {filter === "all" ? "You haven't booked any services yet" : `No ${filter} bookings`}
          </p>
          <Link href="/customer/bookings/new">
            <Button className="gap-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:opacity-90">
              <Plus className="h-4 w-4" /> Book Service
            </Button>
          </Link>
        </div>
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-2.5">
          {filtered.map((job: any) => {
            const st = STATUS_CONFIG[job.status] || STATUS_CONFIG.PENDING
            return (
              <motion.div key={job.id} variants={cardEntrance}>
                <Link href={`/customer/bookings/${job.id}`} className="block">
                  <Card className={cn(
                    "border-0 shadow-sm hover:shadow-md bg-white dark:bg-gray-900 transition-all duration-200 cursor-pointer",
                  )}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-[15px]">{job.service_category?.replace(/_/g, " ")}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">{formatDate(job.created_at)}</p>
                        </div>
                        <Badge className={cn("text-[10px] font-semibold", st.classes)}>
                          {st.label}
                        </Badge>
                      </div>

                      <div className="grid gap-2 sm:grid-cols-3 text-sm mb-3">
                        {job.vehicle && (
                          <div className="flex items-center gap-1.5">
                            <Car className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="font-medium text-sm">{job.vehicle.make} {job.vehicle.model}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground truncate">{job.location_address}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-bold text-orange-600 dark:text-orange-400 tabular-nums text-sm">
                            {job.agreed_price ? formatCurrency(job.agreed_price) : "Pending"}
                          </span>
                        </div>
                      </div>

                      {job.mechanic && (
                        <div className="flex items-center gap-2.5 p-2.5 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white text-xs font-bold">
                            {job.mechanic.full_name?.charAt(0) || "M"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{job.mechanic.full_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {job.mechanic.rating_avg || "4.9"}★ · {job.mechanic.total_jobs || 0} jobs
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-end pt-2.5 mt-2.5 border-t border-gray-100 dark:border-gray-800">
                        <span className="text-orange-600 dark:text-orange-400 text-xs flex items-center gap-0.5 font-medium">
                          View Details <ChevronRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </div>
  )
}

// ── Main Dashboard ───────────────────────────────────────────────────

export default function CustomerDashboard() {
  const [user, setUser] = useState<any>(null)
  const [activeBooking, setActiveBooking] = useState<any>(null)
  const [vehicles, setVehicles] = useState<any[]>([])
  const [pastJobs, setPastJobs] = useState<any[]>([])
  const [stats, setStats] = useState({ activeJobs: 0, totalVehicles: 0, totalSpent: 0, rating: 4.9 })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    let channelRef: any = null

    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUser(user)

      const [{ data: profile }, { data: userVehicles }, { data: jobs }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("vehicles").select("*").eq("owner_id", user.id),
        supabase.from("jobs")
          .select("*, vehicle:vehicles(*), mechanic:mechanic_profiles(id, full_name, rating_avg, total_jobs, avatar_url, phone)")
          .eq("customer_id", user.id)
          .order("created_at", { ascending: false }),
      ])

      if (profile) setStats(prev => ({ ...prev, rating: profile.rating || 4.9 }))
      if (userVehicles) setVehicles(userVehicles)

      if (jobs) {
        const active = jobs.find((j: any) => !["COMPLETED", "CANCELLED", "DISPUTED"].includes(j.status))
        if (active) setActiveBooking(active)
        setPastJobs(jobs.filter((j: any) => ["COMPLETED", "CANCELLED", "DISPUTED"].includes(j.status)))
        setStats(prev => ({
          ...prev,
          activeJobs: jobs.filter((j: any) => !["COMPLETED", "CANCELLED"].includes(j.status)).length,
          totalVehicles: userVehicles?.length || 0,
          totalSpent: jobs.reduce((sum: number, j: any) => sum + (j.agreed_price || 0), 0),
        }))
      }

      // Realtime job updates
      channelRef = supabase
        .channel("job_updates")
        .on("postgres_changes", { event: "*", schema: "public", table: "jobs", filter: `customer_id=eq.${user.id}` }, () => {
          fetchData() // ponytail: refetch instead of reload — upgrade to granular state update when job volume grows
        })
        .subscribe()

      setLoading(false)
    }

    fetchData()
    return () => { if (channelRef) supabase.removeChannel(channelRef) }
  }, [])

  if (loading) {
    return (
      <div className="p-4 lg:p-6 space-y-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCard key={i} label="" value="" icon={Activity} loading />
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  const statCards = [
    { label: "Active Jobs", value: stats.activeJobs.toString(), icon: Activity, trend: "+2 this week", trendUp: true, color: "orange" as const },
    { label: "Vehicles", value: stats.totalVehicles.toString(), icon: Car, color: "green" as const },
    { label: "Total Spent", value: formatCurrency(stats.totalSpent), icon: DollarSign, color: "amber" as const },
    { label: "Rating", value: `${stats.rating}★`, icon: Star, color: "purple" as const },
  ]

  const quickActions = [
    { title: "Emergency Help", desc: "Breakdown? Get help now", icon: AlertCircle, href: "/customer/bookings/new?type=emergency", color: "orange" as const, badge: "24/7" },
    { title: "Schedule Service", desc: "Book maintenance ahead", icon: Calendar, href: "/customer/bookings/new?type=scheduled", color: "amber" as const },
    { title: "Order Parts", desc: "Browse genuine spares", icon: Package, href: "/customer/parts", color: "green" as const },
  ]

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Active Job Tracker */}
      {activeBooking && (
        <motion.section variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <ActiveJobTracker booking={activeBooking} />
        </motion.section>
      )}

      {/* Stats */}
      <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        {statCards.map((stat, i) => (
          <motion.div key={stat.label} variants={itemVariants}>
            <StatCard {...stat} />
          </motion.div>
        ))}
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-800/50 p-1 rounded-xl h-10">
          <TabsTrigger value="overview" className="rounded-lg text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-900">
            Overview
          </TabsTrigger>
          <TabsTrigger value="vehicles" className="rounded-lg text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-900">
            Vehicles
          </TabsTrigger>
          <TabsTrigger value="jobs" className="rounded-lg text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-900">
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Actions */}
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="grid gap-3 sm:grid-cols-3"
          >
            {quickActions.map((action) => (
              <motion.div key={action.title} variants={itemVariants}>
                <QuickActionCard {...action} />
              </motion.div>
            ))}
          </motion.div>

          {/* Recent Bookings */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold">Recent Bookings</h2>
              <Link href="/customer/bookings" className="text-orange-600 dark:text-orange-400 hover:underline text-sm flex items-center gap-1 font-medium">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {pastJobs.length === 0 ? (
              <p className="text-center py-10 text-muted-foreground text-sm">
                No bookings yet. <Link href="/customer/bookings/new" className="text-orange-600 dark:text-orange-400 hover:underline font-medium">Book your first service</Link>
              </p>
            ) : (
              <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-2.5">
                {pastJobs.slice(0, 3).map((job: any) => {
                  const st = STATUS_CONFIG[job.status] || STATUS_CONFIG.PENDING
                  return (
                    <motion.div key={job.id} variants={cardEntrance}>
                      <Link href={`/customer/bookings/${job.id}`} className="block">
                        <Card className="border-0 shadow-sm hover:shadow-md bg-white dark:bg-gray-900 transition-all duration-200 cursor-pointer">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-bold text-[15px]">{job.service_category?.replace(/_/g, " ")}</h3>
                                <p className="text-xs text-muted-foreground">{formatDate(job.created_at)}</p>
                              </div>
                              <Badge className={cn("text-[10px] font-semibold", st.classes)}>{st.label}</Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-3">
                                {job.vehicle && (
                                  <span className="flex items-center gap-1 text-muted-foreground text-xs">
                                    <Car className="h-3 w-3" /> {job.vehicle.make} {job.vehicle.model}
                                  </span>
                                )}
                                <span className="font-bold text-orange-600 dark:text-orange-400 tabular-nums text-sm">
                                  {job.agreed_price ? formatCurrency(job.agreed_price) : "Pending"}
                                </span>
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  )
                })}
              </motion.div>
            )}
          </section>
        </TabsContent>

        <TabsContent value="vehicles">
          <VehiclesTab vehicles={vehicles} setVehicles={setVehicles} />
        </TabsContent>

        <TabsContent value="jobs">
          <JobsTab jobs={pastJobs} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
