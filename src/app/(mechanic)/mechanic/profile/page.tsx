"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Loader2, Camera, Save, User, Shield, Star, Mail, Phone, MapPin, Bell, Lock, Eye, EyeOff, Calendar, Wrench, Car, History, DollarSign, Settings, LogOut, ChevronRight, Edit2, AlertTriangle, Trash2, Key, Download, CheckCircle, XCircle } from "lucide-react"
import { formatDate, cn } from "@/lib/utils"
import {
  containerVariants,
  itemVariants,
  fadeInUp,
  cardEntrance,
  staggerContainer,
} from "@/lib/animations"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

const supabase = createClient()

const specs = [
  "tyre_change", "jump_start", "tow", "engine_repair",
  "brake_repair", "electrical", "ac_repair", "body_repair",
  "diagnosis", "general"
]

export default function MechanicProfilePage() {
  const [mechanic, setMechanic] = useState<any>(null)
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    email: "",
    avatar_url: "",
    specialisations: [] as string[],
    service_radius_km: 15,
    bio: "",
    mpesa_number: "",
    years_experience: 0,
  })
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  })

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [{ data: mechProfile }, { data: userJobs }] = await Promise.all([
        supabase.from("mechanic_profiles").select("*").eq("id", user.id).single(),
        supabase.from("jobs")
          .select("*, customer:profiles(full_name, rating), vehicle:vehicles(make, model, reg_number)")
          .eq("mechanic_id", user.id)
          .order("created_at", { ascending: false })
          .limit(10),
      ])

      if (mechProfile) {
        setMechanic(mechProfile)
        setFormData({
          full_name: mechProfile.full_name || "",
          phone: mechProfile.phone || "",
          email: user.email || "",
          avatar_url: mechProfile.avatar_url || "",
          specialisations: mechProfile.specialisations || [],
          service_radius_km: mechProfile.service_radius_km || 15,
          bio: mechProfile.bio || "",
          mpesa_number: mechProfile.mpesa_number || "",
          years_experience: mechProfile.years_experience || 0,
        })
      }
      if (userJobs) setJobs(userJobs)
      setLoading(false)
    }
    fetchData()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => window.location.reload())
    return () => subscription.unsubscribe()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from("mechanic_profiles").update({
      full_name: formData.full_name,
      phone: formData.phone,
      specialisations: formData.specialisations,
      service_radius_km: formData.service_radius_km,
      bio: formData.bio,
      mpesa_number: formData.mpesa_number,
      years_experience: formData.years_experience,
    }).eq("id", user.id)

    if (!error) {
      setMechanic((prev: any) => prev ? { ...prev, ...formData } : null)
      setEditMode(false)
    }
    setSaving(false)
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      setFormData(prev => ({ ...prev, avatar_url: reader.result as string }))
    }
    reader.readAsDataURL(file)
  }

  const stats = [
    { label: "Total Jobs", value: jobs.length, icon: History, color: "bg-gradient-to-br from-teal-500/10 to-emerald-500/10 text-teal-600 dark:text-teal-400" },
    { label: "Completed", value: jobs.filter(j => j.status === "COMPLETED").length, icon: CheckCircle, color: "bg-gradient-to-br from-emerald-500/10 to-green-500/10 text-emerald-600 dark:text-emerald-400" },
    { label: "Rating", value: `${mechanic?.rating_avg || 4.9}★`, icon: Star, color: "bg-gradient-to-br from-purple-500/10 to-violet-500/10 text-purple-600 dark:text-purple-400" },
    { label: "Experience", value: `${formData.years_experience} yrs`, icon: Wrench, color: "bg-gradient-to-br from-orange-500/10 to-amber-500/10 text-orange-600 dark:text-orange-400" },
  ]

  if (loading) {
    return (
      <div className="p-4 lg:p-6 space-y-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border-0 shadow-sm bg-white dark:bg-gray-900">
              <CardContent className="flex items-center justify-between p-5">
                <div className="space-y-2 animate-pulse">
                  <div className="h-3.5 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-7 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
                <div className="h-11 w-11 rounded-xl bg-gray-200 dark:bg-gray-700" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Profile Header */}
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="space-y-6">
        <Card className="border-0 shadow-sm bg-white dark:bg-gray-900 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-emerald-500" />
          <CardContent className="p-6 pt-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-4 border-white dark:border-gray-900 shadow-lg">
                    <AvatarImage src={formData.avatar_url || mechanic?.avatar_url} alt={formData.full_name || mechanic?.full_name || "Mechanic"} />
                    <AvatarFallback className="bg-gradient-to-br from-teal-500 to-emerald-500 text-white text-2xl font-bold">
                      {(formData.full_name || mechanic?.full_name || "M").charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {editMode && (
                    <label className="absolute bottom-0 right-0 w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-teal-600 transition-colors">
                      <Camera className="h-4 w-4 text-white" />
                      <input type="file" accept="image/*" onChange={handleAvatarChange} className="sr-only" />
                    </label>
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {editMode ? (
                      <Input
                        value={formData.full_name}
                        onChange={e => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                        className="bg-transparent border-none text-2xl font-bold w-auto focus:ring-0 focus:border-0"
                      />
                    ) : (
                      formData.full_name || mechanic?.full_name || "Mechanic"
                    )}
                  </h1>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <Mail className="h-4 w-4" />
                      {formData.email}
                    </span>
                    {formData.phone && (
                      <span className="flex items-center gap-1.5">
                        <Phone className="h-4 w-4" />
                        {formData.phone}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      Verified Mechanic
                    </Badge>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      {mechanic?.rating_avg || 4.9}★
                    </Badge>
                    <span className="text-xs text-gray-400">{mechanic?.total_jobs || 0} jobs completed</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  variant={editMode ? "default" : "outline"}
                  onClick={() => setEditMode(!editMode)}
                  disabled={saving}
                  className="gap-2"
                >
                  {editMode ? (
                    <>
                      <Save className="h-4 w-4" />
                      {saving ? "Saving..." : "Save"}
                    </>
                  ) : (
                    <>
                      <Edit2 className="h-4 w-4" />
                      Edit Profile
                    </>
                  )}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setShowPasswordModal(true)}>
                  <Lock className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {editMode && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input
                      value={formData.full_name}
                      onChange={e => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+254 7XX XXX XXX"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      disabled
                      className="bg-gray-50 dark:bg-gray-800/50"
                    />
                    <p className="text-xs text-gray-500">Email cannot be changed here</p>
                  </div>
                  <div className="space-y-2">
                    <Label>M-Pesa Number</Label>
                    <Input
                      type="tel"
                      value={formData.mpesa_number}
                      onChange={e => setFormData(prev => ({ ...prev, mpesa_number: e.target.value }))}
                      placeholder="+254 7XX XXX XXX"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Years of Experience</Label>
                    <Input
                      type="number"
                      value={formData.years_experience}
                      onChange={e => setFormData(prev => ({ ...prev, years_experience: parseInt(e.target.value) || 0 }))}
                      min="0"
                      max="50"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Service Radius (km)</Label>
                    <Input
                      type="number"
                      value={formData.service_radius_km}
                      onChange={e => setFormData(prev => ({ ...prev, service_radius_km: parseInt(e.target.value) || 15 }))}
                      min="5"
                      max="50"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Bio</Label>
                    <Input
                      value={formData.bio}
                      onChange={e => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Tell customers about your expertise..."
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div key={stat.label} variants={itemVariants}>
              <Card className="border-0 shadow-sm bg-white dark:bg-gray-900">
                <CardContent className="flex items-center justify-between p-5">
                  <div>
                    <p className="text-[13px] font-medium text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold tracking-tight tabular-nums">{stat.value}</p>
                  </div>
                  <div className={cn("p-2.5 rounded-xl", stat.color)}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-gray-100 dark:bg-gray-800/50 p-1 rounded-xl h-10">
          <TabsTrigger value="profile" className="rounded-lg text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-900">
            Profile
          </TabsTrigger>
          <TabsTrigger value="specialisations" className="rounded-lg text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-900">
            Specialisations
          </TabsTrigger>
          <TabsTrigger value="availability" className="rounded-lg text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-900">
            Availability
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-lg text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-900">
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          {/* Notifications */}
          <Card className="border-0 shadow-sm bg-white dark:bg-gray-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Bell className="h-4 w-4 text-teal-500" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { title: "Push Notifications", desc: "Receive alerts for new job requests", enabled: true },
                { title: "SMS Updates", desc: "Get booking confirmations via SMS", enabled: true },
                { title: "Email Receipts", desc: "Receive digital receipts after service", enabled: true },
                { title: "Weekly Digest", desc: "Summary of your activity every Monday", enabled: false },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <Bell className="h-4 w-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{item.title}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                  <Switch checked={item.enabled} disabled={!editMode} />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Security */}
          <Card className="border-0 shadow-sm bg-white dark:bg-gray-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Lock className="h-4 w-4 text-teal-500" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" onClick={() => setShowPasswordModal(true)} className="w-full justify-start gap-3">
                <Lock className="h-4 w-4" />
                <span>Change Password</span>
                <ChevronRight className="h-4 w-4 ml-auto" />
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3">
                <Shield className="h-4 w-4" />
                <span>Two-Factor Authentication</span>
                <ChevronRight className="h-4 w-4 ml-auto" />
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3">
                <Key className="h-4 w-4" />
                <span>Passkeys</span>
                <ChevronRight className="h-4 w-4 ml-auto" />
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3">
                <Eye className="h-4 w-4" />
                <span>Active Sessions</span>
                <ChevronRight className="h-4 w-4 ml-auto" />
              </Button>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-0 shadow-sm bg-white dark:bg-gray-900 border border-red-100 dark:border-red-900/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-4 w-4" />
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="ghost" className="w-full justify-start gap-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20">
                <LogOut className="h-4 w-4" />
                <span>Sign Out Everywhere</span>
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20">
                <Trash2 className="h-4 w-4" />
                <span>Delete Account</span>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="specialisations">
          <Card className="border-0 shadow-sm bg-white dark:bg-gray-900">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Your Specialisations</CardTitle>
              <p className="text-sm text-gray-500 mt-1">Select the services you're qualified to perform. This helps match you with relevant jobs.</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {specs.map(s => (
                  <label key={s} className={cn(
                    "inline-flex items-center px-3 py-1.5 rounded-full text-sm cursor-pointer transition-all border",
                    formData.specialisations.includes(s)
                      ? "bg-teal-500 text-white border-teal-500"
                      : "bg-gray-100 dark:bg-gray-800 text-muted-foreground border-gray-200 dark:border-gray-700 hover:border-teal-300"
                  )}>
                    <input
                      type="checkbox"
                      checked={formData.specialisations.includes(s)}
                      className="sr-only"
                      disabled={!editMode}
                      onChange={e => setFormData(prev => ({
                        ...prev,
                        specialisations: e.target.checked ? [...prev.specialisations, s] : prev.specialisations.filter((x: string) => x !== s),
                      }))}
                    />
                    {s.replace(/_/g, " ")}
                  </label>
                ))}
              </div>
              {editMode && (
                <div className="flex justify-end pt-4 border-t">
                  <Button onClick={handleSave} disabled={saving} className="gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:opacity-90">
                    <Save className="h-4 w-4" />
                    {saving ? "Saving..." : "Save Specialisations"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="availability">
          <Card className="border-0 shadow-sm bg-white dark:bg-gray-900">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Availability Settings</CardTitle>
              <p className="text-sm text-gray-500 mt-1">Manage when you're available to receive job requests</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-teal-500" />
                  Online Status
                </h4>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Receive Job Requests</p>
                      <p className="text-sm text-gray-500">Toggle to go online/offline</p>
                    </div>
                  </div>
                  <Switch
                    checked={mechanic?.is_online || false}
                    onCheckedChange={async (checked) => {
                      const { data: { user } } = await supabase.auth.getUser()
                      if (user) {
                        await supabase.from("mechanic_profiles").update({ is_online: checked }).eq("id", user.id)
                        setMechanic((prev: any) => prev ? { ...prev, is_online: checked } : null)
                      }
                    }}
                  />
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-teal-500" />
                  Service Radius
                </h4>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{formData.service_radius_km} km radius</p>
                    <input
                      type="range"
                      value={formData.service_radius_km}
                      onChange={(e) => setFormData((prev: any) => ({ ...prev, service_radius_km: parseInt(e.target.value) }))}
                      min={5}
                      max={50}
                      step={5}
                      className="w-full mt-2"
                      disabled={!editMode}
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>5 km</span>
                      <span>50 km</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-teal-500" />
                  Auto-Accept Jobs
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-white dark:bg-gray-900 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Auto-Accept Nearby Jobs</p>
                        <p className="text-xs text-gray-500">Automatically accept jobs within 5km radius</p>
                      </div>
                    </div>
                    <Switch checked={false} disabled={!editMode} />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-white dark:bg-gray-900 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                        <Bell className="h-4 w-4 text-orange-500" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Instant Notifications</p>
                        <p className="text-xs text-gray-500">Get notified immediately when a job is posted nearby</p>
                      </div>
                    </div>
                    <Switch defaultChecked={true} disabled={!editMode} />
                  </div>
                </div>
              </div>

              {editMode && (
                <div className="flex justify-end pt-4 border-t">
                  <Button onClick={handleSave} disabled={saving} className="gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:opacity-90">
                    <Save className="h-4 w-4" />
                    {saving ? "Saving..." : "Save Availability"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          {jobs.length === 0 ? (
            <Card className="border-0 shadow-sm bg-white dark:bg-gray-900 border border-dashed border-gray-200 dark:border-gray-800">
              <CardContent className="text-center py-12">
                <History className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-700 mb-3" />
                <h4 className="font-semibold mb-1">No job history</h4>
                <p className="text-gray-500 mb-4">Your completed jobs will appear here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => (
                <Card key={job.id} className="border-0 shadow-sm hover:shadow-md bg-white dark:bg-gray-900 transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-gray-900">{job.service_category?.replace(/_/g, " ")}</h4>
                        <p className="text-sm text-gray-500">{formatDate(job.created_at)}</p>
                      </div>
                      <Badge variant="outline" className={cn(
                        job.status === "COMPLETED" && "border-emerald-300 text-emerald-700",
                        job.status === "CANCELLED" && "border-red-300 text-red-700",
                        !["COMPLETED", "CANCELLED"].includes(job.status) && "border-teal-300 text-teal-700"
                      )}>
                        {job.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        {job.vehicle && (
                          <span className="flex items-center gap-1 text-gray-500">
                            <Car className="h-3.5 w-3.5" />
                            {job.vehicle.make} {job.vehicle.model}
                          </span>
                        )}
                        {job.customer && (
                          <span className="flex items-center gap-1 text-gray-500">
                            <User className="h-3.5 w-3.5" />
                            {job.customer.full_name}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-teal-600 dark:text-teal-400">
                          {job.agreed_price ? `KES ${job.agreed_price.toLocaleString()}` : "Pending"}
                        </span>
                        <Button variant="ghost" size="sm" className="text-teal-600 hover:text-teal-700">
                          View <ChevronRight className="h-3.5 w-3.5 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}