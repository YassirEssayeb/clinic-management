"use client"

import { useEffect, useState } from "react"
import { getDashboardStats } from "@/actions/admin.actions"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  UserCog,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from "lucide-react"

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboardStats().then((res) => {
      if (res.success) setStats(res.data)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-[#111c2d]">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white border border-[#c3c6d5] rounded-xl p-6 h-auto min-h-[8rem] animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const metricCards = [
    {
      label: "Total Patients",
      value: stats?.totalPatients ?? 0,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
      change: stats?.patientChange,
    },
    {
      label: "Total Doctors",
      value: stats?.totalDoctors ?? 0,
      icon: UserCog,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      change: null,
    },
    {
      label: "Appointments",
      value: stats?.totalAppointments ?? 0,
      icon: Calendar,
      color: "text-violet-600",
      bg: "bg-violet-50",
      change: stats?.appointmentChange,
    },
    {
      label: "Revenue (This Month)",
      value: `$${(stats?.monthlyRevenue ?? 0).toLocaleString()}`,
      icon: DollarSign,
      color: "text-amber-600",
      bg: "bg-amber-50",
      change: stats?.revenueChange,
    },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-[#111c2d]">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {metricCards.map((card) => (
          <div
            key={card.label}
            className="bg-white border border-[#c3c6d5] rounded-xl p-6 h-auto min-h-[8rem] flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-semibold text-[#434653] uppercase tracking-wider">
                {card.label}
              </p>
              <p className="text-3xl font-bold text-[#111c2d] mt-2">{card.value}</p>
              {card.change !== null && card.change !== undefined && (
                <div className="flex items-center gap-1 mt-1">
                  {card.change >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span
                    className={`text-xs font-medium ${card.change >= 0 ? "text-green-500" : "text-red-500"}`}
                  >
                    {Math.abs(card.change).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
            <div className={`p-3 rounded-xl ${card.bg}`}>
              <card.icon className={`h-6 w-6 ${card.color}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-[#c3c6d5] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#c3c6d5]">
            <h2 className="text-sm font-semibold text-[#111c2d]">Recent Patients</h2>
          </div>
          <div className="divide-y divide-[#c3c6d5]">
            {(stats?.recentPatients ?? []).length === 0 ? (
              <p className="p-6 text-sm text-[#434653]">No patients yet.</p>
            ) : (
              (stats?.recentPatients ?? []).map((p: any) => (
                <div key={p.id} className="flex items-center justify-between px-6 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-[#f0f3ff] flex items-center justify-center text-sm font-semibold text-[#003c90]">
                      {p.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#111c2d]">{p.name}</p>
                      <p className="text-xs text-[#434653]">{p.email}</p>
                    </div>
                  </div>
                  <span className="text-xs text-[#434653]">
                    {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : ""}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white border border-[#c3c6d5] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#c3c6d5]">
            <h2 className="text-sm font-semibold text-[#111c2d]">Upcoming Appointments</h2>
          </div>
          <div className="divide-y divide-[#c3c6d5]">
            {(stats?.upcomingAppointments ?? []).length === 0 ? (
              <p className="p-6 text-sm text-[#434653]">No upcoming appointments.</p>
            ) : (
              (stats?.upcomingAppointments ?? []).map((a: any) => (
                <div key={a.id} className="flex items-center justify-between px-6 py-3">
                  <div>
                    <p className="text-sm font-medium text-[#111c2d]">
                      {a.patientName} → {a.doctorName}
                    </p>
                    <p className="text-xs text-[#434653]">
                      {new Date(a.date).toLocaleDateString()} at {a.time}
                    </p>
                  </div>
                  <Badge variant={a.status === "CONFIRMED" ? "success" : a.status === "CANCELLED" ? "danger" : "warning"}>
                    {a.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
