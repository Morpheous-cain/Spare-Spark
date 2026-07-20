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
  Briefcase,
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
  { label: "Active Job", href: "/mechanic/jobs/active", icon: Briefcase },
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
    <div className="flex h-full flex-col bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-6">
        <Wrench className="h-7 w-7 text-orange-500" />
        <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
          Sparespark
        </span>
      </div>

      {/* Navigation */}
      <motion.nav
        className="flex-1 overflow-y-auto py-4 px-3 space-y-1"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activePath === item.href

          return (
            <motion.div key={item.href} variants={itemVariants}>
              <Link
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-orange-50 text-orange-600"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {item.label}
              </Link>
            </motion.div>
          )
        })}
      </motion.nav>

      {/* Role badge */}
      <div className="border-t border-gray-200 px-6 py-4">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700 capitalize">
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
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
      )}

      {/* Mobile sidebar */}
      <motion.aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 -translate-x-full transition-transform duration-300 lg:hidden",
          isOpen && "translate-x-0"
        )}
      >
        {sidebarContent}
      </motion.aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        {sidebarContent}
      </aside>
    </>
  )
}