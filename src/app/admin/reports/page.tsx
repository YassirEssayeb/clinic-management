"use client"

import { useEffect, useState, useCallback } from "react"
import {
  getRevenueReport,
  getAppointmentsReport,
  getDoctorsPerformanceReport,
  getPatientGrowthReport,
} from "@/actions/admin.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

type Tab = "revenue" | "appointments" | "doctors" | "patients"

export default function AdminReportsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("revenue")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [revenueData, setRevenueData] = useState<any[]>([])
  const [appointmentsData, setAppointmentsData] = useState<any[]>([])
  const [doctorsData, setDoctorsData] = useState<any[]>([])
  const [patientsData, setPatientsData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const fetchReport = useCallback(async (tab: Tab) => {
    setLoading(true)
    const params = { fromDate: fromDate || undefined, toDate: toDate || undefined }
    try {
      if (tab === "revenue") {
        const res = await getRevenueReport(params)
        if (res.success) setRevenueData(res.data)
      } else if (tab === "appointments") {
        const res = await getAppointmentsReport(params)
        if (res.success) setAppointmentsData(res.data)
      } else if (tab === "doctors") {
        const res = await getDoctorsPerformanceReport(params)
        if (res.success) setDoctorsData(res.data)
      } else {
        const res = await getPatientGrowthReport(params)
        if (res.success) setPatientsData(res.data)
      }
    } catch {
      toast.error("Failed to fetch report")
    }
    setLoading(false)
  }, [fromDate, toDate])

  useEffect(() => { fetchReport(activeTab) }, [activeTab, fetchReport])

  const tabs: { key: Tab; label: string }[] = [
    { key: "revenue", label: "Revenue" },
    { key: "appointments", label: "Appointments" },
    { key: "doctors", label: "Doctor Performance" },
    { key: "patients", label: "Patient Growth" },
  ]

  const renderBarChart = (data: { name: string; value: number }[], color: string) => {
    const max = Math.max(...data.map((d) => d.value), 1)
    return (
      <div className="flex items-end gap-3 h-64 pt-4">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2">
            <span className="text-xs font-medium text-[#111c2d]">{d.value}</span>
            <div
              className="w-full rounded-t-lg transition-all"
              style={{ height: `${(d.value / max) * 100}%`, backgroundColor: color, minHeight: "4px" }}
            />
            <span className="text-xs text-[#434653]">{d.name}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-[#111c2d]">Reports</h1>

      <div className="flex flex-wrap gap-3">
        <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="max-w-xs" />
        <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="max-w-xs" />
        <Button onClick={() => fetchReport(activeTab)}>Apply Filter</Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.key ? "bg-[#003c90] text-white" : "bg-white border border-[#c3c6d5] text-[#434653] hover:bg-[#f0f3ff]"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white border border-[#c3c6d5] rounded-xl p-6">
        {loading ? (
          <div className="h-64 flex items-center justify-center text-[#434653]">Loading...</div>
        ) : activeTab === "revenue" ? (
          <div>
            <h2 className="text-sm font-semibold text-[#111c2d] mb-4">Revenue by Period</h2>
            {revenueData.length === 0 ? (
              <p className="text-sm text-[#434653]">No data available.</p>
            ) : (
              <>
                {renderBarChart(revenueData.map((d) => ({ name: d.period, value: Number(d.revenue) })), "#003c90")}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-4 border-t border-[#c3c6d5]">
                  <div className="text-center">
                    <p className="text-xs font-semibold text-[#434653] uppercase">Total Revenue</p>
                    <p className="text-xl font-bold text-[#111c2d]">${revenueData.reduce((s, d) => s + Number(d.revenue), 0).toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold text-[#434653] uppercase">Total Invoices</p>
                    <p className="text-xl font-bold text-[#111c2d]">{revenueData.reduce((s, d) => s + Number(d.count), 0)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold text-[#434653] uppercase">Avg per Invoice</p>
                    <p className="text-xl font-bold text-[#111c2d]">
                      ${revenueData.length > 0 ? Math.round(revenueData.reduce((s, d) => s + Number(d.revenue), 0) / revenueData.reduce((s, d) => s + Number(d.count), 0)).toLocaleString() : 0}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : activeTab === "appointments" ? (
          <div>
            <h2 className="text-sm font-semibold text-[#111c2d] mb-4">Appointments by Period</h2>
            {appointmentsData.length === 0 ? (
              <p className="text-sm text-[#434653]">No data available.</p>
            ) : (
              <>
                {renderBarChart(appointmentsData.map((d) => ({ name: d.period, value: Number(d.total) })), "#6366f1")}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-4 border-t border-[#c3c6d5]">
                  <div className="text-center">
                    <p className="text-xs font-semibold text-[#434653] uppercase">Total</p>
                    <p className="text-xl font-bold text-[#111c2d]">{appointmentsData.reduce((s, d) => s + Number(d.total), 0)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold text-[#434653] uppercase">Completed</p>
                    <p className="text-xl font-bold text-green-600">{appointmentsData.reduce((s, d) => s + Number(d.completed), 0)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold text-[#434653] uppercase">Cancelled</p>
                    <p className="text-xl font-bold text-red-600">{appointmentsData.reduce((s, d) => s + Number(d.cancelled), 0)}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : activeTab === "doctors" ? (
          <div>
            <h2 className="text-sm font-semibold text-[#111c2d] mb-4">Doctor Performance</h2>
            {doctorsData.length === 0 ? (
              <p className="text-sm text-[#434653]">No data available.</p>
            ) : (
              <div className="space-y-4">
                {doctorsData.map((doc: any, i: number) => {
                  const maxAppts = Math.max(...doctorsData.map((d: any) => d._count?.appointments ?? 0), 1)
                  return (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-40 text-sm font-medium text-[#111c2d] truncate">{doc.user?.name}</div>
                      <div className="flex-1 h-6 bg-[#f0f3ff] rounded-lg overflow-hidden">
                        <div
                          className="h-full bg-[#003c90] rounded-lg"
                          style={{ width: `${((doc._count?.appointments ?? 0) / maxAppts) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-[#434653] w-16 text-right">{doc._count?.appointments ?? 0}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ) : (
          <div>
            <h2 className="text-sm font-semibold text-[#111c2d] mb-4">Patient Growth</h2>
            {patientsData.length === 0 ? (
              <p className="text-sm text-[#434653]">No data available.</p>
            ) : (
              renderBarChart(patientsData.map((d) => ({ name: d.period, value: Number(d.count) })), "#10b981")
            )}
          </div>
        )}
      </div>
    </div>
  )
}
