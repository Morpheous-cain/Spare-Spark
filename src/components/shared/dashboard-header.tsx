"use client"

import Link from "next/link"
import { Menu, LogOut, Bell, ChevronDown, Wrench, Car } from "lucide-react"
import { cn } from "@/lib/utils"
import { signOutAction } from "@/lib/actions"

interface DashboardHeaderProps {
  userName: string
  userRole: "customer" | "mechanic"
  avatarUrl?: string | null
  onMenuToggle: () => void
}

export default function DashboardHeader({
  userName,
  userRole,
  avatarUrl,
  onMenuToggle,
}: DashboardHeaderProps) {
  const roleBadgeColor =
    userRole === "mechanic"
      ? "bg-amber-subtle text-amber-glow border-amber-primary/30"
      : "bg-green-500/15 text-green-400 border-green-500/30"

  const RoleIcon = userRole === "mechanic" ? Wrench : Car

  return (
    <header className="sticky top-0 z-30 border-b border-slate-border bg-obsidian-surface/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Left: hamburger + logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-700/40 hover:text-white transition-colors lg:hidden"
            onClick={onMenuToggle}
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link href="/" className="flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-burst shadow-amber-glow">
              <Wrench className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-100">
              Spare<span className="text-amber-primary">Spark</span>
            </span>
          </Link>
        </div>

        {/* Center: search (desktop) — design-doc §7 live transparency */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <input
              type="search"
              placeholder="Search jobs, parts, vehicles..."
              className="w-full min-h-[44px] rounded-xl border border-slate-border bg-obsidian-bg px-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-amber-primary focus:outline-none focus:ring-2 focus:ring-amber-primary/20"
            />
          </div>
        </div>

        {/* Right: notifications + user */}
        <div className="flex items-center gap-3">
          {/* Notifications — design-doc live transparency */}
          <button
            type="button"
            className="relative rounded-full p-2 text-slate-400 hover:bg-slate-700/40 hover:text-white transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-amber-primary ring-2 ring-obsidian-bg animate-ping" />
          </button>

          {/* User info — design-doc §3 trust transparency */}
          <div className="flex items-center gap-3">
            {/* Avatar */}
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={userName}
                className="h-8 w-8 rounded-full object-cover ring-2 ring-slate-border"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-burst text-sm font-semibold text-white">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="hidden md:block">
              <p className="text-sm font-medium text-slate-100 truncate max-w-[140px]">{userName}</p>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium capitalize border",
                  roleBadgeColor
                )}
              >
                <RoleIcon className="h-3 w-3" />
                {userRole}
              </span>
            </div>

            <ChevronDown className="hidden h-4 w-4 text-slate-500 md:block" />
          </div>

          {/* Sign out — server action (reliable + design-doc amber destructive) */}
          <form action={() => signOutAction()}>
            <button
              type="submit"
              className="flex min-h-[44px] items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-300 hover:bg-red-500/15 hover:text-red-400 border border-slate-border transition-all duration-200"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden md:inline">Sign out</span>
            </button>
          </form>
        </div>
      </div>
    </header>
  )
}