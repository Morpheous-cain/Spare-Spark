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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Loader2, Camera, Save, User, Shield, Star, Mail, Phone, MapPin, Bell, Lock, Eye, EyeOff, Calendar, Wrench, Car, History, DollarSign, Settings, LogOut, ChevronRight, Edit2, Plus, Trash2, Eye as EyeIcon } from "lucide-react"
import { formatDate, cn } from "@/lib/utils"
import {
  containerVariants,
  itemVariants,
  fadeInUp,
  cardEntrance,
  staggerContainer,
} from "@/lib/animations"

const supabase = createClient()

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [vehicles, setVehicles] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    email: "",
    avatar_url: "",
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

      const [{ data: profileData }, { data: userVehicles }, { data: userBookings }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("vehicles").select("*").eq("owner_id", user.id).order("created_at", { ascending: false }),
        supabase.from("jobs")
          .select("*, vehicle:vehicles(*), mechanic:mechanic_profiles(full_name, rating_avg, avatar_url)")
          .eq("customer_id", user.id)
          .order("created_at", { ascending: false })
          .limit(10),
      ])

      if (profileData) {
        setProfile(profileData)
        setFormData({
          full_name: profileData.full_name || "",
          phone: profileData.phone || "",
          email: user.email || "",
          avatar_url: profileData.avatar_url || "",
        })
      }
      if (userVehicles) setVehicles(userVehicles)
      if (userBookings) setBookings(userBookings)
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

    const { error } = await supabase.from("profiles").update({
      full_name: formData.full_name,
      phone: formData.phone,
    }).eq("id", user.id)

    if (!error) {
      setProfile((prev: any) => prev ? { ...prev, full_name: formData.full_name, phone: formData.phone } : null)
      setEditMode(false)
    }
    setSaving(false)
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // In a real app, upload to Supabase Storage
    const reader = new FileReader()
    reader.onload = () => {
      setFormData(prev => ({ ...prev, avatar_url: reader.result as string }))
    }
    reader.readAsDataURL(file)
  }

  const stats = [
    { label: "Total Bookings", value: bookings.length, icon: History, color: "bg-gradient-to-br from-orange-500/10 to-amber-500/10 text-orange-600 dark:text-orange-400" },
    { label: "Vehicles", value: vehicles.length, icon: Car, color: "bg-gradient-to-br from-emerald-500/10 to-green-500/10 text-emerald-600 dark:text-emerald-400" },
    { label: "Completed", value: bookings.filter(b => b.status === "COMPLETED").length, icon: Wrench, color: "bg-gradient-to-br from-teal-500/10 to-emerald-500/10 text-teal-600 dark:text-teal-400" },
    { label: "Rating", value: `${profile?.rating || 5.0}★`, icon: Star, color: "bg-gradient-to-br from-purple-500/10 to-violet-500/10 text-purple-600 dark:text-purple-400" },
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
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-amber-500" />
          <CardContent className="p-6 pt-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-4 border-white dark:border-gray-900 shadow-lg">
                    <AvatarImage src={formData.avatar_url || profile?.avatar_url} alt={formData.full_name || profile?.full_name || "User"} />
                    <AvatarFallback className="bg-gradient-to-br from-orange-500 to-amber-500 text-white text-2xl font-bold">
                      {(formData.full_name || profile?.full_name || "U").charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {editMode && (
                    <label className="absolute bottom-0 right-0 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-orange-600 transition-colors">
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
                      formData.full_name || profile?.full_name || "User"
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
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      Verified Customer
                    </Badge>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      {profile?.rating || 5.0}★
                    </Badge>
                    <span className="text-xs text-gray-400">Member since {profile?.created_at ? formatDate(profile.created_at) : "2024"}</span>
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
        <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-800/50 p-1 rounded-xl h-10">
          <TabsTrigger value="profile" className="rounded-lg text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-900">
            Profile
          </TabsTrigger>
          <TabsTrigger value="vehicles" className="rounded-lg text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-900">
            Vehicles
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
                <Bell className="h-4 w-4 text-orange-500" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { title: "Push Notifications", desc: "Receive alerts for job updates", enabled: true },
                { title: "SMS Updates", desc: "Get booking confirmations via SMS", enabled: true },
                { title: "Email Receipts", desc: "Receive digital receipts after service", enabled: true },
                { title: "Marketing Emails", desc: "Offers and promotions from Sparespark", enabled: false },
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
                <Lock className="h-4 w-4 text-orange-500" />
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
                <Shield className="h-4 w-4" />
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="ghost" className="w-full justify-start gap-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20">
                <LogOut className="h-4 w-4" />
                <span>Sign Out Everywhere</span>
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20">
                <User className="h-4 w-4" />
                <span>Delete Account</span>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vehicles">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">My Vehicles</h3>
              <Button className="bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:opacity-90 gap-2" size="sm">
                <Plus className="h-4 w-4" />
                Add Vehicle
              </Button>
            </div>
            {vehicles.length === 0 ? (
              <Card className="border-0 shadow-sm bg-white dark:bg-gray-900 border border-dashed border-gray-200 dark:border-gray-800">
                <CardContent className="text-center py-12">
                  <Car className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-700 mb-3" />
                  <h4 className="font-semibold mb-1">No vehicles added</h4>
                  <p className="text-gray-500 mb-4">Add a vehicle to book services faster</p>
                  <Button className="bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:opacity-90 gap-2">
                    <Plus className="h-4 w-4" />
                    Add Vehicle
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {vehicles.map((vehicle) => (
                  <Card key={vehicle.id} className="border-0 shadow-sm hover:shadow-md bg-white dark:bg-gray-900 transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-bold text-gray-900">{vehicle.make} {vehicle.model}</h4>
                          <p className="text-sm text-gray-500">{vehicle.year} • {vehicle.color}</p>
                        </div>
                        {vehicle.is_default && <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-[10px]">Default</Badge>}
                      </div>
                      <p className="text-sm text-gray-500 font-mono mb-3">{vehicle.reg_number}</p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">Edit</Button>
                        {!vehicle.is_default && (
                          <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/20">Set Default</Button>
                        )}
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history">
          {bookings.length === 0 ? (
            <Card className="border-0 shadow-sm bg-white dark:bg-gray-900 border border-dashed border-gray-200 dark:border-gray-800">
              <CardContent className="text-center py-12">
                <History className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-700 mb-3" />
                <h4 className="font-semibold mb-1">No booking history</h4>
                <p className="text-gray-500 mb-4">Your completed bookings will appear here</p>
                <Button className="bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:opacity-90 gap-2">
                  <Plus className="h-4 w-4" />
                  Book Your First Service
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {bookings.map((booking) => (
                <Card key={booking.id} className="border-0 shadow-sm hover:shadow-md bg-white dark:bg-gray-900 transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-gray-900">{booking.service_category?.replace(/_/g, " ")}</h4>
                        <p className="text-sm text-gray-500">{formatDate(booking.created_at)}</p>
                      </div>
                      <Badge variant="outline" className={cn(
                        booking.status === "COMPLETED" && "border-green-300 text-green-700",
                        booking.status === "CANCELLED" && "border-red-300 text-red-700",
                        !["COMPLETED", "CANCELLED"].includes(booking.status) && "border-orange-300 text-orange-700"
                      )}>
                        {booking.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        {booking.vehicle && (
                          <span className="flex items-center gap-1 text-gray-500">
                            <Car className="h-3.5 w-3.5" />
                            {booking.vehicle.make} {booking.vehicle.model}
                          </span>
                        )}
                        <span className="font-bold text-orange-600 dark:text-orange-400">
                          {booking.agreed_price ? `KES ${booking.agreed_price.toLocaleString()}` : "Pending"}
                        </span>
                      </div>
                      <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700">
                        View Details <ChevronRight className="h-3.5 w-3.5 ml-1" />
                      </Button>
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