"use client"

import { useState, useEffect } from "react"
import Sidebar from "./sidebar"
import TopBar from "./topbar"

interface DashboardLayoutProps {
  children: React.ReactNode
  title: string
  role: string
  user?: { name?: string | null; email?: string | null }
}

export default function DashboardLayout({
  children,
  title,
  role,
  user,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setSidebarOpen(false)
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Sidebar role={role} user={user} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <TopBar title={title} role={role} user={user} onMenuClick={() => setSidebarOpen(true)} />
      <main className="md:ml-[280px] pt-14 md:pt-16 min-h-screen">
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  )
}
