import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protected routes - redirect to sign-in if not authenticated
  if (
    !user &&
    !request.nextUrl.pathname.startsWith("/auth") &&
    !request.nextUrl.pathname.startsWith("/api") &&
    request.nextUrl.pathname !== "/"
  ) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/sign-in"
    url.searchParams.set("redirectTo", request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // Auth pages - redirect authenticated users to appropriate dashboard
  if (
    user &&
    request.nextUrl.pathname.startsWith("/auth") &&
    !request.nextUrl.pathname.startsWith("/auth/callback")
  ) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    const { data: mechanicProfile } = await supabase
      .from("mechanic_profiles")
      .select("id, kyc_status")
      .eq("id", user.id)
      .single()

    const isMechanic = mechanicProfile && mechanicProfile.kyc_status === "APPROVED"
    const url = request.nextUrl.clone()
    url.pathname = isMechanic ? "/mechanic/dashboard" : "/customer/dashboard"
    return NextResponse.redirect(url)
  }

  // Mechanic routes — guard: require approved KYC
  if (
    user &&
    request.nextUrl.pathname.startsWith("/mechanic") &&
    !request.nextUrl.pathname.startsWith("/mechanic/profile")
  ) {
    const { data: mechanicProfile } = await supabase
      .from("mechanic_profiles")
      .select("id, kyc_status")
      .eq("id", user.id)
      .single()

    if (!mechanicProfile || mechanicProfile.kyc_status !== "APPROVED") {
      const url = request.nextUrl.clone()
      url.pathname = "/mechanic/profile"
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}