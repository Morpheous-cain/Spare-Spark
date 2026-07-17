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
    <div className="min-h-screen bg-gray-50/50">
      {/* Sidebar */}
      <DashboardSidebar
        userRole={userRole}
        activePath={pathname}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main area */}
      <div className="lg:pl-64">
        {/* Header */}
        <DashboardHeader
          userName={userName}
          userRole={userRole}
          avatarUrl={avatarUrl}
          onMenuToggle={() => setSidebarOpen((prev) => !prev)}
        />

        {/* Page content with transitions */}
        <main className="min-h-[calc(100vh-4rem)]">
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
