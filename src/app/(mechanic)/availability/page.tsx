"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Loader2, Clock, MapPin, Calendar, Sun, Moon, Save, Bell, CheckCircle, XCircle, ChevronRight, Plus, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  containerVariants,
  itemVariants,
  fadeInUp,
  cardEntrance,
} from "@/lib/animations"

const supabase = createClient()

const daysOfWeek = [
  { key: "monday", label: "Monday", short: "Mon" },
  { key: "tuesday", label: "Tuesday", short: "Tue" },
  { key: "wednesday", label: "Wednesday", short: "Wed" },
  { key: "thursday", label: "Thursday", short: "Thu" },
  { key: "friday", label: "Friday", short: "Fri" },
  { key: "saturday", label: "Saturday", short: "Sat" },
  { key: "sunday", label: "Sunday", short: "Sun" },
]

const timeSlots = [
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
  "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
  "18:00", "19:00", "20:00", "21:00", "22:00", "23:00",
]

export default function AvailabilityPage() {
  // @ts-ignore
  const _ = AnimatePresence;
  const [mechanic, setMechanic] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isOnline, setIsOnline] = useState(false)
  const [serviceRadius, setServiceRadius] = useState(15)
  const [schedule, setSchedule] = useState<Record<string, { start: string; end: string; enabled: boolean }>>({})
  const [timeOff, setTimeOff] = useState<any[]>([])
  const [showTimeOffModal, setShowTimeOffModal] = useState(false)
  const [timeOffForm, setTimeOffForm] = useState({ startDate: "", endDate: "", reason: "" })

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: mechProfile } = await supabase.from("mechanic_profiles").select("*").eq("id", user.id).single()
      if (mechProfile) {
        setMechanic(mechProfile)
        setIsOnline(mechProfile.is_online || false)
        setServiceRadius(mechProfile.service_radius_km || 15)
      }

      const { data: scheduleData } = await supabase
        .from("mechanic_schedules")
        .select("*")
        .eq("mechanic_id", user.id)

      if (scheduleData) {
        const scheduleMap: Record<string, { start: string; end: string; enabled: boolean }> = {}
        scheduleData.forEach((s: any) => {
          scheduleMap[s.day_of_week] = { start: s.start_time, end: s.end_time, enabled: s.is_enabled }
        })
        setSchedule(scheduleMap)
      }

      const { data: timeOffData } = await supabase
        .from("mechanic_time_off")
        .select("*")
        .eq("mechanic_id", user.id)
        .gte("end_date", new Date().toISOString().split("T")[0])
        .order("start_date", { ascending: true })

      if (timeOffData) setTimeOff(timeOffData)

      setLoading(false)
    }
    fetchData()
  }, [])

  const handleSaveAvailability = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const scheduleArray = Object.entries(schedule).map(([day, times]) => ({
      mechanic_id: user.id,
      day_of_week: day,
      start_time: times.start,
      end_time: times.end,
      is_enabled: times.enabled,
    }))

    const { error } = await supabase.from("mechanic_schedules").upsert(scheduleArray, { onConflict: "mechanic_id,day_of_week" })
    if (!error) {
      await supabase.from("mechanic_profiles").update({ service_radius_km: serviceRadius }).eq("id", user.id)
    }
    setSaving(false)
  }

  const toggleDay = (day: string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], enabled: !prev[day]?.enabled, start: prev[day]?.start || "08:00", end: prev[day]?.end || "17:00" }
    }))
  }

  const updateTime = (day: string, field: "start" | "end", value: string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }))
  }

  const addTimeOff = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from("mechanic_time_off").insert({
      mechanic_id: user.id,
      start_date: timeOffForm.startDate,
      end_date: timeOffForm.endDate,
      reason: timeOffForm.reason,
    })

    if (!error) {
      setTimeOff(prev => [...prev, { start_date: timeOffForm.startDate, end_date: timeOffForm.endDate, reason: timeOffForm.reason }])
      setShowTimeOffModal(false)
      setTimeOffForm({ startDate: "", endDate: "", reason: "" })
    }
  }

  if (loading) {
    return (
      <div className="p-4 lg:p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-700/40 rounded w-1/3" />
          <div className="h-64 bg-slate-700/40 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mb-4">
        <h1 className="text-2xl font-bold text-slate-100 mb-2">Availability & Schedule</h1>
        <p className="text-slate-400">Manage when you're available for jobs and your service area</p>
      </motion.div>

      {/* Online Status & Radius */}
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-obsidian-surface border border-slate-border rounded-2xl shadow-card-elev">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Online Status</p>
                  <p className="font-semibold text-slate-100">{isOnline ? "Online" : "Offline"}</p>
                </div>
              </div>
              <Switch
                checked={isOnline}
                onCheckedChange={async (checked) => {
                  setIsOnline(checked)
                  const { data: { user } } = await supabase.auth.getUser()
                  if (user) {
                    await supabase.from("mechanic_profiles").update({ is_online: checked }).eq("id", user.id)
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-obsidian-surface border border-slate-border rounded-2xl shadow-card-elev">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-primary to-amber-glow flex items-center justify-center">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Service Radius</p>
                <p className="font-semibold text-slate-100">{serviceRadius} km</p>
              </div>
            </div>
            <div className="mt-4">
              <Slider
                value={[serviceRadius]}
                onValueChange={([v]) => setServiceRadius(v)}
                min={5}
                max={50}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>5 km</span>
                <span>50 km</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-obsidian-surface border border-slate-border rounded-2xl shadow-card-elev">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Active Days</p>
                <p className="font-semibold text-slate-100">
                  {Object.values(schedule).filter(s => s.enabled).length} / 7 days
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Weekly Schedule */}
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
        <Card className="bg-obsidian-surface border border-slate-border rounded-2xl shadow-card-elev">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Weekly Schedule</CardTitle>
            <CardDescription>Set your working hours for each day. Toggle days on/off and adjust times.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {daysOfWeek.map((day, index) => {
              const daySchedule = schedule[day.key] || { start: "08:00", end: "17:00", enabled: false }
              return (
                <motion.div key={day.key} variants={itemVariants} style={{ transitionDelay: `${index * 0.05}s` }}
                  className={cn("flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl border transition-colors", daySchedule.enabled ? "bg-teal-500/10 border-teal-500/20" : "bg-slate-700/40 border-slate-border")}>
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <Button
                      variant={daySchedule.enabled ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleDay(day.key)}
                      className={cn("w-full sm:w-auto min-w-[80px]", daySchedule.enabled && "bg-teal-500 border-teal-500 text-white")}
                    >
                      <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                      {day.label}
                    </Button>
                    {daySchedule.enabled && (
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="space-y-1">
                          <Label className="text-xs text-slate-400">Start</Label>
                          <Select value={daySchedule.start} onValueChange={(v) => updateTime(day.key, "start", v)}>
                            <SelectTrigger className="w-[110px] h-8 text-sm">
                              <SelectValue placeholder="Start" />
                            </SelectTrigger>
                            <SelectContent>
                              {timeSlots.map(slot => <SelectItem key={slot} value={slot}>{slot}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <span className="text-slate-500 self-center">to</span>
                        <div className="space-y-1">
                          <Label className="text-xs text-slate-400">End</Label>
                          <Select value={daySchedule.end} onValueChange={(v) => updateTime(day.key, "end", v)}>
                            <SelectTrigger className="w-[110px] h-8 text-sm">
                              <SelectValue placeholder="End" />
                            </SelectTrigger>
                            <SelectContent>
                              {timeSlots.map(slot => <SelectItem key={slot} value={slot}>{slot}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </CardContent>
        </Card>
      </motion.div>

      {/* Time Off */}
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
        <Card className="bg-obsidian-surface border border-slate-border rounded-2xl shadow-card-elev">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Time Off</CardTitle>
              <CardDescription>Schedule days when you won't be available for jobs</CardDescription>
            </div>
            <Button size="sm" className="gap-2" onClick={() => setShowTimeOffModal(true)}>
              <Plus className="h-4 w-4" /> Add Time Off
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {timeOff.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Calendar className="h-12 w-12 mx-auto text-slate-600 mb-3" />
                <p className="font-medium mb-1 text-slate-100">No time off scheduled</p>
                <p className="text-sm">Add vacation or personal days</p>
              </div>
            ) : (
              <div className="space-y-2">
                {timeOff.map((off: any) => (
                  <div key={`${off.start_date}-${off.end_date}`} className="flex items-center justify-between p-3 bg-amber-subtle/10 border border-amber-primary/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-primary/15 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-amber-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-100">{off.reason || "Time Off"}</p>
                        <p className="text-sm text-slate-400">
                          {new Date(off.start_date).toLocaleDateString()} - {new Date(off.end_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300" onClick={() => {}}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Save Button */}
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
        <div className="flex justify-end">
          <Button className="bg-amber-burst text-white shadow-amber-glow hover:opacity-90 gap-2 rounded-xl min-h-[56px]" disabled={saving} onClick={handleSaveAvailability}>
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Schedule"}
          </Button>
        </div>
      </motion.div>

      {/* Time Off Modal */}
      <AnimatePresence>
        {showTimeOffModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setShowTimeOffModal(false) }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-obsidian-surface border border-slate-border rounded-2xl p-6 w-full max-w-md shadow-card-elev"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-100">Add Time Off</h2>
                <button onClick={() => setShowTimeOffModal(false)} className="text-slate-400 hover:text-slate-300">
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); addTimeOff() }} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Start Date</Label>
                  <Input type="date" value={timeOffForm.startDate} onChange={e => setTimeOffForm(prev => ({ ...prev, startDate: e.target.value }))} required min={new Date().toISOString().split("T")[0]} className="bg-obsidian-bg border-slate-border text-slate-100 placeholder-slate-500 focus:border-amber-primary focus:ring-amber-primary/20" />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">End Date</Label>
                  <Input type="date" value={timeOffForm.endDate} onChange={e => setTimeOffForm(prev => ({ ...prev, endDate: e.target.value }))} required min={timeOffForm.startDate || new Date().toISOString().split("T")[0]} className="bg-obsidian-bg border-slate-border text-slate-100 placeholder-slate-500 focus:border-amber-primary focus:ring-amber-primary/20" />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Reason (optional)</Label>
                  <Input value={timeOffForm.reason} onChange={e => setTimeOffForm(prev => ({ ...prev, reason: e.target.value }))} placeholder="Vacation, Personal, Medical, etc." className="bg-obsidian-bg border-slate-border text-slate-100 placeholder-slate-500 focus:border-amber-primary focus:ring-amber-primary/20" />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setShowTimeOffModal(false)} className="flex-1 border-slate-border text-slate-300 hover:bg-slate-700/40">Cancel</Button>
                  <Button type="submit" className="flex-1 bg-amber-burst text-white shadow-amber-glow hover:opacity-90 rounded-xl min-h-[56px]">Add Time Off</Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}