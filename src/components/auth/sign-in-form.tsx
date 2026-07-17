"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { Loader2, AlertCircle } from "lucide-react"

export function SignInForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    } else {
      // Redirect to home - middleware will handle role-based redirect
      window.location.href = "/"
    }
    setLoading(false)
  }

  async function handleSignInWithOtp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setError("Check your email for the magic link!")
    }
    setLoading(false)
  }

  async function handlePhoneOtp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const phone = prompt("Enter your phone number (e.g. +254712345678)")
    if (!phone) {
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signInWithOtp({
      phone,
    })

    if (error) {
      setError(error.message)
    } else {
      setError("OTP sent to your phone!")
    }
    setLoading(false)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>Sign in to your Sparespark account</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSignIn} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <Button variant="outline" onClick={handleSignInWithOtp} disabled={loading} className="w-full">
            <span className="mr-2">✉</span> Email Magic Link
          </Button>
          <Button variant="outline" onClick={handlePhoneOtp} disabled={loading} className="w-full">
            <span className="mr-2">📱</span> Phone OTP
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <a href="/auth/sign-up" className="text-primary hover:underline font-medium">
            Sign up
          </a>
        </p>
      </CardContent>
    </Card>
  )
}