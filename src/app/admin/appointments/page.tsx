"use client"

import { useEffect, useState, useCallback } from "react"
import {
  getAppointments,
  createAppointment,
  deleteAppointment,
} from "@/actions/admin.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { Plus, Trash2, Eye } from "lucide-react"

const statusTabs = ["", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"]

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [meta, setMeta] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusTab, setStatusTab] = useState("")
  const [page, setPage] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [viewAppt, setViewAppt] = useState<any>(null)
  const [form, setForm] = useState({ patientId: "", doctorId: "", date: "", time: "", type: "", reason: "", notes: "" })

  const fetchAppointments = useCallback(async () => {
    setLoading(true)
    const res = await getAppointments({ search, status: statusTab, page, pageSize: 10 })
    if (res.success) { setAppointments(res.data); setMeta(res.meta) }
    setLoading(false)
  }, [search, statusTab, page])

  useEffect(() => { fetchAppointments() }, [fetchAppointments])

  const handleCreate = async () => {
    const res = await createAppointment(form)
    if (res.success) { toast.success("Appointment created"); setDialogOpen(false); fetchAppointments() }
    else toast.error(res.error)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this appointment?")) return
    const res = await deleteAppointment(id)
    if (res.success) { toast.success("Deleted"); fetchAppointments() }
    else toast.error(res.error)
  }

  const statusColor = (s: string) => {
    if (s === "CONFIRMED") return "success"
    if (s === "COMPLETED") return "default"
    if (s === "CANCELLED") return "danger"
    return "warning"
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-semibold text-[#111c2d]">Appointment Management</h1>
        <Button onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4" /> New Appointment</Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {statusTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => { setStatusTab(tab); setPage(1) }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusTab === tab ? "bg-[#003c90] text-white" : "bg-white border border-[#c3c6d5] text-[#434653] hover:bg-[#f0f3ff]"}`}
          >
            {tab || "All"}
          </button>
        ))}
      </div>

      <Input placeholder="Search appointments..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} className="max-w-sm" />

      <div className="bg-white border border-[#c3c6d5] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#f0f3ff]">
              <TableHead className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Patient</TableHead>
              <TableHead className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Doctor</TableHead>
              <TableHead className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Date</TableHead>
              <TableHead className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Time</TableHead>
              <TableHead className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Status</TableHead>
              <TableHead className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-[#434653]">Loading...</TableCell></TableRow>
            ) : appointments.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-[#434653]">No appointments found.</TableCell></TableRow>
            ) : (
              appointments.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="text-sm font-medium text-[#111c2d]">{a.patient?.user?.name}</TableCell>
                  <TableCell className="text-sm text-[#434653]">{a.doctor?.user?.name}</TableCell>
                  <TableCell className="text-sm text-[#434653]">{new Date(a.date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-sm text-[#434653]">{a.time}</TableCell>
                  <TableCell><Badge variant={statusColor(a.status) as any}>{a.status}</Badge></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setViewAppt(a)} className="p-1.5 rounded-lg hover:bg-[#f0f3ff] transition-colors">
                        <Eye className="h-4 w-4 text-[#003c90]" />
                      </button>
                      <button onClick={() => handleDelete(a.id)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        </div>
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-[#434653]">Page {meta.page} of {meta.totalPages}</p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" disabled={!meta.hasPrevious} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <Button variant="secondary" size="sm" disabled={!meta.hasNext} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent onClose={() => setDialogOpen(false)}>
          <DialogHeader><DialogTitle>New Appointment</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input label="Patient ID" value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })} />
            <Input label="Doctor ID" value={form.doctorId} onChange={(e) => setForm({ ...form, doctorId: e.target.value })} />
            <Input label="Date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            <Input label="Time" type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
            <Input label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} />
            <Input label="Reason" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewAppt} onOpenChange={() => setViewAppt(null)}>
        <DialogContent onClose={() => setViewAppt(null)}>
          <DialogHeader><DialogTitle>Appointment Details</DialogTitle></DialogHeader>
          {viewAppt && (
            <div className="space-y-3">
              <div className="flex justify-between"><span className="text-sm text-[#434653]">Patient</span><span className="text-sm font-medium text-[#111c2d]">{viewAppt.patient?.user?.name}</span></div>
              <div className="flex justify-between"><span className="text-sm text-[#434653]">Doctor</span><span className="text-sm font-medium text-[#111c2d]">{viewAppt.doctor?.user?.name}</span></div>
              <div className="flex justify-between"><span className="text-sm text-[#434653]">Date</span><span className="text-sm font-medium text-[#111c2d]">{new Date(viewAppt.date).toLocaleDateString()}</span></div>
              <div className="flex justify-between"><span className="text-sm text-[#434653]">Time</span><span className="text-sm font-medium text-[#111c2d]">{viewAppt.time}</span></div>
              <div className="flex justify-between"><span className="text-sm text-[#434653]">Status</span><Badge variant={statusColor(viewAppt.status) as any}>{viewAppt.status}</Badge></div>
              {viewAppt.reason && <div className="flex justify-between"><span className="text-sm text-[#434653]">Reason</span><span className="text-sm font-medium text-[#111c2d]">{viewAppt.reason}</span></div>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
