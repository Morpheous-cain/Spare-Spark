"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import {
  containerVariants,
  itemVariants,
  fadeInUp,
  cardEntrance,
  staggerContainer,
} from "@/lib/animations"
import {
  Wrench,
  Car,
  DollarSign,
  Star,
  MapPin,
  Phone,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  Navigation,
  Plus,
  Edit,
  ChevronRight,
  Eye,
  TrendingUp,
  Activity,
  BarChart3,
  ShieldCheck,
  Briefcase,
  Radar,
  RefreshCw,
  HelpCircle,
  Wallet,
  History,
  Search,
} from "lucide-react"
import { formatCurrency, formatDate, cn } from "@/lib/utils"

const supabase = createClient()

// ── Status config ────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; icon: typeof CheckCircle; classes: string }> = {
  PENDING:     { label: "Pending",      icon: Search,      classes: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" },
  MATCHED:     { label: "Matched",      icon: CheckCircle, classes: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
  ACCEPTED:    { label: "Accepted",     icon: CheckCircle, classes: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
  EN_ROUTE:    { label: "En Route",     icon: Navigation,  classes: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300" },
  ARRIVED:     { label: "Arrived",      icon: MapPin,      classes: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" },
  IN_PROGRESS: { label: "In Progress",  icon: Wrench,      classes: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300" },
  COMPLETED:   { label: "Completed",    icon: CheckCircle, classes: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300" },
  CANCELLED:   { label: "Cancelled",    icon: XCircle,     classes: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
  DISPUTED:    { label: "Disputed",     icon: XCircle,     classes: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
}

// ── Stat Card ────────────────────────────────────────────────────────

const STAT_COLORS = {
  teal:   "bg-gradient-to-br from-teal-500/10 to-emerald-500/10 text-teal-600 dark:text-teal-400",
  green:  "bg-gradient-to-br from-emerald-500/10 to-green-500/10 text-emerald-600 dark:text-emerald-400",
  amber:  "bg-gradient-to-br from-amber-500/10 to-yellow-500/10 text-amber-600 dark:text-amber-400",
  purple: "bg-gradient-to-br from-purple-500/10 to-violet-500/10 text-purple-600 dark:text-purple-400",
} as const

function StatCard({
  label, value, icon: Icon, trend, trendUp = true, color = "teal", loading = false,
}: {
  label: string; value: string; icon: typeof Activity; trend?: string; trendUp?: boolean
  color?: keyof typeof STAT_COLORS; loading?: boolean
}) {
  if (loading) {
    return (
      <Card className="border-0 shadow-sm bg-white dark:bg-gray-900">
        <CardContent className="flex items-center justify-between p-5">
          <div className="space-y-2"><Skeleton className="h-3.5 w-20" /><Skeleton className="h-7 w-16" /></div>
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
            <p className={cn("text-xs mt-1.5 flex items-center gap-1 font-medium", trendUp ? "text-emerald-600 dark:text-emerald-400" : "text-red-500")}>
              <TrendingUp className={cn("h-3 w-3", !trendUp && "rotate-180")} /> {trend}
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

// ── Earnings Chart ───────────────────────────────────────────────────

function EarningsChart({ data }: { data: { day: string; amount: number }[] }) {
  const max = Math.max(...data.map(d => d.amount), 1)
  return (
    <Card className="border-0 shadow-sm bg-white dark:bg-gray-900">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold">Weekly Earnings</h3>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </div>
          <Badge variant="secondary" className="gap-1 text-xs">
            <BarChart3 className="h-3 w-3" />
            KES {data.reduce((s, d) => s + d.amount, 0).toLocaleString()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-40 flex items-end justify-between gap-1.5">
          {data.map((day, i) => (
            <TooltipProvider key={day.day}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: `${Math.max((day.amount / max) * 100, 4)}%`, opacity: 1 }}
                    transition={{ delay: i * 0.08, type: "spring", stiffness: 200, damping: 20 }}
                    className="flex-1 flex flex-col items-center gap-1.5"
                  >
                    <div
                      className={cn(
                        "w-full rounded-t bg-gradient-to-t from-teal-500 to-teal-400 transition-all",
                        i === data.length - 1 && "ring-2 ring-teal-300 ring-offset-2"
                      )}
                      style={{ height: "100%" }}
                    />
                    <span className="text-[10px] text-muted-foreground font-medium">{day.day}</span>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent side="top">{day.day}: {formatCurrency(day.amount)}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ── Active Mechanic Job Card ─────────────────────────────────────────

function ActiveMechanicJob({ job, onAction }: { job: any; onAction: (id: string) => void }) {
  const st = STATUS_CONFIG[job.status] || STATUS_CONFIG.PENDING
  const StatusIcon = st.icon

  const actionLabel: Record<string, { text: string; icon: typeof Navigation }> = {
    ACCEPTED:    { text: "Start Navigation", icon: Navigation },
    EN_ROUTE:    { text: "Mark Arrived",     icon: MapPin },
    ARRIVED:     { text: "Start Work",       icon: Wrench },
    IN_PROGRESS: { text: "Complete Job",     icon: CheckCircle },
  }
  const action = actionLabel[job.status]

  return (
    <motion.div initial="hidden" animate="visible" variants={cardEntrance}>
      <Card className="relative border-0 shadow-lg overflow-hidden bg-gradient-to-br from-white to-teal-50/50 dark:from-gray-900 dark:to-teal-950/20">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-emerald-400" />
        <CardHeader className="pb-2 pt-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-md shadow-teal-500/20">
                <StatusIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold">{job.service_category?.replace(/_/g, " ")}</h3>
                <p className="text-xs text-muted-foreground">{formatDate(job.created_at)}</p>
              </div>
            </div>
            <Badge className={cn("text-xs font-semibold", st.classes)}>{st.label}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pb-5">
          <div className="grid gap-2 sm:grid-cols-4">
            <div className="p-3 bg-white dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
              <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Distance</p>
              <p className="font-bold text-teal-600 dark:text-teal-400 text-lg tabular-nums">{job.distance?.toFixed(1)} km</p>
            </div>
            <div className="p-3 bg-white dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
              <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Payout</p>
              <p className="font-bold text-teal-600 dark:text-teal-400 text-lg tabular-nums">{formatCurrency(job.estimatedPayout || 0)}</p>
            </div>
            <div className="p-3 bg-white dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
              <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Customer</p>
              <p className="font-medium text-sm flex items-center gap-1 mt-0.5">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {job.customer?.rating || 4.5}
              </p>
            </div>
            <div className="p-3 bg-white dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
              <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Location</p>
              <p className="font-medium text-sm truncate mt-0.5">{job.location_address}</p>
            </div>
          </div>

          {job.vehicle && (
            <div className="p-2.5 bg-gray-50 dark:bg-gray-800/50 rounded-lg flex items-center gap-2.5 text-sm">
              <Car className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{job.vehicle.make} {job.vehicle.model}</span>
              <span className="text-muted-foreground">({job.vehicle.reg_number})</span>
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-1">
            {action && (
              <Button size="sm" className="gap-1.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:opacity-90" onClick={() => onAction(job.id)}>
                <action.icon className="h-3.5 w-3.5" /> {action.text}
              </Button>
            )}
            <Button variant="outline" size="sm" className="gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" /> Contact
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ── Job Radar Card ───────────────────────────────────────────────────

function JobRadarCard({ job, onAccept, onDecline }: { job: any; onAccept: (id: string) => void; onDecline: (id: string) => void }) {
  return (
    <motion.div variants={cardEntrance}>
      <Card className="border-0 shadow-sm hover:shadow-md bg-white dark:bg-gray-900 transition-all duration-200">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                <Wrench className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-[15px]">{job.service_category?.replace(/_/g, " ")}</h3>
                <p className="text-xs text-muted-foreground">{formatDate(job.created_at)}</p>
              </div>
            </div>
            <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 text-[10px] font-semibold">Pending</Badge>
          </div>

          <div className="grid gap-2 sm:grid-cols-4 text-sm mb-3">
            <div className="flex items-center gap-1.5">
              <MapPin className={cn("h-3.5 w-3.5", job.distance < 5 ? "text-emerald-500" : job.distance < 15 ? "text-amber-500" : "text-red-500")} />
              <span className="font-medium tabular-nums">{job.distance?.toFixed(1)} km</span>
            </div>
            <div className="flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5 text-teal-500" />
              <span className="font-bold text-teal-600 dark:text-teal-400 tabular-nums">{formatCurrency(job.estimatedPayout || 0)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 text-amber-400" />
              <span className="font-medium">{job.customer?.rating || 4.5}★</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground truncate">{job.location_address}</span>
            </div>
          </div>

          {job.vehicle && (
            <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg flex items-center gap-2 text-sm">
              <Car className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-medium">{job.vehicle.make} {job.vehicle.model}</span>
              <span className="text-muted-foreground text-xs">({job.vehicle.reg_number})</span>
            </div>
          )}

          <div className="flex gap-2">
            <Button size="sm" className="flex-1 gap-1.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:opacity-90" onClick={() => onAccept(job.id)}>
              <CheckCircle className="h-3.5 w-3.5" /> Accept
            </Button>
            <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={() => onDecline(job.id)}>
              <XCircle className="h-3.5 w-3.5" /> Decline
            </Button>
            <Button variant="ghost" size="sm" className="gap-1.5">
              <Eye className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ── Mechanic Profile Tab ─────────────────────────────────────────────

function MechanicProfileTab({ mechanic }: { mechanic: any }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    full_name: mechanic?.full_name || "",
    phone: mechanic?.phone || "",
    specialisations: mechanic?.specialisations || [] as string[],
    service_radius_km: mechanic?.service_radius_km || 15,
    bio: mechanic?.bio || "",
    mpesa_number: mechanic?.mpesa_number || "",
  })
  const [saving, setSaving] = useState(false)

  const specs = ["tyre_change", "jump_start", "tow", "engine_repair", "brake_repair", "electrical", "ac_repair", "body_repair", "diagnosis", "general"]

  const handleSave = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from("mechanic_profiles").update(form).eq("id", user.id)
    if (!error) { setEditing(false); window.location.reload() }
    setSaving(false)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Profile & Settings</h2>
          <p className="text-sm text-muted-foreground">Manage your professional profile</p>
        </div>
        <Button size="sm" onClick={editing ? handleSave : () => setEditing(true)}
          className="gap-1.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:opacity-90"
          disabled={saving}
        >
          {editing ? <><CheckCircle className="h-3.5 w-3.5" /> Save</> : <><Edit className="h-3.5 w-3.5" /> Edit</>}
        </Button>
      </div>

      {/* Profile header */}
      <Card className="border-0 shadow-sm bg-white dark:bg-gray-900">
        <CardContent className="p-5">
          <div className="flex items-center gap-5">
            <Avatar className="h-16 w-16 border-2 border-teal-200 dark:border-teal-800">
              <AvatarImage src={mechanic?.avatar_url} />
              <AvatarFallback className="bg-gradient-to-br from-teal-500 to-emerald-500 text-white text-xl font-bold">
                {mechanic?.full_name?.charAt(0) || "M"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-xl font-bold">{mechanic?.full_name || "Mechanic"}</h3>
              <p className="text-sm text-muted-foreground">
                {mechanic?.years_experience || 0} yrs exp · {mechanic?.total_jobs || 0} jobs
              </p>
              <div className="flex items-center gap-3 mt-2">
                <span className="flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <strong>{mechanic?.rating_avg || 4.9}</strong>
                </span>
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <ShieldCheck className="h-4 w-4" /> Verified
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal info */}
      <Card className="border-0 shadow-sm bg-white dark:bg-gray-900">
        <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Personal Information</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Full Name</Label>
              <Input value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} disabled={!editing} />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} disabled={!editing} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>M-Pesa Number</Label>
            <Input type="tel" value={form.mpesa_number} onChange={e => setForm(p => ({ ...p, mpesa_number: e.target.value }))} placeholder="+254 7XX XXX XXX" disabled={!editing} />
          </div>
        </CardContent>
      </Card>

      {/* Professional */}
      <Card className="border-0 shadow-sm bg-white dark:bg-gray-900">
        <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Professional Details</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label>Specialisations</Label>
            <div className="flex flex-wrap gap-1.5">
              {specs.map(s => (
                <label key={s} className={cn(
                  "inline-flex items-center px-2.5 py-1 rounded-full text-xs cursor-pointer transition-all border",
                  form.specialisations.includes(s)
                    ? "bg-teal-500 text-white border-teal-500"
                    : "bg-gray-100 dark:bg-gray-800 text-muted-foreground border-gray-200 dark:border-gray-700 hover:border-teal-300"
                )}>
                  <input type="checkbox" checked={form.specialisations.includes(s)} className="sr-only" disabled={!editing}
                    onChange={e => setForm(p => ({
                      ...p,
                      specialisations: e.target.checked ? [...p.specialisations, s] : p.specialisations.filter((x: string) => x !== s),
                    }))}
                  />
                  {s.replace(/_/g, " ")}
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Service Radius</Label>
            <div className="flex items-center gap-3">
              <Slider value={[form.service_radius_km]} onValueChange={([v]) => setForm(p => ({ ...p, service_radius_km: v }))} max={50} min={1} disabled={!editing} className="flex-1" />
              <span className="text-sm font-bold text-teal-600 dark:text-teal-400 w-14 text-right tabular-nums">{form.service_radius_km} km</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Bio</Label>
            <Textarea value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} placeholder="Tell customers about your expertise..." rows={3} disabled={!editing} />
          </div>
        </CardContent>
      </Card>

      {/* Availability */}
      <Card className="border-0 shadow-sm bg-white dark:bg-gray-900">
        <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Availability</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {[
            { title: "Online Status", desc: "Toggle to receive job requests", checked: mechanic?.is_online || false },
            { title: "Push Notifications", desc: "Receive alerts for new jobs", checked: true },
            { title: "Auto-Accept", desc: "Auto-accept nearby jobs", checked: false },
          ].map((item, i) => (
            <div key={item.title}>
              {i > 0 && <Separator className="mb-4" />}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-sm">{item.title}</h4>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <Switch checked={item.checked} disabled={!editing} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

// ── Earnings Tab ─────────────────────────────────────────────────────

function EarningsTab({ jobs }: { jobs: any[] }) {
  const [period, setPeriod] = useState<"week" | "month" | "year">("week")
  const completed = jobs.filter((j: any) => j.status === "COMPLETED")
  const total = completed.reduce((s: number, j: any) => s + (j.agreed_price || 0), 0)
  const weekTotal = completed
    .filter((j: any) => new Date(j.completed_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
    .reduce((s: number, j: any) => s + (j.agreed_price || 0), 0)

  // ponytail: mock weekly data — replace with real aggregation query
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  const weeklyData = days.map(day => ({ day, amount: Math.floor(Math.random() * 15000) + 2000 }))

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Earnings</h2>
          <p className="text-sm text-muted-foreground">Track income & payouts</p>
        </div>
        <div className="flex gap-1.5">
          {(["week", "month", "year"] as const).map(p => (
            <Button key={p} variant={period === p ? "default" : "outline"} size="sm" onClick={() => setPeriod(p)} className="rounded-lg text-xs capitalize">{p}</Button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="This Week" value={formatCurrency(weekTotal)} icon={TrendingUp} trend="+12%" color="teal" />
        <StatCard label="This Month" value={formatCurrency(total * 4)} icon={Wallet} trend="+8%" color="green" />
        <StatCard label="Total" value={formatCurrency(total)} icon={DollarSign} color="amber" />
      </div>

      <EarningsChart data={weeklyData} />

      <Card className="border-0 shadow-sm bg-white dark:bg-gray-900">
        <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold flex items-center gap-1.5"><History className="h-4 w-4 text-teal-500" /> Recent Payouts</CardTitle></CardHeader>
        <CardContent>
          {completed.length === 0 ? (
            <p className="text-center py-8 text-sm text-muted-foreground">No completed jobs yet</p>
          ) : (
            <div className="space-y-2">
              {completed.slice(0, 5).map((job: any) => (
                <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                      <DollarSign className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{job.service_category?.replace(/_/g, " ")}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(job.completed_at)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-teal-600 dark:text-teal-400 tabular-nums">{formatCurrency(job.agreed_price || 0)}</p>
                    <p className="text-[10px] text-emerald-600">M-Pesa</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ── Job History Tab ──────────────────────────────────────────────────

function JobHistoryTab({ jobs }: { jobs: any[] }) {
  const [filter, setFilter] = useState<"all" | "completed" | "cancelled">("all")
  const filtered = jobs.filter((j: any) => {
    if (filter === "completed") return j.status === "COMPLETED"
    if (filter === "cancelled") return j.status === "CANCELLED"
    return true
  })

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold">Job History</h2>
        <p className="text-sm text-muted-foreground">Past jobs</p>
      </div>
      <div className="flex gap-1.5">
        {(["all", "completed", "cancelled"] as const).map(f => (
          <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)} className="rounded-lg text-xs capitalize">{f}</Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
          <Wrench className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-700 mb-3" />
          <h3 className="font-semibold mb-1">No jobs found</h3>
          <p className="text-sm text-muted-foreground">{filter === "all" ? "No jobs yet" : `No ${filter} jobs`}</p>
        </div>
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-2.5">
          {filtered.map((job: any) => {
            const st = STATUS_CONFIG[job.status] || STATUS_CONFIG.PENDING
            return (
              <motion.div key={job.id} variants={cardEntrance}>
                <Card className="border-0 shadow-sm hover:shadow-md bg-white dark:bg-gray-900 transition-all duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-[15px]">{job.service_category?.replace(/_/g, " ")}</h3>
                        <p className="text-xs text-muted-foreground">{formatDate(job.completed_at || job.created_at)}</p>
                      </div>
                      <Badge className={cn("text-[10px] font-semibold", st.classes)}>{st.label}</Badge>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-3 text-sm mb-2">
                      {job.vehicle && (
                        <span className="flex items-center gap-1 text-xs"><Car className="h-3 w-3 text-muted-foreground" /> {job.vehicle.make} {job.vehicle.model}</span>
                      )}
                      <span className="flex items-center gap-1 text-xs text-muted-foreground truncate"><MapPin className="h-3 w-3" /> {job.location_address}</span>
                      <span className="font-bold text-teal-600 dark:text-teal-400 tabular-nums">{job.agreed_price ? formatCurrency(job.agreed_price) : "—"}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800 text-xs">
                      <span className="text-muted-foreground">Customer: <strong>{job.customer?.full_name || "—"}</strong></span>
                      <span className="font-bold text-teal-600 dark:text-teal-400 tabular-nums">{formatCurrency(job.agreed_price || 0)}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </div>
  )
}

// ── Haversine ────────────────────────────────────────────────────────

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// ── Main Dashboard ───────────────────────────────────────────────────

export default function MechanicDashboard() {
  const [user, setUser] = useState<any>(null)
  const [mechanic, setMechanic] = useState<any>(null)
  const [jobs, setJobs] = useState<any[]>([])
  const [activeJob, setActiveJob] = useState<any>(null)
  const [filter, setFilter] = useState<"all" | "nearby" | "high_value">("all")
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("radar")
  const userLocation = { lat: -1.2921, lng: 36.8219 } // ponytail: replace with navigator.geolocation

  useEffect(() => {
    let channelRef: any = null

    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUser(user)

      const [{ data: mechProfile }, { data: jobsData }, { data: activeJobs }] = await Promise.all([
        supabase.from("mechanic_profiles").select("*").eq("id", user.id).single(),
        supabase.from("jobs")
          .select("*, customer:profiles(full_name, rating), vehicle:vehicles(make, model, reg_number)")
          .eq("status", "PENDING")
          .order("created_at", { ascending: false }),
        supabase.from("jobs")
          .select("*, customer:profiles(full_name, rating, phone), vehicle:vehicles(make, model, reg_number)")
          .eq("mechanic_id", user.id)
          .in("status", ["ACCEPTED", "EN_ROUTE", "ARRIVED", "IN_PROGRESS"])
          .order("created_at", { ascending: false })
          .limit(1),
      ])

      if (mechProfile) setMechanic(mechProfile)
      if (jobsData) {
        setJobs(jobsData.map((j: any) => {
          const distance = haversine(userLocation.lat, userLocation.lng, j.location_lat, j.location_lng)
          return { ...j, distance, estimatedPayout: j.price_estimate_max || j.price_estimate_min || 0 }
        }))
      }
      if (activeJobs?.length) setActiveJob(activeJobs[0])

      channelRef = supabase
        .channel("mechanic_updates")
        .on("postgres_changes", { event: "*", schema: "public", table: "jobs", filter: `mechanic_id=eq.${user.id}` }, () => fetchData())
        .subscribe()

      setLoading(false)
    }

    fetchData()
    return () => { if (channelRef) supabase.removeChannel(channelRef) }
  }, [])

  const acceptJob = async (jobId: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const nextStatus = activeJob ? (
      activeJob.status === "ACCEPTED" ? "EN_ROUTE" :
      activeJob.status === "EN_ROUTE" ? "ARRIVED" :
      activeJob.status === "ARRIVED" ? "IN_PROGRESS" :
      activeJob.status === "IN_PROGRESS" ? "COMPLETED" : "ACCEPTED"
    ) : "ACCEPTED"

    const { error } = await supabase.from("jobs").update({
      status: nextStatus, mechanic_id: user.id, accepted_at: new Date().toISOString(),
    }).eq("id", jobId)

    if (!error) window.location.reload()
  }

  const declineJob = () => { /* ponytail: add decline logic */ }

  if (loading) {
    return (
      <div className="p-4 lg:p-6 space-y-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <StatCard key={i} label="" value="" icon={Activity} loading />)}
        </div>
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    )
  }

  const stats = [
    { label: "Active Job", value: activeJob ? "1" : "0", icon: Activity, color: "teal" as const },
    { label: "Today", value: formatCurrency(0), icon: DollarSign, color: "green" as const },
    { label: "This Week", value: formatCurrency(0), icon: Wallet, color: "amber" as const },
    { label: "Rating", value: `${mechanic?.rating_avg || 4.9}★`, icon: Star, color: "purple" as const },
  ]

  const filteredJobs = jobs.filter((j: any) => {
    if (filter === "nearby") return j.distance < 10
    if (filter === "high_value") return j.estimatedPayout > 5000
    return true
  }).sort((a: any, b: any) => a.distance - b.distance)

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {activeJob && (
        <motion.section variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <ActiveMechanicJob job={activeJob} onAction={acceptJob} />
        </motion.section>
      )}

      <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(s => (
          <motion.div key={s.label} variants={itemVariants}><StatCard {...s} /></motion.div>
        ))}
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 bg-gray-100 dark:bg-gray-800/50 p-1 rounded-xl h-10">
          {["radar", "active", "earnings", "history", "profile"].map(tab => (
            <TabsTrigger key={tab} value={tab} className="rounded-lg text-xs capitalize data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-900">
              {tab === "radar" ? "Job Radar" : tab === "active" ? "Active Job" : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="radar">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Job Radar</h2>
                <p className="text-sm text-muted-foreground">Available jobs near you</p>
              </div>
              <div className="flex items-center gap-2.5">
                <Switch checked={mechanic?.is_online || false} />
                <span className="text-xs text-muted-foreground">Online</span>
                <Badge variant="secondary" className="gap-1 text-[10px]">
                  <RefreshCw className="h-2.5 w-2.5 animate-spin" /> Live
                </Badge>
              </div>
            </div>

            <div className="flex gap-1.5">
              {(["all", "nearby", "high_value"] as const).map(f => (
                <Button key={f} variant={filter === f ? "default" : "outline"} size="sm"
                  onClick={() => setFilter(f)}
                  className={cn("rounded-lg text-xs", filter === f && "bg-gradient-to-r from-teal-500 to-emerald-500 text-white")}
                >
                  {f === "high_value" ? "High Value" : f.charAt(0).toUpperCase() + f.slice(1)}
                </Button>
              ))}
            </div>

            {filteredJobs.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                <Radar className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-700 mb-3" />
                <h3 className="font-semibold mb-1">No jobs available</h3>
                <p className="text-sm text-muted-foreground">Jobs appear here when customers request help nearby</p>
              </div>
            ) : (
              <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-2.5">
                {filteredJobs.map((job: any) => (
                  <JobRadarCard key={job.id} job={job} onAccept={acceptJob} onDecline={declineJob} />
                ))}
              </motion.div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="active">
          {activeJob ? (
            <ActiveMechanicJob job={activeJob} onAction={acceptJob} />
          ) : (
            <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
              <Briefcase className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-700 mb-3" />
              <h3 className="font-semibold mb-1">No active job</h3>
              <p className="text-sm text-muted-foreground mb-4">Accept a job from the Radar</p>
              <Button size="sm" onClick={() => setActiveTab("radar")} className="gap-1.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:opacity-90">
                <Radar className="h-3.5 w-3.5" /> Job Radar
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="earnings"><EarningsTab jobs={jobs} /></TabsContent>
        <TabsContent value="history"><JobHistoryTab jobs={jobs} /></TabsContent>
        <TabsContent value="profile"><MechanicProfileTab mechanic={mechanic} /></TabsContent>
      </Tabs>
    </div>
  )
}
