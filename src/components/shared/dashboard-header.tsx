"use client"

import Link from "next/link"
import { Menu, LogOut, Bell, ChevronDown, Wrench, Car } from "lucide-react"
import { cn } from "@/lib/utils"

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
      ? "bg-orange-100 text-orange-700"
      : "bg-green-100 text-green-700"

  const RoleIcon = userRole === "mechanic" ? Wrench : Car

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Left: hamburger + logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 lg:hidden"
            onClick={onMenuToggle}
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link href="/" className="flex items-center gap-2 lg:hidden">
            <Wrench className="h-6 w-6 text-orange-500" />
            <span className="text-lg font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              Sparespark
            </span>
          </Link>
        </div>

        {/* Center: search (desktop) */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <input
              type="search"
              placeholder="Search jobs, parts, vehicles..."
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm placeholder-gray-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
            />
          </div>
        </div>

        {/* Right: notifications + user */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button
            type="button"
            className="relative rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          </button>

          {/* User info */}
          <div className="flex items-center gap-3">
            {/* Avatar */}
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={userName}
                className="h-8 w-8 rounded-full object-cover ring-2 ring-gray-200"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-sm font-semibold text-orange-600">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-900">{userName}</p>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                  roleBadgeColor
                )}
              >
                <RoleIcon className="h-3 w-3" />
                {userRole}
              </span>
            </div>

            <ChevronDown className="hidden h-4 w-4 text-gray-400 md:block" />
          </div>

          {/* Sign out */}
          <form action="/auth/sign-out" method="POST">
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
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