import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import DashboardLayout from "@/components/shared/dashboard-layout"

export default async function MechanicLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/sign-in")

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  const { data: mechanicProfile } = await supabase.from("mechanic_profiles").select("*").eq("id", user.id).single()

  if (!mechanicProfile || mechanicProfile.kyc_status !== "APPROVED") {
    redirect("/mechanic/profile")
  }

  return (
    <DashboardLayout userName={mechanicProfile.full_name || profile?.full_name || user.email?.split("@")[0] || "Mechanic"} userRole="mechanic" avatarUrl={mechanicProfile.avatar_url || profile?.avatar_url}>
      {children}
    </DashboardLayout>
  )
}