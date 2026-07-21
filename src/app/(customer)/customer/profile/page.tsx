"use client"

import { useEffect, useState, useCallback } from "react"
import { motion } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import {
  containerVariants,
  fadeInUp,
  cardEntrance,
  staggerContainer,
} from "@/lib/animations"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  User,
  Mail,
  Phone,
  CreditCard,
  Bell,
  Lock,
  Camera,
  Save,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  Trash2,
  LogOut,
  Loader2,
  ShieldCheck,
  BellOff
} from "lucide-react"
import { useRouter } from "next/navigation"

interface Profile {
  id: string
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
  notification_email: boolean
  notification_sms: boolean
  notification_push: boolean
  notification_marketing: boolean
}

interface PaymentMethod {
  id: string
  type: "mpesa" | "card"
  last4: string
  brand: string
  is_default: boolean
  expiry_month?: number
  expiry_year?: number
}

interface AuthUser {
  id: string
  email: string
  created_at: string
}

interface FormData {
  full_name: string
  phone: string
}

interface PasswordData {
  current_password: string
  new_password: string
  confirm_password: string
}

interface NotificationPrefs {
  email: boolean
  sms: boolean
  push: boolean
  marketing: boolean
}

const initialFormData: FormData = { full_name: "", phone: "" }
const initialPasswordData: PasswordData = { current_password: "", new_password: "", confirm_password: "" }
const initialNotificationPrefs: NotificationPrefs = { email: true, sms: true, push: true, marketing: false }

const PASSWORD_REQUIREMENTS = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "One number", test: (p: string) => /\d/.test(p) },
  { label: "One special character", test: (p: string) => /[!@#$%^&*]/.test(p) },
]

const MOCK_PAYMENT_METHODS: PaymentMethod[] = [
  { id: "pm_1", type: "mpesa", last4: "7234", brand: "M-Pesa", is_default: true },
  { id: "pm_2", type: "card", last4: "4242", brand: "Visa", is_default: false, expiry_month: 12, expiry_year: 2027 },
]

const SHIMMER_CLASSES = "animate-pulse bg-gradient-to-r from-slate-surface via-slate-border to-slate-surface bg-[length:200%_100%]"

function ShimmerCard({ className = "" }: { className?: string }) {
  return (
    <Card className={cn("bg-obsidian-surface border-slate-border rounded-[20px]", className)}>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className={cn("h-6 w-1/4 rounded", SHIMMER_CLASSES)} />
          <div className={cn("h-4 w-1/2 rounded", SHIMMER_CLASSES)} />
          <div className={cn("h-4 w-3/4 rounded", SHIMMER_CLASSES)} />
          <div className={cn("h-4 w-full rounded", SHIMMER_CLASSES)} />
        </div>
      </CardContent>
    </Card>
  )
}

function ShimmerAvatar() {
  return <div className="relative w-24 h-24 rounded-full bg-slate-surface animate-pulse" />
}

function LoadingSkeleton() {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-6">
        <ShimmerAvatar />
        <div className="flex-1 space-y-3">
          <div className={cn("h-8 w-1/3 rounded", SHIMMER_CLASSES)} />
          <div className={cn("h-4 w-1/4 rounded", SHIMMER_CLASSES)} />
        </div>
      </div>
      <Separator className="border-slate-border" />
      <motion.div variants={staggerContainer} className="space-y-6">
        <ShimmerCard /><ShimmerCard /><ShimmerCard /><ShimmerCard />
      </motion.div>
    </motion.div>
  )
}

function EmptyState({ icon: Icon, title, description, action }: { icon: React.ComponentType<{ className?: string }>, title: string, description: string, action?: React.ReactNode }) {
  return (
    <Card className="bg-obsidian-surface border-slate-border rounded-[20px] p-8 text-center">
      <div className="mx-auto w-16 h-16 rounded-full bg-amber-subtle flex items-center justify-center mb-4"><Icon className="w-8 h-8 text-amber-primary" /></div>
      <h3 className="text-slate-100 text-lg font-semibold mb-2">{title}</h3>
      <p className="text-slate-400 mb-4">{description}</p>
      {action}
    </Card>
  )
}

