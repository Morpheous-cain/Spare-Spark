"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, TrendingUp, Wallet, DollarSign, BarChart3, Calendar, Filter, Download, ChevronRight } from "lucide-react"
import { formatCurrency, formatDate, cn } from "@/lib/utils"
import {
  containerVariants,
  itemVariants,
  fadeInUp,
  cardEntrance,
  staggerContainer,
} from "@/lib/animations"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const supabase = createClient()

const statusColors: Record<string, string> = {
  COMPLETED: "bg-emerald-500/15 text-emerald-300",
  IN_PROGRESS: "bg-emerald-500/15 text-emerald-300",
  ACCEPTED: "bg-blue-500/15 text-blue-300",
  EN_ROUTE: "bg-amber-subtle text-amber-primary",
  ARRIVED: "bg-violet-500/15 text-violet-300",
  PENDING: "bg-amber-subtle text-amber-glow",
}

export default function EarningsPage() {
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<"week" | "month" | "year">("week")
  const [filter, setFilter] = useState<"all" | "completed" | "pending">("all")

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: jobsData } = await supabase
        .from("jobs")
        .select("*, customer:profiles(full_name, rating)")
        .eq("mechanic_id", user.id)
        .in("status", ["COMPLETED", "IN_PROGRESS", "ACCEPTED", "EN_ROUTE", "ARRIVED"])
        .order("completed_at", { ascending: false })

      if (jobsData) setJobs(jobsData)
      setLoading(false)
    }
    fetchData()
  }, [])

  const completedJobs = jobs.filter(j => j.status === "COMPLETED")
  const pendingJobs = jobs.filter(j => !["COMPLETED", "CANCELLED"].includes(j.status))

  const now = new Date()
  const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const thisWeek = completedJobs
    .filter(j => new Date(j.completed_at) >= weekStart)
    .reduce((sum, j) => sum + (j.agreed_price || 0), 0)

  const thisMonth = completedJobs
    .filter(j => new Date(j.completed_at) >= monthStart)
    .reduce((sum, j) => sum + (j.agreed_price || 0), 0)

  const totalEarnings = completedJobs.reduce((sum, j) => sum + (j.agreed_price || 0), 0)
  const pendingEarnings = pendingJobs.reduce((sum, j) => sum + (j.agreed_price || j.price_estimate_max || 0), 0)

  // Mock weekly chart data
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  const weeklyData = days.map(day => ({ day, amount: Math.floor(Math.random() * 15000) + 2000 }))

  const filteredJobs = jobs.filter(j => {
    if (filter === "completed") return j.status === "COMPLETED"
    if (filter === "pending") return !["COMPLETED", "CANCELLED"].includes(j.status)
    return true
  })

  if (loading) {
    return (
      <div className="p-4 lg:p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="bg-obsidian-surface border border-slate-border rounded-2xl shadow-card-elev">
                <CardContent className="p-5 animate-pulse">
                  <div className="h-3.5 w-20 bg-slate-700/40 rounded" />
                  <div className="h-7 w-16 bg-slate-700/40 rounded mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="h-64 bg-slate-700/40 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 mb-1">Earnings</h1>
            <p className="text-slate-400">Track your income and payouts</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2 border-slate-border text-slate-300 hover:bg-slate-700/40">
              <Download className="h-4 w-4" /> Export
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid gap-3 sm:grid-cols-3">
        <motion.div variants={itemVariants}>
          <Card className="bg-obsidian-surface border border-slate-border rounded-2xl shadow-card-elev">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-[13px] font-medium text-slate-400 mb-1">This Week</p>
                <p className="text-2xl font-bold tracking-tight tabular-nums text-slate-100">{formatCurrency(thisWeek)}</p>
                <p className="text-xs mt-1.5 flex items-center gap-1 font-medium text-emerald-300">
                  <TrendingUp className="h-3 w-3" /> +12% vs last week
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-300">
                <TrendingUp className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-obsidian-surface border border-slate-border rounded-2xl shadow-card-elev">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-[13px] font-medium text-slate-400 mb-1">This Month</p>
                <p className="text-2xl font-bold tracking-tight tabular-nums text-slate-100">{formatCurrency(thisMonth)}</p>
                <p className="text-xs mt-1.5 flex items-center gap-1 font-medium text-emerald-300">
                  <TrendingUp className="h-3 w-3" /> +8% vs last month
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-300">
                <Calendar className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-obsidian-surface border border-slate-border rounded-2xl shadow-card-elev">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-[13px] font-medium text-slate-400 mb-1">Total Earnings</p>
                <p className="text-2xl font-bold tracking-tight tabular-nums text-slate-100">{formatCurrency(totalEarnings)}</p>
                <p className="text-xs mt-1.5 text-slate-400">{completedJobs.length} completed jobs</p>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-primary/15 text-amber-primary">
                <Wallet className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Pending Earnings */}
      {pendingEarnings > 0 && (
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
          <Card className="bg-amber-subtle/10 border border-amber-primary/20 rounded-2xl shadow-card-elev">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-primary/15 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-amber-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-100">Pending Payout</p>
                    <p className="text-sm text-slate-400">{pendingJobs.length} job{pendingJobs.length > 1 ? "s" : ""} awaiting completion</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-amber-glow tabular-nums">{formatCurrency(pendingEarnings)}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Earnings Chart */}
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
        <Card className="bg-obsidian-surface border border-slate-border rounded-2xl shadow-card-elev">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-100">Weekly Earnings</h3>
                <p className="text-xs text-slate-400">Last 7 days</p>
              </div>
              <div className="flex gap-1.5">
                {(["week", "month", "year"] as const).map(p => (
                  <Button key={p} variant={period === p ? "default" : "outline"} size="sm" onClick={() => setPeriod(p)} className={cn("rounded-lg text-xs capitalize", period === p ? "bg-amber-burst text-white shadow-amber-glow" : "border-slate-border text-slate-300 hover:bg-slate-700/40")}>{p}</Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-40 flex items-end justify-between gap-1.5">
              {weeklyData.map((dayData, i) => (
                <TooltipProvider key={dayData.day}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: `${Math.max((dayData.amount / Math.max(...weeklyData.map(d => d.amount), 1)) * 100, 4)}%`, opacity: 1 }}
                        transition={{ delay: i * 0.08, type: "spring", stiffness: 200, damping: 20 }}
                        className="flex-1 flex flex-col items-center gap-1.5"
                      >
                        <div
                          className={cn(
                            "w-full rounded-t bg-gradient-to-t from-teal-500 to-teal-400 transition-all",
                            i === weeklyData.length - 1 && "ring-2 ring-teal-300 ring-offset-2 ring-offset-obsidian-bg"
                          )}
                          style={{ height: "100%" }}
                        />
                        <span className="text-[10px] text-slate-400 font-medium">{dayData.day}</span>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent side="top">{dayData.day}: {formatCurrency(dayData.amount)}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Payout History */}
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
        <Card className="bg-obsidian-surface border border-slate-border rounded-2xl shadow-card-elev">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                  <BarChart3 className="h-4 w-4 text-teal-500" /> Payout History
                </CardTitle>
              </div>
              <div className="flex gap-1.5">
                {(["all", "completed", "pending"] as const).map(f => (
                  <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)} className={cn("rounded-lg text-xs capitalize", filter === f ? "bg-amber-burst text-white shadow-amber-glow" : "border-slate-border text-slate-300 hover:bg-slate-700/40")}>{f}</Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredJobs.length === 0 ? (
              <p className="text-center py-8 text-sm text-slate-400">No jobs found</p>
            ) : (
              <div className="space-y-2">
                {filteredJobs.slice(0, 10).map((job: any) => (
                  <div key={job.id} className="flex items-center justify-between p-3 bg-slate-700/40 rounded-lg">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-teal-500/15 flex items-center justify-center">
                        <DollarSign className="h-4 w-4 text-teal-300" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-slate-100">{job.service_category?.replace(/_/g, " ")}</p>
                        <p className="text-xs text-slate-400">{job.completed_at ? formatDate(job.completed_at) : "Pending"}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-teal-300 tabular-nums">{formatCurrency(job.agreed_price || 0)}</p>
                      <Badge variant="secondary" className={cn(
                        job.status === "COMPLETED" && "bg-emerald-500/15 text-emerald-300",
                        job.status !== "COMPLETED" && "bg-amber-subtle text-amber-glow"
                      )}>
                        {job.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                {filteredJobs.length > 10 && (
                  <Button variant="ghost" className="w-full mt-2 text-sm border-slate-border text-slate-300 hover:bg-slate-700/40">
                    View all {filteredJobs.length} transactions <ChevronRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Payout Schedule */}
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
        <Card className="bg-obsidian-surface border border-slate-border rounded-2xl shadow-card-elev">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-teal-500" /> Payout Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-4 bg-teal-500/10 border border-teal-500/20 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-100">Next Payout</p>
                    <p className="text-sm text-slate-400">Automatic M-Pesa transfer</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-teal-300">{formatCurrency(thisWeek + thisMonth)}</p>
                  <p className="text-xs text-slate-400">Estimated</p>
                </div>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 text-sm">
              <div className="p-3 bg-slate-700/40 rounded-lg">
                <p className="text-slate-400">Payout Method</p>
                <p className="font-medium text-slate-100">M-Pesa</p>
              </div>
              <div className="p-3 bg-slate-700/40 rounded-lg">
                <p className="text-slate-400">Frequency</p>
                <p className="font-medium text-slate-100">Weekly (Mondays)</p>
              </div>
              <div className="p-3 bg-slate-700/40 rounded-lg">
                <p className="text-slate-400">Min. Threshold</p>
                <p className="font-medium text-slate-100">KES 100</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}