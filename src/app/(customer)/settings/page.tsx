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
          <div className="h-8 bg-slate-700/40 rounded w-1/4" />
          <div className="h-64 bg-slate-700/40 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
        <h1 className="text-2xl font-bold text-slate-100 mb-2">Settings</h1>
        <p className="text-slate-400">Manage your account preferences and settings</p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <motion.aside initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="lg:w-64 flex-shrink-0">
          <Card className="bg-obsidian-surface border border-slate-border rounded-2xl shadow-card-elev sticky top-24">
            <CardContent className="p-3">
              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left",
                      activeSection === section.id
                        ? "bg-amber-subtle text-amber-glow"
                        : "text-slate-400 hover:bg-slate-700/40 hover:text-slate-100"
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
            <Card className="bg-obsidian-surface border border-slate-border rounded-2xl shadow-card-elev">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">General Settings</CardTitle>
                  <CardDescription>Manage your basic account information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={profile?.avatar_url} alt={profile?.full_name || "User"} />
                        <AvatarFallback className="bg-amber-burst text-white text-2xl font-bold">
                          {(profile?.full_name || "U").charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <label className="absolute bottom-0 right-0 w-8 h-8 bg-amber-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-amber-glow transition-colors">
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
                            className="bg-obsidian-bg border-slate-border text-slate-100 placeholder-slate-500 focus:border-amber-primary focus:ring-amber-primary/20"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Phone Number</Label>
                          <Input
                            type="tel"
                            defaultValue={profile?.phone || ""}
                            placeholder="+254 7XX XXX XXX"
                            className="bg-obsidian-bg border-slate-border text-slate-100 placeholder-slate-500 focus:border-amber-primary focus:ring-amber-primary/20"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Email Address</Label>
                        <Input
                          type="email"
                          defaultValue={profile?.email || ""}
                          disabled
                          className="bg-slate-700/40 border-slate-border text-slate-100 placeholder-slate-500"
                        />
                        <p className="text-xs text-slate-400">Email cannot be changed from here. Contact support to update.</p>
                      </div>
                    </div>
                  </div>

                  <Separator className="border-slate-border" />

                  <div className="space-y-4">
                    <h4 className="font-medium text-slate-100">Language & Region</h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Language</Label>
                        <select className="w-full rounded-lg border border-slate-border bg-obsidian-bg px-4 py-2 text-sm text-slate-100 focus:border-amber-primary focus:outline-none focus:ring-2 focus:ring-amber-primary/20">
                          <option>English</option>
                          <option>Kiswahili</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Currency</Label>
                        <select className="w-full rounded-lg border border-slate-border bg-obsidian-bg px-4 py-2 text-sm text-slate-100 focus:border-amber-primary focus:outline-none focus:ring-2 focus:ring-amber-primary/20">
                          <option>KES - Kenyan Shilling</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-slate-border">
                    <Button className="bg-amber-burst text-white shadow-amber-glow hover:opacity-90 rounded-xl min-h-[56px] gap-2" disabled={saving}>
                      <SaveIcon className="h-4 w-4" />
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
          )}

          {/* Notifications */}
          {activeSection === "notifications" && (
            <Card className="bg-obsidian-surface border border-slate-border rounded-2xl shadow-card-elev">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Notification Preferences</CardTitle>
                <CardDescription>Choose how and when you want to be notified</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium text-slate-100 mb-4 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-amber-primary" />
                    Channels
                  </h4>
                  <div className="space-y-3">
                    {[
                      { key: "push", label: "Push Notifications", desc: "Receive real-time alerts on your device" },
                      { key: "sms", label: "SMS", desc: "Get booking confirmations via text message" },
                      { key: "email", label: "Email", desc: "Receive updates and receipts via email" },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-3 bg-slate-700/40 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-obsidian-bg flex items-center justify-center border border-slate-border">
                            <Bell className="h-4 w-4 text-slate-400" />
                          </div>
                          <div>
                            <p className="font-medium text-sm text-slate-100">{item.label}</p>
                            <p className="text-xs text-slate-400">{item.desc}</p>
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

                <Separator className="border-slate-border" />

                <div>
                  <h4 className="font-medium text-slate-100 mb-4 flex items-center gap-2">
                    <Truck className="h-4 w-4 text-amber-primary" />
                    Job Updates
                  </h4>
                  <div className="space-y-3">
                    {[
                      { key: "jobUpdates", label: "Job Status Changes", desc: "When a mechanic accepts, arrives, or completes your job" },
                      { key: "paymentReceipts", label: "Payment Receipts", desc: "Digital receipts after each completed service" },
                      { key: "weeklyDigest", label: "Weekly Digest", desc: "Summary of your activity every Monday" },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-3 bg-slate-700/40 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-obsidian-bg flex items-center justify-center border border-slate-border">
                            <CheckCircle className="h-4 w-4 text-emerald-500" />
                          </div>
                          <div>
                            <p className="font-medium text-sm text-slate-100">{item.label}</p>
                            <p className="text-xs text-slate-400">{item.desc}</p>
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

                <Separator className="border-slate-border" />

                <div>
                  <h4 className="font-medium text-slate-100 mb-4 flex items-center gap-2">
                    <Star className="h-4 w-4 text-amber-glow" />
                    Marketing
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-slate-700/40 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-obsidian-bg flex items-center justify-center border border-slate-border">
                          <Star className="h-4 w-4 text-amber-glow" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-slate-100">Promotional Offers</p>
                          <p className="text-xs text-slate-400">Special deals, discounts, and new service announcements</p>
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
            <Card className="bg-obsidian-surface border border-slate-border rounded-2xl shadow-card-elev">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Appearance</CardTitle>
                <CardDescription>Customize how Sparespark looks on your device</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium text-slate-100 mb-4 flex items-center gap-2">
                    <Palette className="h-4 w-4 text-amber-primary" />
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
                            ? "border-amber-primary bg-amber-subtle/30"
                            : "border-slate-border hover:border-amber-primary/50"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center",
                            theme === option.value
                              ? "bg-amber-primary text-white"
                              : "bg-slate-700/40 text-slate-400"
                          )}>
                            <option.icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium text-sm text-slate-100">{option.label}</p>
                            <p className="text-xs text-slate-400">{option.desc}</p>
                          </div>
                        </div>
                        {theme === option.value && (
                          <CheckCircle className="absolute top-2 right-2 h-5 w-5 text-amber-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <Separator className="border-slate-border" />

                <div>
                  <h4 className="font-medium text-slate-100 mb-4 flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-amber-primary" />
                    Compact Mode
                  </h4>
                  <div className="flex items-center justify-between p-3 bg-slate-700/40 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-obsidian-bg flex items-center justify-center border border-slate-border">
                        <CreditCard className="h-4 w-4 text-slate-400" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-slate-100">Compact Interface</p>
                        <p className="text-xs text-slate-400">Reduce spacing for more content on screen</p>
                      </div>
                    </div>
                    <Switch checked={false} />
                  </div>
                </div>

                <Separator className="border-slate-border" />

                <div>
                  <h4 className="font-medium text-slate-100 mb-4 flex items-center gap-2">
                    <Eye className="h-4 w-4 text-amber-primary" />
                    Animations
                  </h4>
                  <div className="flex items-center justify-between p-3 bg-slate-700/40 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-obsidian-bg flex items-center justify-center border border-slate-border">
                        <Eye className="h-4 w-4 text-slate-400" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-slate-100">Motion Effects</p>
                        <p className="text-xs text-slate-400">Enable smooth transitions and animations</p>
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
            <Card className="bg-obsidian-surface border border-slate-border rounded-2xl shadow-card-elev">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Security</CardTitle>
                <CardDescription>Protect your account with strong security settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium text-slate-100 mb-4 flex items-center gap-2">
                    <Lock className="h-4 w-4 text-amber-primary" />
                    Password
                  </h4>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start gap-3 border-slate-border text-slate-300 hover:bg-slate-700/40">
                      <Lock className="h-4 w-4" />
                      <span>Change Password</span>
                      <ChevronRight className="h-4 w-4 ml-auto" />
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-3 border-slate-border text-slate-300 hover:bg-slate-700/40">
                      <Shield className="h-4 w-4" />
                      <span>Two-Factor Authentication</span>
                      <ChevronRight className="h-4 w-4 ml-auto" />
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-3 border-slate-border text-slate-300 hover:bg-slate-700/40">
                      <Eye className="h-4 w-4" />
                      <span>Active Sessions</span>
                      <ChevronRight className="h-4 w-4 ml-auto" />
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-3 border-slate-border text-slate-300 hover:bg-slate-700/40">
                      <Key className="h-4 w-4" />
                      <span>Passkeys</span>
                      <ChevronRight className="h-4 w-4 ml-auto" />
                    </Button>
                  </div>
                </div>

                <Separator className="border-slate-border" />

                <div>
                  <h4 className="font-medium text-slate-100 mb-4 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-emerald-500" />
                    Account Security Status
                  </h4>
                  <div className="space-y-3">
                    {[
                      { label: "Email Verified", status: true, desc: "your@email.com" },
                      { label: "Phone Verified", status: true, desc: "+254 7XX XXX XXX" },
                      { label: "Two-Factor Auth", status: false, desc: "Not enabled" },
                      { label: "Passkeys", status: false, desc: "No passkeys registered" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between p-3 bg-slate-700/40 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-9 h-9 rounded-lg flex items-center justify-center",
                            item.status ? "bg-emerald-500/15" : "bg-slate-700/40"
                          )}>
                            {item.status ? (
                              <CheckCircle className="h-5 w-5 text-emerald-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-sm text-slate-100">{item.label}</p>
                            <p className="text-xs text-slate-400">{item.desc}</p>
                          </div>
                        </div>
                        {item.status ? (
                          <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30">Enabled</Badge>
                        ) : (
                          <Button variant="ghost" size="sm" className="text-amber-primary hover:text-amber-glow">Enable</Button>
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
            <Card className="bg-obsidian-surface border border-slate-border rounded-2xl shadow-card-elev">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Payment Methods</CardTitle>
                <CardDescription>Manage your saved payment methods for quick checkout</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-700/40 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                      <CreditCard className="h-6 w-6 text-emerald-300" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-100">M-Pesa</p>
                      <p className="text-sm text-slate-400">Default • Ending in 7XX</p>
                    </div>
                  </div>
                  <Badge className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">Default</Badge>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-700/40 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/15 flex items-center justify-center">
                      <CreditCard className="h-6 w-6 text-blue-300" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-100">Visa Card</p>
                      <p className="text-sm text-slate-400">•••• •••• •••• 4242</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-300">Remove</Button>
                </div>

                <Button variant="outline" className="w-full gap-2 border-slate-border text-slate-300 hover:bg-slate-700/40">
                  <Plus className="h-4 w-4" />
                  Add Payment Method
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Delivery */}
          {activeSection === "delivery" && (
            <Card className="bg-obsidian-surface border border-slate-border rounded-2xl shadow-card-elev">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Delivery Addresses</CardTitle>
                <CardDescription>Manage your saved delivery addresses for parts orders</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-700/40 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-subtle flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-amber-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-100">Home</p>
                      <p className="text-sm text-slate-400">123 Kenyatta Avenue, Nairobi</p>
                    </div>
                  </div>
                  <Badge className="bg-amber-subtle text-amber-glow border border-amber-primary/20">Default</Badge>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-700/40 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/15 flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-blue-300" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-100">Work</p>
                      <p className="text-sm text-slate-400">456 Moi Avenue, Nairobi</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-300">Set Default</Button>
                </div>

                <Button variant="outline" className="w-full gap-2 border-slate-border text-slate-300 hover:bg-slate-700/40">
                  <Plus className="h-4 w-4" />
                  Add Address
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Danger Zone */}
          {activeSection === "danger" && (
            <Card className="bg-obsidian-surface border rounded-2xl shadow-card-elev border-red-500/30">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2 text-red-400">
                  <AlertTriangle className="h-5 w-5" />
                  Danger Zone
                </CardTitle>
                <CardDescription>Irreversible actions - proceed with caution</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <h4 className="font-medium text-red-300 mb-2">Delete Account</h4>
                  <p className="text-sm text-red-400 mb-4">
                    Permanently delete your account and all associated data. This action cannot be undone.
                    You will lose access to your booking history, vehicles, and any pending services.
                  </p>
                  <Button variant="destructive" className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    Delete My Account
                  </Button>
                </div>

                <div className="p-4 bg-amber-subtle/10 border border-amber-primary/20 rounded-xl">
                  <h4 className="font-medium text-amber-glow mb-2">Sign Out Everywhere</h4>
                  <p className="text-sm text-slate-400 mb-4">
                    Sign out of all active sessions on all devices. You will need to sign in again.
                  </p>
                  <Button variant="outline" className="gap-2 border-amber-primary/30 text-amber-glow hover:bg-amber-subtle/20">
                    <LogOut className="h-4 w-4" />
                    Sign Out Everywhere
                  </Button>
                </div>

                <div className="p-4 bg-slate-700/40 border border-slate-border rounded-xl">
                  <h4 className="font-medium text-slate-100 mb-2">Export My Data</h4>
                  <p className="text-sm text-slate-400 mb-4">
                    Download a copy of all your personal data including bookings, vehicles, and profile information.
                  </p>
                  <Button variant="outline" className="gap-2 border-slate-border text-slate-300 hover:bg-slate-700/40">
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