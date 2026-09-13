"use client"

import { useEffect, useState, useCallback } from "react"
import { getMyAppointments, bookAppointment, getAvailableDoctors } from "@/actions/patient.actions"
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

export default function PatientAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [meta, setMeta] = useState<any>(null)
  const [doctors, setDoctors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({ doctorId: "", date: "", time: "", type: "", reason: "" })

  const fetchAppointments = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getMyAppointments({ page, pageSize: 10 })
      setAppointments(res.data)
      setMeta(res.meta)
    } catch { /* empty */ }
    setLoading(false)
  }, [page])

  useEffect(() => { fetchAppointments() }, [fetchAppointments])

  const openBook = async () => {
    const docs = await getAvailableDoctors()
    setDoctors(docs)
    setDialogOpen(true)
  }

  const handleBook = async () => {
    if (!form.doctorId || !form.date || !form.time) { toast.error("Fill required fields"); return }
    try {
      await bookAppointment(form)
      toast.success("Appointment booked")
      setDialogOpen(false)
      setForm({ doctorId: "", date: "", time: "", type: "", reason: "" })
      fetchAppointments()
    } catch { toast.error("Failed to book") }
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
        <h1 className="text-xl sm:text-2xl font-semibold text-[#111c2d]">My Appointments</h1>
        <Button onClick={openBook}><Plus className="h-4 w-4" /> Book Appointment</Button>
      </div>

      <div className="bg-white border border-[#c3c6d5] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#f0f3ff]">
              <TableHead className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Doctor</TableHead>
              <TableHead className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Date</TableHead>
              <TableHead className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Time</TableHead>
              <TableHead className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Type</TableHead>
              <TableHead className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-[#434653]">Loading...</TableCell></TableRow>
            ) : appointments.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-[#434653]">No appointments yet.</TableCell></TableRow>
            ) : (
              appointments.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="text-sm font-medium text-[#111c2d]">Dr. {a.doctor?.user?.name}</TableCell>
                  <TableCell className="text-sm text-[#434653]">{new Date(a.date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-sm text-[#434653]">{a.time}</TableCell>
                  <TableCell className="text-sm text-[#434653]">{a.type ?? "—"}</TableCell>
                  <TableCell><Badge variant={statusColor(a.status) as any}>{a.status}</Badge></TableCell>
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
          <DialogHeader><DialogTitle>Book Appointment</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[#111c2d]">Doctor</label>
              <select
                value={form.doctorId}
                onChange={(e) => setForm({ ...form, doctorId: e.target.value })}
                className="w-full mt-1 rounded-lg border border-[#c3c6d5] bg-white px-4 py-2.5 text-sm"
              >
                <option value="">Select doctor...</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>Dr. {d.user?.name} ({d.specialization})</option>
                ))}
              </select>
            </div>
            <Input label="Date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            <Input label="Time" type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
            <Input label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} placeholder="e.g. Checkup" />
            <Input label="Reason" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Brief reason..." />
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleBook}>Book</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
