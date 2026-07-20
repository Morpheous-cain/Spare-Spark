"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Save, Bell, Mail, Phone, Shield, Lock, Globe, Palette, Moon, Sun, CreditCard, Truck, MapPin, LogOut, Trash2, AlertTriangle, CheckCircle, XCircle, ChevronRight, Loader2, Save as SaveIcon, Settings, Star, Eye, Key, Download, Plus, Badge } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  containerVariants,
  itemVariants,
  fadeInUp,
  cardEntrance,
} from "@/lib/animations"

const supabase = createClient()

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeSection, setActiveSection] = useState("general")
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system")
  const [notifications, setNotifications] = useState({
    push: true,
    sms: true,
    email: true,
    marketing: false,
    jobUpdates: true,
    paymentReceipts: true,
    weeklyDigest: false,
  })

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single()
      if (profileData) setProfile(profileData)

      // Load theme preference
      const savedTheme = localStorage.getItem("theme") as "light" | "dark" | "system" || "system"
      setTheme(savedTheme)
      applyTheme(savedTheme)

      setLoading(false)
    }
    fetchData()
  }, [])

  const applyTheme = (newTheme: "light" | "dark" | "system") => {
    const root = document.documentElement
    if (newTheme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      root.classList.toggle("dark", prefersDark)
    } else {
      root.classList.toggle("dark", newTheme === "dark")
    }
  }

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    applyTheme(newTheme)
  }

  const sections = [
    { id: "general", label: "General", icon: Settings, desc: "Basic account settings" },
    { id: "notifications", label: "Notifications", icon: Bell, desc: "Manage how we contact you" },
    { id: "appearance", label: "Appearance", icon: Palette, desc: "Customize your experience" },
    { id: "security", label: "Security", icon: Shield, desc: "Password and 2FA settings" },
    { id: "payment", label: "Payment", icon: CreditCard, desc: "Manage payment methods" },
    { id: "delivery", label: "Delivery", icon: Truck, desc: "Default delivery addresses" },
    { id: "danger", label: "Danger Zone", icon: AlertTriangle, desc: "Account deletion" },
  ]

  if (loading) {
    return (
      <div className="p-4 lg:p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your account preferences and settings</p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <motion.aside initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="lg:w-64 flex-shrink-0">
          <Card className="border-0 shadow-sm bg-white dark:bg-gray-900 sticky top-24">
            <CardContent className="p-3">
              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left",
                      activeSection === section.id
                        ? "bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                    )}
                  >
                    <section.icon className="h-5 w-5 shrink-0" />
                    <span>{section.label}</span>
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </motion.aside>

        {/* Content */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="flex-1">
          {/* General Settings */}
          {activeSection === "general" && (
            <Card className="border-0 shadow-sm bg-white dark:bg-gray-900">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">General Settings</CardTitle>
                <CardDescription>Manage your basic account information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={profile?.avatar_url} alt={profile?.full_name || "User"} />
                      <AvatarFallback className="bg-gradient-to-br from-orange-500 to-amber-500 text-white text-2xl font-bold">
                        {(profile?.full_name || "U").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <label className="absolute bottom-0 right-0 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-orange-600 transition-colors">
                      <Camera className="h-4 w-4 text-white" />
                      <input type="file" accept="image/*" className="sr-only" />
                    </label>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Full Name</Label>
                        <Input
                          defaultValue={profile?.full_name || ""}
                          placeholder="John Doe"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone Number</Label>
                        <Input
                          type="tel"
                          defaultValue={profile?.phone || ""}
                          placeholder="+254 7XX XXX XXX"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Email Address</Label>
                      <Input
                        type="email"
                        defaultValue={profile?.email || ""}
                        disabled
                        className="bg-gray-50 dark:bg-gray-800/50"
                      />
                      <p className="text-xs text-gray-500">Email cannot be changed from here. Contact support to update.</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">Language & Region</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Language</Label>
                      <select className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100">
                        <option>English</option>
                        <option>Kiswahili</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Currency</Label>
                      <select className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100">
                        <option>KES - Kenyan Shilling</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <Button className="bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:opacity-90 gap-2" disabled={saving}>
                    <SaveIcon className="h-4 w-4" />
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notifications */}
          {activeSection === "notifications" && (
            <Card className="border-0 shadow-sm bg-white dark:bg-gray-900">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Notification Preferences</CardTitle>
                <CardDescription>Choose how and when you want to be notified</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-orange-500" />
                    Channels
                  </h4>
                  <div className="space-y-3">
                    {[
                      { key: "push", label: "Push Notifications", desc: "Receive real-time alerts on your device" },
                      { key: "sms", label: "SMS", desc: "Get booking confirmations via text message" },
                      { key: "email", label: "Email", desc: "Receive updates and receipts via email" },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-white dark:bg-gray-900 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                            <Bell className="h-4 w-4 text-gray-500" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{item.label}</p>
                            <p className="text-xs text-gray-500">{item.desc}</p>
                          </div>
                        </div>
                        <Switch
                          checked={notifications[item.key as keyof typeof notifications]}
                          onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, [item.key]: checked }))}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Truck className="h-4 w-4 text-orange-500" />
                    Job Updates
                  </h4>
                  <div className="space-y-3">
                    {[
                      { key: "jobUpdates", label: "Job Status Changes", desc: "When a mechanic accepts, arrives, or completes your job" },
                      { key: "paymentReceipts", label: "Payment Receipts", desc: "Digital receipts after each completed service" },
                      { key: "weeklyDigest", label: "Weekly Digest", desc: "Summary of your activity every Monday" },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-white dark:bg-gray-900 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{item.label}</p>
                            <p className="text-xs text-gray-500">{item.desc}</p>
                          </div>
                        </div>
                        <Switch
                          checked={notifications[item.key as keyof typeof notifications]}
                          onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, [item.key]: checked }))}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Star className="h-4 w-4 text-amber-500" />
                    Marketing
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-white dark:bg-gray-900 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                          <Star className="h-4 w-4 text-amber-500" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Promotional Offers</p>
                          <p className="text-xs text-gray-500">Special deals, discounts, and new service announcements</p>
                        </div>
                      </div>
                      <Switch
                        checked={notifications.marketing}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, marketing: checked }))}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Appearance */}
          {activeSection === "appearance" && (
            <Card className="border-0 shadow-sm bg-white dark:bg-gray-900">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Appearance</CardTitle>
                <CardDescription>Customize how Sparespark looks on your device</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Palette className="h-4 w-4 text-orange-500" />
                    Theme
                  </h4>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      { value: "light", label: "Light", icon: Sun, desc: "Always use light mode" },
                      { value: "dark", label: "Dark", icon: Moon, desc: "Always use dark mode" },
                      { value: "system", label: "System", icon: Globe, desc: "Match your device settings" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleThemeChange(option.value as "light" | "dark" | "system")}
                        className={cn(
                          "relative p-4 rounded-xl border-2 transition-all text-left",
                          theme === option.value
                            ? "border-orange-500 bg-orange-50 dark:bg-orange-950/30"
                            : "border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center",
                            theme === option.value
                              ? "bg-orange-500 text-white"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                          )}>
                            <option.icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{option.label}</p>
                            <p className="text-xs text-gray-500">{option.desc}</p>
                          </div>
                        </div>
                        {theme === option.value && (
                          <CheckCircle className="absolute top-2 right-2 h-5 w-5 text-orange-500" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-orange-500" />
                    Compact Mode
                  </h4>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-white dark:bg-gray-900 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                        <CreditCard className="h-4 w-4 text-gray-500" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Compact Interface</p>
                        <p className="text-xs text-gray-500">Reduce spacing for more content on screen</p>
                      </div>
                    </div>
                    <Switch checked={false} />
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Eye className="h-4 w-4 text-orange-500" />
                    Animations
                  </h4>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-white dark:bg-gray-900 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                        <Eye className="h-4 w-4 text-gray-500" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Motion Effects</p>
                        <p className="text-xs text-gray-500">Enable smooth transitions and animations</p>
                      </div>
                    </div>
                    <Switch defaultChecked={true} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Security */}
          {activeSection === "security" && (
            <Card className="border-0 shadow-sm bg-white dark:bg-gray-900">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Security</CardTitle>
                <CardDescription>Protect your account with strong security settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Lock className="h-4 w-4 text-orange-500" />
                    Password
                  </h4>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start gap-3">
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
                    <Button variant="outline" className="w-full justify-start gap-3">
                      <Key className="h-4 w-4" />
                      <span>Passkeys</span>
                      <ChevronRight className="h-4 w-4 ml-auto" />
                    </Button>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-500" />
                    Account Security Status
                  </h4>
                  <div className="space-y-3">
                    {[
                      { label: "Email Verified", status: true, desc: "your@email.com" },
                      { label: "Phone Verified", status: true, desc: "+254 7XX XXX XXX" },
                      { label: "Two-Factor Auth", status: false, desc: "Not enabled" },
                      { label: "Passkeys", status: false, desc: "No passkeys registered" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-9 h-9 rounded-lg flex items-center justify-center",
                            item.status ? "bg-green-100 dark:bg-green-900/30" : "bg-gray-100 dark:bg-gray-800"
                          )}>
                            {item.status ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{item.label}</p>
                            <p className="text-xs text-gray-500">{item.desc}</p>
                          </div>
                        </div>
                        {item.status ? (
                          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">Enabled</Badge>
                        ) : (
                          <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700">Enable</Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment */}
          {activeSection === "payment" && (
            <Card className="border-0 shadow-sm bg-white dark:bg-gray-900">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Payment Methods</CardTitle>
                <CardDescription>Manage your saved payment methods for quick checkout</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <CreditCard className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">M-Pesa</p>
                      <p className="text-sm text-gray-500">Default • Ending in 7XX</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">Default</Badge>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Visa Card</p>
                      <p className="text-sm text-gray-500">•••• •••• •••• 4242</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-700">Remove</Button>
                </div>

                <Button variant="outline" className="w-full gap-2">
                  <Plus className="h-4 w-4" />
                  Add Payment Method
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Delivery */}
          {activeSection === "delivery" && (
            <Card className="border-0 shadow-sm bg-white dark:bg-gray-900">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Delivery Addresses</CardTitle>
                <CardDescription>Manage your saved delivery addresses for parts orders</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Home</p>
                      <p className="text-sm text-gray-500">123 Kenyatta Avenue, Nairobi</p>
                    </div>
                  </div>
                  <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">Default</Badge>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Work</p>
                      <p className="text-sm text-gray-500">456 Moi Avenue, Nairobi</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-700">Set Default</Button>
                </div>

                <Button variant="outline" className="w-full gap-2">
                  <Plus className="h-4 w-4" />
                  Add Address
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Danger Zone */}
          {activeSection === "danger" && (
            <Card className="border-0 shadow-sm bg-white dark:bg-gray-900 border border-red-100 dark:border-red-900/30">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  Danger Zone
                </CardTitle>
                <CardDescription>Irreversible actions - proceed with caution</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl">
                  <h4 className="font-medium text-red-800 dark:text-red-300 mb-2">Delete Account</h4>
                  <p className="text-sm text-red-700 dark:text-red-400 mb-4">
                    Permanently delete your account and all associated data. This action cannot be undone.
                    You will lose access to your booking history, vehicles, and any pending services.
                  </p>
                  <Button variant="destructive" className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    Delete My Account
                  </Button>
                </div>

                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl">
                  <h4 className="font-medium text-amber-800 dark:text-amber-300 mb-2">Sign Out Everywhere</h4>
                  <p className="text-sm text-amber-700 dark:text-amber-400 mb-4">
                    Sign out of all active sessions on all devices. You will need to sign in again.
                  </p>
                  <Button variant="outline" className="gap-2 border-amber-300 text-amber-700 hover:bg-amber-50">
                    <LogOut className="h-4 w-4" />
                    Sign Out Everywhere
                  </Button>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl">
                  <h4 className="font-medium text-gray-800 dark:text-gray-300 mb-2">Export My Data</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Download a copy of all your personal data including bookings, vehicles, and profile information.
                  </p>
                  <Button variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Request Data Export
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  )
}