function PasswordStrengthMeter({ password }: { password: string }) {
  const score = PASSWORD_REQUIREMENTS.filter((r) => r.test(password)).length
  const percentage = (score / PASSWORD_REQUIREMENTS.length) * 100
  const colors = ["bg-status-danger", "bg-status-warning", "bg-status-warning", "bg-status-success", "bg-status-success"]
  const labels = ["Very Weak", "Weak", "Fair", "Strong", "Very Strong"]
  return (
    <div className="space-y-2">
      <div className="h-2 bg-slate-surface rounded-full overflow-hidden">
        <motion.div className={cn("h-full rounded-full transition-all duration-300", colors[score - 1] || "bg-slate-border")} style={{ width: `${percentage}%` }} initial={{ width: 0 }} animate={{ width: `${percentage}%` }} />
      </div>
      <p className="text-xs text-slate-400">Password strength: <span className="text-slate-300">{labels[score - 1] || "Very Weak"}</span></p>
      <div className="space-y-1">
        {PASSWORD_REQUIREMENTS.map((req, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <CheckCircle className={cn("w-3 h-3 flex-shrink-0", req.test(password) ? "text-status-success" : "text-slate-600")} />
            <span className={cn(req.test(password) ? "text-slate-400" : "text-slate-500")}>{req.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function AvatarSection({ avatarUrl, fullName, onUploadClick, isEditing, onSave, onCancel }: { avatarUrl: string | null, fullName: string, onUploadClick: () => void, isEditing: boolean, onSave: () => void, onCancel: () => void }) {
  const initials = fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
  return (
    <motion.div variants={cardEntrance} className="relative flex flex-col items-center text-center">
      <div className="relative mb-4">
        <Avatar className="h-24 w-24 rounded-[20px] bg-slate-surface ring-2 ring-slate-border">
          {avatarUrl ? <AvatarImage src={avatarUrl} alt={fullName} className="rounded-[20px]" /> : <AvatarFallback className="text-2xl font-bold text-amber-primary bg-amber-subtle rounded-[20px]">{initials || "U"}</AvatarFallback>}
        </Avatar>
        <motion.button onClick={onUploadClick} disabled={!isEditing} className={cn("absolute bottom-0 right-0 w-10 h-10 rounded-full bg-amber-primary text-obsidian-bg flex items-center justify-center transition-all hover:scale-110 hover:shadow-amber-glow disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none", isEditing ? "opacity-100" : "opacity-0 pointer-events-none")} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} aria-label="Upload profile photo"><Camera className="w-5 h-5" /></motion.button>
      </div>
      <motion.h2 className="text-2xl font-bold text-slate-100" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>{fullName || "Your Name"}</motion.h2>
      <motion.p className="text-slate-400 mt-1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>Manage your profile settings</motion.p>
      {isEditing && (
        <motion.div className="flex gap-3 mt-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Button variant="outline" onClick={onCancel} className="bg-slate-surface border-slate-border hover:bg-slate-border text-slate-100"><LogOut className="w-4 h-4 mr-2" />Cancel</Button>
          <Button onClick={onSave} className="bg-amber-burst text-slate-100 shadow-amber-glow"><Save className="w-4 h-4 mr-2" />Save Changes</Button>
        </motion.div>
      )}
    </motion.div>
  )
}

function PersonalInfoCard({ formData, setFormData, email, isEditing, setIsEditing, onSave, onCancel, isSaving }: { formData: FormData, setFormData: React.Dispatch<React.SetStateAction<FormData>>, email: string, isEditing: boolean, setIsEditing: React.Dispatch<React.SetStateAction<boolean>>, onSave: () => void, onCancel: () => void, isSaving: boolean }) {
  const [showPhoneHint, setShowPhoneHint] = useState(false)
  return (
    <motion.div variants={cardEntrance}>
      <Card className="bg-obsidian-surface border-slate-border rounded-[20px]">
        <CardHeader className="pb-4"><div className="flex items-center justify-between"><CardTitle className="text-slate-100 flex items-center gap-2"><User className="w-5 h-5 text-amber-primary" />Personal Information</CardTitle>{isEditing ? <Button variant="ghost" size="sm" onClick={onCancel} className="text-slate-400 hover:text-slate-200">Cancel</Button> : <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="text-slate-400 hover:text-slate-200">Edit</Button>}</div></CardHeader>
        <CardContent className="pt-0"><div className="space-y-6"><div className="grid gap-6 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="full_name" className="text-slate-300">Full Name</Label>{isEditing ? <Input id="full_name" value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} className="bg-slate-surface border-slate-border text-slate-100 focus:border-amber-primary focus:ring-amber-primary/20" disabled={!isEditing} /> : <div className="h-10 px-3 bg-slate-surface border border-slate-border rounded-md text-slate-100 flex items-center">{formData.full_name || "Not set"}</div>}</div><div className="space-y-2"><Label htmlFor="email" className="text-slate-300 flex items-center gap-1"><Mail className="w-3 h-3" />Email Address</Label><div className="h-10 px-3 bg-slate-surface/50 border border-slate-border/50 rounded-md flex items-center gap-2"><Mail className="w-4 h-4 text-slate-500" /><span className="text-slate-400">{email}</span><Badge variant="outline" className="ml-auto text-xs text-slate-500 border-slate-border">Verified</Badge></div><p className="text-xs text-slate-500">Email cannot be changed</p></div></div><div className="space-y-2"><Label htmlFor="phone" className="text-slate-300 flex items-center gap-2"><Phone className="w-4 h-4" />Phone Number (M-Pesa)<button type="button" onClick={() => setShowPhoneHint(!showPhoneHint)} className="ml-auto text-xs text-amber-primary hover:text-amber-glow transition-colors">{showPhoneHint ? "Hide" : "Show"} format</button></Label>{isEditing ? (<><Input id="phone" type="tel" placeholder="+254 7XX XXX XXX" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="bg-slate-surface border-slate-border text-slate-100 focus:border-amber-primary focus:ring-amber-primary/20" disabled={!isEditing} inputMode="tel" />{showPhoneHint && <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="text-xs text-slate-500 flex items-center gap-1">Format: +254 7XX XXX XXX (M-Pesa registered number)</motion.p>}</>) : (<div className="h-10 px-3 bg-slate-surface border border-slate-border rounded-md text-slate-100 flex items-center gap-2"><Phone className="w-4 h-4 text-slate-500" />{formData.phone || "Not set"}</div>)}</div>{isEditing && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end pt-4 border-t border-slate-border"><Button onClick={onSave} disabled={isSaving} className="bg-amber-burst text-slate-100 shadow-amber-glow">{isSaving ? <> <Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : <> <Save className="w-4 h-4 mr-2" />Save Changes</>}</Button></motion.div>}</div></CardContent></Card></motion.div>
  )
}

function PasswordChangeCard({ onPasswordChange }: { onPasswordChange: (data: PasswordData) => Promise<void> }) {
  const [passwordData, setPasswordData] = useState<PasswordData>(initialPasswordData)
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false })
  const [isChanging, setIsChanging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const validatePasswords = () => { if (passwordData.new_password !== passwordData.confirm_password) { setError("New passwords do not match"); return false } if (PASSWORD_REQUIREMENTS.some(r => !r.test(passwordData.new_password))) { setError("Password does not meet requirements"); return false } setError(null); return true }
  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); if (!validatePasswords()) return; setIsChanging(true); try { await onPasswordChange(passwordData); setSuccess(true); setPasswordData(initialPasswordData); setTimeout(() => setSuccess(false), 3000) } catch (err) { setError(err instanceof Error ? err.message : "Failed to change password") } finally { setIsChanging(false) } }
  return (
    <motion.div variants={cardEntrance}>
      <Card className="bg-obsidian-surface border-slate-border rounded-[20px]"><CardHeader className="pb-4"><CardTitle className="text-slate-100 flex items-center gap-2"><Lock className="w-5 h-5 text-amber-primary" />Change Password</CardTitle></CardHeader><CardContent className="pt-0"><form onSubmit={handleSubmit} className="space-y-6"><div className="space-y-2"><Label htmlFor="current_password" className="text-slate-300">Current Password</Label><div className="relative"><Input id="current_password" type={showPassword.current ? "text" : "password"} value={passwordData.current_password} onChange={e => setPasswordData({ ...passwordData, current_password: e.target.value })} className="bg-slate-surface border-slate-border text-slate-100 focus:border-amber-primary focus:ring-amber-primary/20 pr-10" disabled={isChanging} autoComplete="current-password" /><button type="button" onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">{showPassword.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button></div></div><div className="space-y-2"><Label htmlFor="new_password" className="text-slate-300">New Password</Label><div className="relative"><Input id="new_password" type={showPassword.new ? "text" : "password"} value={passwordData.new_password} onChange={e => setPasswordData({ ...passwordData, new_password: e.target.value })} className="bg-slate-surface border-slate-border text-slate-100 focus:border-amber-primary focus:ring-amber-primary/20 pr-10" disabled={isChanging} autoComplete="new-password" /><button type="button" onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">{showPassword.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button></div>{passwordData.new_password && <PasswordStrengthMeter password={passwordData.new_password} />}</div><div className="space-y-2"><Label htmlFor="confirm_password" className="text-slate-300">Confirm New Password</Label><div className="relative"><Input id="confirm_password" type={showPassword.confirm ? "text" : "password"} value={passwordData.confirm_password} onChange={e => setPasswordData({ ...passwordData, confirm_password: e.target.value })} className="bg-slate-surface border-slate-border text-slate-100 focus:border-amber-primary focus:ring-amber-primary/20 pr-10" disabled={isChanging} autoComplete="new-password" /><button type="button" onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">{showPassword.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button></div>{passwordData.confirm_password && passwordData.new_password !== passwordData.confirm_password && <p className="text-xs text-status-danger flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Passwords do not match</p>}</div>{error && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-status-danger/10 border border-status-danger/20 rounded-lg text-status-danger text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4 flex-shrink-0" />{error}</motion.div>}{success && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-status-success/10 border border-status-success/20 rounded-lg text-status-success text-sm flex items-center gap-2"><ShieldCheck className="w-4 h-4 flex-shrink-0" />Password updated successfully</motion.div>}<Button type="submit" disabled={isChanging || !passwordData.current_password || !passwordData.new_password} className="bg-amber-burst text-slate-100 shadow-amber-glow w-full">{isChanging ? <> <Loader2 className="w-4 h-4 mr-2 animate-spin" />Updating...</> : <> <Lock className="w-4 h-4 mr-2" />Update Password</>}</Button></form></CardContent></Card></motion.div>
  )
}

function PaymentMethodsCard() {
  return (
    <motion.div variants={cardEntrance}>
      <Card className="bg-obsidian-surface border-slate-border rounded-[20px]"><CardHeader className="pb-4"><CardTitle className="text-slate-100 flex items-center gap-2"><CreditCard className="w-5 h-5 text-amber-primary" />Saved Payment Methods</CardTitle></CardHeader><CardContent className="pt-0"><div className="space-y-4">{MOCK_PAYMENT_METHODS.map(method => (<motion.div key={method.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="flex items-center justify-between p-4 bg-slate-surface/50 border border-slate-border rounded-xl transition-all hover:border-amber-primary/30"><div className="flex items-center gap-4"><div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", method.type === "mpesa" ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-400")}>{method.type === "mpesa" ? (<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" /></svg>) : <CreditCard className="w-6 h-6" />}</div><div><p className="font-medium text-slate-100">{method.brand}</p><p className="text-sm text-slate-400">{method.type === "mpesa" ? `M-Pesa •••• ${method.last4}` : `•••• ${method.last4} • Exp ${method.expiry_month}/${String(method.expiry_year!).slice(2)}`}</p></div></div><div className="flex items-center gap-3">{method.is_default && <Badge variant="secondary" className="bg-amber-subtle text-amber-primary border-amber-primary/20"><CheckCircle className="w-3 h-3 mr-1" />Default</Badge>}<Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-200"><ChevronRight className="w-4 h-4" /></Button></div></motion.div>))}<Button variant="outline" className="w-full border-slate-border text-slate-300 hover:border-amber-primary hover:text-amber-primary"><CreditCard className="w-4 h-4 mr-2" />Add Payment Method</Button></div></CardContent></Card></motion.div>
  )
}

function NotificationPreferencesCard({ preferences, onChange, isSaving }: { preferences: NotificationPrefs, onChange: (prefs: NotificationPrefs) => void, isSaving: boolean }) {
  const notificationOptions = [{ key: "email", label: "Email Notifications", description: "Receive updates via email", icon: Mail }, { key: "sms", label: "SMS Notifications", description: "Receive updates via SMS", icon: Phone }, { key: "push", label: "Push Notifications", description: "Receive push notifications on your device", icon: Bell }, { key: "marketing", label: "Marketing Emails", description: "Receive promotional offers and news", icon: BellOff }] as const
  return (
    <motion.div variants={cardEntrance}><Card className="bg-obsidian-surface border-slate-border rounded-[20px]"><CardHeader className="pb-4"><CardTitle className="text-slate-100 flex items-center gap-2"><Bell className="w-5 h-5 text-amber-primary" />Notification Preferences</CardTitle></CardHeader><CardContent className="pt-0"><div className="space-y-4">{notificationOptions.map(({ key, label, description, icon: Icon }) => (<motion.div key={key} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="flex items-center justify-between p-4 bg-slate-surface/50 border border-slate-border rounded-xl transition-all hover:border-amber-primary/30"><div className="flex items-center gap-4"><div className="w-10 h-10 rounded-lg bg-amber-subtle flex items-center justify-center"><Icon className="w-5 h-5 text-amber-primary" /></div><div><p className="font-medium text-slate-100">{label}</p><p className="text-sm text-slate-400">{description}</p></div></div><Switch checked={preferences[key as keyof NotificationPrefs]} onCheckedChange={checked => onChange({ ...preferences, [key]: checked })} disabled={isSaving} className="data-[state=checked]:bg-amber-primary data-[state=checked]:border-amber-primary" /></motion.div>))}{isSaving && <div className="flex items-center gap-2 text-sm text-amber-primary"><Loader2 className="w-4 h-4 animate-spin" />Saving preferences...</div>}</div></CardContent></Card></motion.div>
  )
}

function DangerZoneCard({ onDeleteAccount }: { onDeleteAccount: () => Promise<void> }) {
  const [showConfirm, setShowConfirm] = useState(false); const [confirmText, setConfirmText] = useState(""); const [isDeleting, setIsDeleting] = useState(false)
  const handleDelete = async () => { if (confirmText !== "DELETE") return; setIsDeleting(true); try { await onDeleteAccount() } catch (err) { console.error(err) } finally { setIsDeleting(false); setShowConfirm(false) } }
  return (
    <motion.div variants={cardEntrance}><Card className="bg-obsidian-surface border-status-danger/20 rounded-[20px]"><CardHeader className="pb-4"><CardTitle className="text-status-danger flex items-center gap-2"><AlertTriangle className="w-5 h-5" />Danger Zone</CardTitle></CardHeader><CardContent className="pt-0"><div className="space-y-6"><div className="p-4 bg-status-danger/5 border border-status-danger/20 rounded-xl"><p className="text-slate-300">Once you delete your account, there is no going back. All your data, order history, saved payment methods, and preferences will be permanently erased.</p></div>{!showConfirm ? <motion.button onClick={() => setShowConfirm(true)} className="w-full py-3 px-4 bg-slate-surface border border-status-danger/30 text-status-danger rounded-xl font-medium transition-all hover:bg-status-danger/10 hover:border-status-danger" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}><Trash2 className="w-5 h-5 inline mr-2" />Delete My Account</motion.button> : <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4"><p className="text-slate-300 text-sm">Type <code className="bg-slate-surface px-1.5 py-0.5 rounded text-amber-primary font-mono">DELETE</code> to confirm</p><Input value={confirmText} onChange={e => setConfirmText(e.target.value.toUpperCase())} placeholder="TYPE DELETE TO CONFIRM" className="bg-slate-surface border-status-danger/30 focus:border-status-danger focus:ring-status-danger/20 text-slate-100 font-mono tracking-wider" /><div className="flex gap-3"><Button variant="outline" onClick={() => { setShowConfirm(false); setConfirmText("") }} className="flex-1 border-slate-border text-slate-300 hover:border-slate-500">Cancel</Button><Button onClick={handleDelete} disabled={isDeleting || confirmText !== "DELETE"} className="flex-1 bg-status-danger text-slate-100 hover:bg-status-danger/90 shadow-[0_4px_20px_rgba(239,68,68,0.35)]">{isDeleting ? <> <Loader2 className="w-4 h-4 mr-2 animate-spin" />Deleting...</> : <> <Trash2 className="w-4 h-4 mr-2" />Delete Permanently</>}</Button></div></motion.div>}</div></CardContent></Card></motion.div>
  )
}

export default function CustomerProfilePage() {
  const router = useRouter(); const supabase = createClient()
  const [user, setUser] = useState<AuthUser | null>(null); const [profile, setProfile] = useState<Profile | null>(null); const [isLoading, setIsLoading] = useState(true); const [isSaving, setIsSaving] = useState(false); const [isSavingPrefs, setIsSavingPrefs] = useState(false); const [formData, setFormData] = useState<FormData>(initialFormData); const [isEditing, setIsEditing] = useState(false); const [notificationPrefs, setNotificationPrefs] = useState<NotificationPrefs>(initialNotificationPrefs); const [error, setError] = useState<string | null>(null)
  const fetchProfile = useCallback(async () => { try { const { data: { user: authUser } } = await supabase.auth.getUser(); if (!authUser) { router.push("/login"); return } setUser({ id: authUser.id, email: authUser.email || "", created_at: authUser.created_at }); const { data: profileData, error: profileError } = await supabase.from("profiles").select("*").eq("id", authUser.id).single(); if (profileError && profileError.code !== "PGRST116") throw profileError; if (profileData) { setProfile(profileData); setFormData({ full_name: profileData.full_name || "", phone: profileData.phone || "" }); setNotificationPrefs({ email: profileData.notification_email ?? true, sms: profileData.notification_sms ?? true, push: profileData.notification_push ?? true, marketing: profileData.notification_marketing ?? false }) } else { setProfile({ id: authUser.id, full_name: "", phone: "", avatar_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), notification_email: true, notification_sms: true, notification_push: true, notification_marketing: false }) } } catch (error) { console.error("Error fetching profile:", error); setError("Failed to load profile") } finally { setIsLoading(false) } }, [supabase, router])
  useEffect(() => { fetchProfile() }, [fetchProfile])
  const handleSaveProfile = async () => { if (!user) return; setIsSaving(true); try { const { error } = await supabase.from("profiles").upsert({ id: user.id, full_name: formData.full_name, phone: formData.phone, updated_at: new Date().toISOString() }); if (error) throw error; setProfile(prev => prev ? { ...prev, full_name: formData.full_name, phone: formData.phone } : null); setIsEditing(false) } catch (error) { console.error(error) } finally { setIsSaving(false) } }
  const handlePasswordChange = async (data: PasswordData) => { const { error } = await supabase.auth.updateUser({ password: data.new_password }); if (error) throw error }
  const handleNotificationChange = async (prefs: NotificationPrefs) => { if (!user) return; setIsSavingPrefs(true); try { const { error } = await supabase.from("profiles").upsert({ id: user.id, notification_email: prefs.email, notification_sms: prefs.sms, notification_push: prefs.push, notification_marketing: prefs.marketing, updated_at: new Date().toISOString() }); if (error) throw error; setNotificationPrefs(prefs) } catch (error) { console.error(error); setNotificationPrefs(prev => ({ ...prev })) } finally { setIsSavingPrefs(false) } }
  const handleDeleteAccount = async () => { if (!user) return; const { error } = await supabase.auth.admin.deleteUser(user.id); if (error) throw error; router.push("/") }
  const handleUploadAvatar = () => {}
  if (isLoading) return <LoadingSkeleton />
  if (!user || !profile) return <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto px-4 py-8"><EmptyState icon={User} title="Profile Not Found" description={error || "We couldn't load your profile. Please try refreshing the page."} action={<Button onClick={() => router.refresh()} className="bg-amber-burst text-slate-100 shadow-amber-glow">Retry</Button>} /></motion.div>
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-4xl mx-auto">
      <motion.div className="mb-8" variants={fadeInUp}><h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3"><User className="w-8 h-8 text-amber-primary" />Profile Settings</h1><p className="text-slate-400 mt-1">Manage your account, preferences, and security</p></motion.div>
      <motion.div variants={staggerContainer} className="space-y-6"><AvatarSection avatarUrl={profile.avatar_url} fullName={formData.full_name || user.email.split("@")[0]} onUploadClick={handleUploadAvatar} isEditing={isEditing} onSave={handleSaveProfile} onCancel={() => { setIsEditing(false); setFormData({ full_name: profile.full_name || "", phone: profile.phone || "" }) }} /><Separator className="border-slate-border" /><PersonalInfoCard formData={formData} setFormData={setFormData} email={user.email} isEditing={isEditing} setIsEditing={setIsEditing} onSave={handleSaveProfile} onCancel={() => { setIsEditing(false); setFormData({ full_name: profile.full_name || "", phone: profile.phone || "" }) }} isSaving={isSaving} /><PasswordChangeCard onPasswordChange={handlePasswordChange} /><PaymentMethodsCard /><NotificationPreferencesCard preferences={notificationPrefs} onChange={handleNotificationChange} isSaving={isSavingPrefs} /><DangerZoneCard onDeleteAccount={handleDeleteAccount} /></motion.div></motion.div>
  )
}