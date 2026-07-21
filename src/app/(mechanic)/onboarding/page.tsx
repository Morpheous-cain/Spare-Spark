"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { formatCurrency, formatDate } from "@/lib/utils"
import { containerVariants, itemVariants, fadeInUp, cardEntrance, staggerContainer } from "@/lib/animations"
import { Wrench, LogOut, Upload, CheckCircle, AlertCircle, X, Loader2, Shield, FileText, IdCard, BadgeCheck, Check, AlertTriangle, ChevronRight, ChevronLeft, ArrowRight } from "lucide-react"

const supabase = createClient()

const DOC_TYPES = [
  { id: "national_id_front", label: "National ID (Front)", icon: IdCard, required: true },
  { id: "national_id_back", label: "National ID (Back)", icon: IdCard, required: true },
  { id: "drivers_license", label: "Driver's License", icon: BadgeCheck, required: true },
  { id: "mov_certificate", label: "MOV Certificate", icon: FileText, required: true },
] as const

const STEPS = [
  { id: 1, label: "Register", key: "register" },
  { id: 2, label: "Documents", key: "documents" },
  { id: 3, label: "Verification", key: "verification" },
  { id: 4, label: "Approved", key: "approved" },
]

export default function MechanicOnboardingPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [documents, setDocuments] = useState<Record<string, { file: File; url: string | null; uploading: boolean }>>({})
  const [profileComplete, setProfileComplete] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/sign-in")
        return
      }
      const { data } = await supabase.from("mechanic_profiles").select("*").eq("id", user.id).single()
      setProfile(data)
      setProfileComplete(!!data)
      if (data) {
        const { data: docs } = await supabase.from("mechanic_documents").select("*").eq("mechanic_id", user.id)
        if (docs) {
          const docMap: Record<string, { file: File; url: string | null; uploading: boolean }> = {}
          docs.forEach(d => {
            docMap[d.document_type] = { file: null as any, url: d.file_url, uploading: false }
          })
          setDocuments(docMap)
        }
      }
      setLoading(false)
    }
    fetchProfile()
  }, [router])

  const uploadedCount = Object.values(documents).filter(d => d.url).length
  const allRequiredUploaded = DOC_TYPES.every(d => documents[d.id]?.url)
  const progress = (uploadedCount / DOC_TYPES.length) * 100

  const handleFileSelect = (docId: string, file: File) => {
    setDocuments(prev => ({ ...prev, [docId]: { file, url: null, uploading: true } }))
    // TODO: Upload to Supabase Storage
    setTimeout(() => {
      const mockUrl = URL.createObjectURL(file)
      setDocuments(prev => ({ ...prev, [docId]: { file, url: mockUrl, uploading: false } }))
    }, 800)
  }

  const handleRemove = (docId: string) => {
    setDocuments(prev => ({ ...prev, [docId]: { file: null as any, url: null, uploading: false } }))
  }

  const handleSubmit = async () => {
    if (!allRequiredUploaded) return
    setSubmitting(true)
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")
      const { error } = await supabase.from("mechanic_profiles").update({ kyc_status: "PENDING" }).eq("id", user.id)
      if (error) throw error
      setSubmitted(true)
      setSubmitting(false)
    } catch (e: any) {
      setError(e.message)
      setSubmitting(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth/sign-in")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-obsidian-bg flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-amber-primary animate-spin" />
      </div>
    )
  }

  const completedSteps = profile ? 1 : 0

  return (
    <div className="min-h-screen bg-obsidian-bg text-text-primary font-inter">
      <header className="border-b border-slate-border bg-obsidian-surface/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/mechanic/onboarding" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-burst flex items-center justify-center">
              <Wrench className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-amber-burst bg-clip-text text-transparent">SpareSpark</span>
          </Link>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-text-secondary hover:text-amber-primary min-h-[40px]">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-4xl">
        <motion.div variants={staggerContainer} initial="hidden" animate="visible">
          <motion.div variants={fadeInUp}>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-text-primary">Mechanic Onboarding</h1>
                <p className="text-text-secondary mt-1">Complete your profile and upload documents to get verified</p>
              </div>
              <Badge variant="secondary" className="text-sm px-3 py-1.5 bg-amber-subtle text-amber-glow border-amber-primary/20">
                {profileComplete ? "Profile Complete" : "Profile Incomplete"}
              </Badge>
            </div>
          </motion.div>

          <motion.div variants={fadeInUp} style={{ transitionDelay: "0.1s" }}>
            <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-4">
              {STEPS.map((step, idx) => (
                <motion.div key={step.key} layout variants={itemVariants} style={{ flexShrink: 0 }}>
                  <div className="flex flex-col items-center gap-2">
                    <div className="relative">
                      <div className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold border-4 transition-all duration-300",
                        idx < completedSteps
                          ? "bg-amber-burst border-amber-primary text-white shadow-amber-glow"
                          : idx === completedSteps
                          ? "bg-obsidian-surface border-amber-primary text-amber-primary"
                          : "bg-obsidian-surface border-slate-border text-text-secondary"
                      )}>
                        {idx < completedSteps ? <Check className="h-5 w-5" /> : step.id}
                      </div>
                      {idx < STEPS.length - 1 && (
                        <div className={cn(
                          "absolute top-1/2 left-full w-16 h-1 -translate-y-1/2",
                          idx < completedSteps ? "bg-amber-burst" : "bg-slate-border"
                        )} />
                      )}
                    </div>
                    <span className={cn(
                      "text-xs font-medium text-center w-24",
                      idx < completedSteps ? "text-amber-primary" : "text-text-secondary"
                    )}>
                      {step.label}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div key="success" variants={fadeInUp} initial="hidden" animate="visible" exit="exit" className="text-center py-16">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-amber-subtle mb-6">
                  <Loader2 className="h-10 w-10 text-amber-primary animate-spin" />
                </div>
                <h2 className="text-2xl font-bold text-text-primary mb-3">Verification Pending</h2>
                <p className="text-text-secondary max-w-md mx-auto">We've received your documents. Our team will review them within 24-48 hours. You'll receive a notification once verified.</p>
                <div className="mt-8 flex items-center justify-center gap-4 text-sm text-text-secondary">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-primary animate-pulse" />
                    <span>Under Review</span>
                  </div>
                  <div className="w-px h-6 bg-slate-border" />
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-status-success" />
                    <span className="text-status-success">Secure</span>
                  </div>
                </div>
              </motion.div>
            ) : (
              <>
                <motion.div key="progress" variants={cardEntrance} className="mb-8">
                  <Card className="bg-obsidian-surface border-slate-border shadow-card-elev rounded-2xl">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <CardTitle className="text-lg">Profile Completeness</CardTitle>
                        <span className="text-amber-primary font-bold">{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-3 bg-slate-border" />
                      <p className="text-text-secondary text-sm mt-3">
                        {uploadedCount} of {DOC_TYPES.length} documents uploaded
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div key="documents" variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
                  {DOC_TYPES.map((doc, idx) => (
                    <motion.div key={doc.id} variants={cardEntrance} style={{ transitionDelay: `${idx * 0.08}s` }}>
                      <Card className={cn(
                        "bg-obsidian-surface border-slate-border shadow-card-elev rounded-2xl transition-all duration-300",
                        documents[doc.id]?.url && "border-amber-primary/30 bg-amber-subtle"
                      )}>
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className={cn(
                              "w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0",
                              documents[doc.id]?.url ? "bg-amber-burst" : "bg-slate-surface border border-slate-border"
                            )}>
                              {documents[doc.id]?.url ? (
                                <CheckCircle className="h-7 w-7 text-white" />
                              ) : (
                                <doc.icon className={cn("h-7 w-7", documents[doc.id]?.url ? "text-white" : "text-amber-primary")} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-2">
                                <CardTitle className="text-base">{doc.label}</CardTitle>
                                {doc.required && <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-amber-subtle text-amber-glow">Required</Badge>}
                              </div>
                              <p className="text-text-secondary text-sm mb-4">Upload a clear, legible photo or scan of your {doc.label.toLowerCase()}</p>

                              {documents[doc.id]?.uploading && (
                                <div className="flex items-center gap-3 text-sm text-amber-primary">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  <span>Uploading...</span>
                                </div>
                              )}

                              {!documents[doc.id]?.url && !documents[doc.id]?.uploading && (
                                <div className="relative">
                                  <input
                                    type="file"
                                    accept="image/*,application/pdf"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={e => e.target.files?.[0] && handleFileSelect(doc.id, e.target.files[0])}
                                    disabled={submitted}
                                  />
                                  <div className={cn(
                                    "border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer",
                                    "hover:bg-amber-subtle hover:border-amber-primary",
                                    "bg-slate-surface border-slate-border"
                                  )}>
                                    <Upload className="h-8 w-8 mx-auto text-text-secondary mb-3" />
                                    <p className="text-text-secondary">Click or drag to upload</p>
                                    <p className="text-xs text-text-secondary mt-1">JPG, PNG, PDF up to 10MB</p>
                                  </div>
                                </div>
                              )}

                              {documents[doc.id]?.url && !documents[doc.id]?.uploading && (
                                <div className="flex items-center gap-3 p-3 bg-slate-surface rounded-xl">
                                  <div className="w-12 h-12 rounded-lg bg-amber-subtle flex items-center justify-center flex-shrink-0">
                                    <CheckCircle className="h-6 w-6 text-amber-primary" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-text-primary text-sm">Uploaded successfully</p>
                                    <p className="text-xs text-text-secondary">Ready for verification</p>
                                  </div>
                                  <Button variant="ghost" size="sm" onClick={() => handleRemove(doc.id)} className="text-text-secondary hover:text-status-danger min-h-[40px]">
                                    <X className="h-4 w-4 mr-1" />
                                    Replace
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>

                <motion.div key="submit" variants={fadeInUp} style={{ transitionDelay: "0.3s" }} className="mt-8">
                  <Card className={cn(
                    "bg-obsidian-surface border-slate-border shadow-card-elev rounded-2xl p-6 text-center",
                    allRequiredUploaded ? "border-amber-primary/30" : "border-slate-border"
                  )}>
                    {allRequiredUploaded ? (
                      <Button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="w-full min-h-[56px] text-lg bg-amber-burst shadow-amber-glow hover:opacity-90 rounded-xl"
                        style={{ boxShadow: "0 0 30px rgba(255, 94, 58, 0.4)" }}
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                            Submitting for Verification...
                          </>
                        ) : (
                          <>
                            <Shield className="h-5 w-5 mr-2" />
                            Submit for Verification
                          </>
                        )}
                      </Button>
                    ) : (
                      <>
                        <AlertCircle className="h-10 w-10 text-status-warning mx-auto mb-3" />
                        <CardTitle className="text-lg mb-2">All Documents Required</CardTitle>
                        <CardDescription className="text-text-secondary">
                          Please upload all 4 required documents before submitting for verification.
                        </CardDescription>
                      </>
                    )}
                    {error && (
                      <div className="mt-4 p-3 bg-status-danger/10 border border-status-danger/20 rounded-xl text-status-danger text-sm">
                        {error}
                      </div>
                    )}
                  </Card>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  )
}