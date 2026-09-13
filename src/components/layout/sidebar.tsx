"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import {
  LayoutDashboard,
  Calendar,
  Users,
  UserCog,
  CreditCard,
  FileText,
  Settings,
  LogOut,
  Stethoscope,
  X,
  Bell,
} from "lucide-react"

export interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const adminNavItems: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Appointments", href: "/admin/appointments", icon: Calendar },
  { label: "Patients", href: "/admin/patients", icon: Users },
  { label: "Doctors", href: "/admin/doctors", icon: UserCog },
  { label: "Invoices", href: "/admin/invoices", icon: CreditCard },
  { label: "Reports", href: "/admin/reports", icon: FileText },
  { label: "Notifications", href: "/admin/notifications", icon: Bell },
  { label: "Settings", href: "/admin/settings", icon: Settings },
]

const doctorNavItems: NavItem[] = [
  { label: "Dashboard", href: "/doctor", icon: LayoutDashboard },
  { label: "Appointments", href: "/doctor/appointments", icon: Calendar },
  { label: "Patients", href: "/doctor/patients", icon: Users },
  { label: "Medical Records", href: "/doctor/medical-records", icon: FileText },
  { label: "Prescriptions", href: "/doctor/prescriptions", icon: FileText },
  { label: "Notifications", href: "/doctor/notifications", icon: Bell },
  { label: "Profile", href: "/doctor/profile", icon: Settings },
]

const patientNavItems: NavItem[] = [
  { label: "Dashboard", href: "/patient", icon: LayoutDashboard },
  { label: "Appointments", href: "/patient/appointments", icon: Calendar },
  { label: "Medical Records", href: "/patient/medical-records", icon: FileText },
  { label: "Invoices", href: "/patient/invoices", icon: CreditCard },
  { label: "Notifications", href: "/patient/notifications", icon: Bell },
  { label: "Profile", href: "/patient/profile", icon: Settings },
]

const receptionistNavItems: NavItem[] = [
  { label: "Dashboard", href: "/receptionist", icon: LayoutDashboard },
  { label: "Appointments", href: "/receptionist/appointments", icon: Calendar },
  { label: "Patients", href: "/receptionist/patients", icon: Users },
  { label: "Notifications", href: "/receptionist/notifications", icon: Bell },
  { label: "Profile", href: "/receptionist/profile", icon: Settings },
]

export const navItemsByRole: Record<string, NavItem[]> = {
  ADMIN: adminNavItems,
  DOCTOR: doctorNavItems,
  PATIENT: patientNavItems,
  RECEPTIONIST: receptionistNavItems,
}

interface SidebarProps {
  role: string
  user?: { name?: string | null; email?: string | null }
  open: boolean
  onClose: () => void
}

export default function Sidebar({ role, user, open, onClose }: SidebarProps) {
  const pathname = usePathname()
  const items = (navItemsByRole[role] ?? []) as NavItem[]

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" })
  }

  const handleNavClick = () => {
    if (window.innerWidth < 768) onClose()
  }

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 bottom-0 w-[280px] bg-background border-r border-border flex flex-col z-50 transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-border shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <Stethoscope className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold text-primary">ClinicPro</span>
          </Link>
          <button onClick={onClose} className="md:hidden p-1 rounded-lg hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {items.map((item: NavItem) => {
              const isActive = pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={handleNavClick}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-muted text-primary font-semibold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="border-t border-border p-4 shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-sm font-semibold text-primary shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user?.name ?? "User"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email ?? ""}
              </p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}
