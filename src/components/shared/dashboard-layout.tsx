"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import DashboardSidebar from "@/components/shared/dashboard-sidebar"
import DashboardHeader from "@/components/shared/dashboard-header"
import { pageTransition } from "@/lib/animations"

interface DashboardLayoutProps {
  userName: string
  userRole: "customer" | "mechanic"
  avatarUrl?: string | null
  children: React.ReactNode
}

export default function DashboardLayout({
  userName,
  userRole,
  avatarUrl,
  children,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-obsidian-bg">
      {/* Animated background orbs — design-doc §3 radar glow */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
      </div>

      {/* Sidebar */}
      <DashboardSidebar
        userRole={userRole}
        activePath={pathname}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main area */}
      <div className="relative z-10 lg:pl-72">
        {/* Header — design-doc §1 CTA above fold */}
        <DashboardHeader
          userName={userName}
          userRole={userRole}
          avatarUrl={avatarUrl}
          onMenuToggle={() => setSidebarOpen((prev) => !prev)}
        />

        {/* Page content with transitions — 8pt spacing system */}
        <main className="min-h-[calc(100vh-4rem)] p-4 lg:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              variants={pageTransition}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}