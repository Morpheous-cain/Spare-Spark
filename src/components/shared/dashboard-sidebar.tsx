"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import {
  LayoutDashboard,
  CalendarCheck,
  Car,
  Package,
  User,
  Wrench,
  Radar,
  DollarSign,
  Clock,
} from "lucide-react"
import {
  containerVariants,
  itemVariants,
} from "@/lib/animations"
import { cn } from "@/lib/utils"

type UserRole = "customer" | "mechanic"

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

// ponytail: only routes that resolve to real pages (context/design-doc §7 app-flow)
const customerNav: NavItem[] = [
  { label: "Dashboard", href: "/customer/dashboard", icon: LayoutDashboard },
  { label: "Bookings", href: "/customer/bookings", icon: CalendarCheck },
  { label: "Vehicles", href: "/customer/vehicles", icon: Car },
  { label: "Parts", href: "/customer/parts", icon: Package },
  { label: "Profile", href: "/customer/profile", icon: User },
]

const mechanicNav: NavItem[] = [
  { label: "Dashboard", href: "/mechanic/dashboard", icon: LayoutDashboard },
  { label: "Job Radar", href: "/mechanic/jobs", icon: Radar },
  { label: "Earnings", href: "/mechanic/earnings", icon: DollarSign },
  { label: "Availability", href: "/mechanic/availability", icon: Clock },
  { label: "Profile", href: "/mechanic/profile", icon: User },
]

interface DashboardSidebarProps {
  userRole: UserRole
  activePath: string
  isOpen: boolean
  onClose: () => void
}

export default function DashboardSidebar({
  userRole,
  activePath,
  isOpen,
  onClose,
}: DashboardSidebarProps) {
  const navItems = userRole === "customer" ? customerNav : mechanicNav

  const sidebarContent = (
    <div className="flex h-full flex-col bg-obsidian-surface border-r border-slate-border">
      {/* Logo — design-doc §1 brand accent */}
      <div className="flex h-16 items-center gap-2.5 border-b border-slate-border px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-burst shadow-amber-glow">
          <Wrench className="h-5 w-5 text-white" />
        </div>
        <span className="text-xl font-bold tracking-tight text-slate-100">
          Spare<span className="text-amber-primary">Spark</span>
        </span>
      </div>

      {/* Navigation — 56px min touch targets (design-doc Rule 1) */}
      <motion.nav
        className="flex-1 overflow-y-auto px-3 py-4 space-y-1"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activePath === item.href || activePath.startsWith(item.href + "/")

          return (
            <motion.div key={item.href} variants={itemVariants}>
              <Link
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex min-h-[56px] items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-amber-subtle text-amber-glow border border-amber-primary/30 shadow-amber-glow"
                    : "text-slate-300 hover:bg-slate-700/40 hover:text-white border border-transparent"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {item.label}
              </Link>
            </motion.div>
          )
        })}
      </motion.nav>

      {/* Role badge — design-doc §2 status pills */}
      <div className="border-t border-slate-border px-6 py-4">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-subtle px-3 py-1.5 text-xs font-semibold capitalize text-amber-glow">
          <Wrench className="h-3 w-3" />
          {userRole}
        </span>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
      )}

      {/* Mobile sidebar — w-72 design-doc §4 */}
      <motion.aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 -translate-x-full transition-transform duration-300 lg:hidden",
          isOpen && "translate-x-0"
        )}
      >
        {sidebarContent}
      </motion.aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        {sidebarContent}
      </aside>
    </>
  )
}
