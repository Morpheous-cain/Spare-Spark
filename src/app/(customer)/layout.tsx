import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import DashboardLayout from "@/components/shared/dashboard-layout"

export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/sign-in")

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return (
    <DashboardLayout userName={profile?.full_name || user.email || "User"} userRole="customer" avatarUrl={user.user_metadata?.avatar_url}>
      {children}
    </DashboardLayout>
  )
}