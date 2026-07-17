import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import DashboardLayout from "@/components/shared/dashboard-layout"

export default async function BookingsLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/sign-in")

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return (
    <DashboardLayout userName={profile?.full_name || user.email?.split("@")[0] || "User"} userRole="customer">
      {children}
    </DashboardLayout>
  )
}