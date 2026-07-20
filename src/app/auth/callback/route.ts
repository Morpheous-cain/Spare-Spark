import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/customer"

  if (code) {
    const cookieStore = request.headers.get("cookie") ?? ""
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.split("; ").map((cookie) => {
              const [name, ...rest] = cookie.split("=")
              return { name, value: rest.join("=") }
            })
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.headers.set("Set-Cookie", `${name}=${value}; ${options?.path ?? "/"}`)
            })
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Check user role to redirect to correct dashboard
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: mechanicProfile } = await supabase.from("mechanic_profiles").select("id, kyc_status").eq("id", user.id).single()
        const isMechanic = mechanicProfile && mechanicProfile.kyc_status === "APPROVED"
        return NextResponse.redirect(`${origin}${isMechanic ? "/mechanic/dashboard" : "/customer/dashboard"}`)
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/sign-in?error=auth_failed`)
}