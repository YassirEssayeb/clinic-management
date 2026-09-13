"use client"

import Link from "next/link"
import { Bell, Search, Menu } from "lucide-react"
import { useEffect, useState } from "react"

interface TopBarProps {
  title: string
  role: string
  user?: { name?: string | null; email?: string | null }
  onMenuClick: () => void
}

export default function TopBar({ title, role, user, onMenuClick }: TopBarProps) {
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => {
        const count = (data.notifications ?? []).filter((n: any) => !n.read).length
        setUnread(count)
      })
      .catch(() => {})
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 md:left-[280px] h-14 md:h-16 bg-background border-b border-border flex items-center justify-between px-4 md:px-6 z-30">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 rounded-lg hover:bg-muted transition-colors shrink-0"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-base md:text-lg font-semibold text-foreground truncate">{title}</h1>
      </div>

      <div className="flex-1 max-w-md mx-4 md:mx-8 hidden sm:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full rounded-full bg-muted border border-border pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        <Link href={`/${role.toLowerCase()}/notifications`} className="relative p-2 rounded-lg hover:bg-muted transition-colors">
          <Bell className="h-5 w-5 text-muted-foreground" />
          {unread > 0 && (
            <span className="absolute top-1 right-1 h-4 min-w-[1rem] px-1 flex items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </Link>

        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-xs font-semibold text-white">
          {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
        </div>
      </div>
    </header>
  )
}
