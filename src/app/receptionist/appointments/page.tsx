"use client"

import { useEffect, useState, useCallback } from "react"
import {
  getAppointments,
  createAppointment,
  updateAppointmentStatus,
} from "@/actions/receptionist.actions"
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
import { Plus } from "lucide-react"

export default function ReceptionistAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [meta, setMeta] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [page, setPage] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({ patientId: "", doctorId: "", date: "", time: "", type: "", reason: "", notes: "" })

  const fetchAppointments = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getAppointments({ search, status: statusFilter, page, pageSize: 10 })
      setAppointments(res.data)
      setMeta(res.meta)
    } catch { /* empty */ }
    setLoading(false)
  }, [search, statusFilter, page])

  useEffect(() => { fetchAppointments() }, [fetchAppointments])

  const handleCreate = async () => {
    if (!form.patientId || !form.doctorId || !form.date || !form.time) { toast.error("Fill required fields"); return }
    try {
      await createAppointment(form)
      toast.success("Appointment created")
      setDialogOpen(false)
      setForm({ patientId: "", doctorId: "", date: "", time: "", type: "", reason: "", notes: "" })
      fetchAppointments()
    } catch { toast.error("Failed") }
  }

  const handleStatus = async (id: string, status: "CONFIRMED" | "COMPLETED" | "CANCELLED") => {
    try {
      await updateAppointmentStatus(id, status)
      toast.success(`Appointment ${status.toLowerCase()}`)
      fetchAppointments()
    } catch { toast.error("Failed") }
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
        <h1 className="text-xl sm:text-2xl font-semibold text-[#111c2d]">Manage Appointments</h1>
        <Button onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4" /> New Appointment</Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input placeholder="Search..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} className="max-w-xs" />
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }} className="rounded-lg border border-[#c3c6d5] bg-white px-4 py-2.5 text-sm">
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

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
                  <TableCell className="text-sm text-[#434653]">Dr. {a.doctor?.user?.name}</TableCell>
                  <TableCell className="text-sm text-[#434653]">{new Date(a.date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-sm text-[#434653]">{a.time}</TableCell>
                  <TableCell><Badge variant={statusColor(a.status) as any}>{a.status}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {a.status === "PENDING" && (
                        <button onClick={() => handleStatus(a.id, "CONFIRMED")} className="text-xs text-green-600 hover:underline">Confirm</button>
                      )}
                      {(a.status === "CONFIRMED" || a.status === "PENDING") && (
                        <button onClick={() => handleStatus(a.id, "COMPLETED")} className="text-xs text-blue-600 hover:underline">Complete</button>
                      )}
                      {a.status !== "CANCELLED" && a.status !== "COMPLETED" && (
                        <button onClick={() => handleStatus(a.id, "CANCELLED")} className="text-xs text-red-600 hover:underline">Cancel</button>
                      )}
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
    </div>
  )
}
