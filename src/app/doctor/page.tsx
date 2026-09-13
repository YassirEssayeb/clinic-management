"use client"

import { useEffect, useState } from "react"
import { getDashboardStats as getDocStats, getDoctorProfile } from "@/actions/doctor.actions"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, FileText } from "lucide-react"

export default function DoctorDashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDocStats().then((data) => { setStats(data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-[#111c2d]">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <div key={i} className="bg-white border border-[#c3c6d5] rounded-xl p-6 h-auto min-h-[8rem] animate-pulse" />)}
        </div>
      </div>
    )
  }

  const metricCards = [
    { label: "Today's Appointments", value: stats?.todayAppointments ?? 0, icon: Calendar, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Total Patients", value: stats?.totalPatients ?? 0, icon: Users, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Prescriptions", value: stats?.pendingPrescriptions ?? 0, icon: FileText, color: "text-violet-600", bg: "bg-violet-50" },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-[#111c2d]">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metricCards.map((card) => (
          <div key={card.label} className="bg-white border border-[#c3c6d5] rounded-xl p-6 h-auto min-h-[8rem] flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-[#434653] uppercase tracking-wider">{card.label}</p>
              <p className="text-3xl font-bold text-[#111c2d] mt-2">{card.value}</p>
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
            <h2 className="text-sm font-semibold text-[#111c2d]">Upcoming Appointments</h2>
          </div>
          <div className="divide-y divide-[#c3c6d5]">
            {(stats?.upcomingAppointments ?? []).length === 0 ? (
              <p className="p-6 text-sm text-[#434653]">No upcoming appointments.</p>
            ) : (
              (stats?.upcomingAppointments ?? []).map((a: any) => (
                <div key={a.id} className="flex items-center justify-between px-6 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-[#f0f3ff] flex items-center justify-center text-sm font-semibold text-[#003c90]">
                      {a.patientName?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#111c2d]">{a.patientName}</p>
                      <p className="text-xs text-[#434653]">{new Date(a.date).toLocaleDateString()} at {a.time}</p>
                    </div>
                  </div>
                  <Badge variant={a.status === "CONFIRMED" ? "success" : "warning"}>{a.status}</Badge>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white border border-[#c3c6d5] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#c3c6d5]">
            <h2 className="text-sm font-semibold text-[#111c2d]">Recent Patients</h2>
          </div>
          <div className="divide-y divide-[#c3c6d5]">
            {(stats?.recentPatients ?? []).length === 0 ? (
              <p className="p-6 text-sm text-[#434653]">No patients yet.</p>
            ) : (
              (stats?.recentPatients ?? []).map((p: any) => (
                <div key={p.id} className="flex items-center gap-3 px-6 py-3">
                  <div className="h-9 w-9 rounded-full bg-[#f0f3ff] flex items-center justify-center text-sm font-semibold text-[#003c90]">
                    {p.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#111c2d]">{p.name}</p>
                    <p className="text-xs text-[#434653]">{p.email}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
