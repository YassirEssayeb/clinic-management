"use client"

import { useEffect, useState, useCallback } from "react"
import { getMedicalRecords, createMedicalRecord, updateMedicalRecord } from "@/actions/admin.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Plus, Pencil } from "lucide-react"

export default function AdminMedicalRecordsPage() {
  const [records, setRecords] = useState<any[]>([])
  const [meta, setMeta] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [patientId, setPatientId] = useState("")
  const [doctorId, setDoctorId] = useState("")
  const [page, setPage] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ patientId: "", doctorId: "", diagnosis: "", symptoms: "", treatment: "", notes: "", visitDate: "", followUpDate: "" })

  const fetchRecords = useCallback(async () => {
    setLoading(true)
    const res = await getMedicalRecords({ search, patientId, doctorId, page, pageSize: 10 })
    if (res.success) { setRecords(res.data); setMeta(res.meta) }
    setLoading(false)
  }, [search, patientId, doctorId, page])

  useEffect(() => { fetchRecords() }, [fetchRecords])

  const openCreate = () => { setEditing(null); setForm({ patientId: "", doctorId: "", diagnosis: "", symptoms: "", treatment: "", notes: "", visitDate: "", followUpDate: "" }); setDialogOpen(true) }

  const openEdit = (r: any) => {
    setEditing(r)
    setForm({ patientId: r.patientId, doctorId: r.doctorId, diagnosis: r.diagnosis ?? "", symptoms: r.symptoms ?? "", treatment: r.treatment ?? "", notes: r.notes ?? "", visitDate: r.visitDate ? r.visitDate.split("T")[0] : "", followUpDate: r.followUpDate ? r.followUpDate.split("T")[0] : "" })
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (editing) {
      const res = await updateMedicalRecord(editing.id, { diagnosis: form.diagnosis, symptoms: form.symptoms, treatment: form.treatment, notes: form.notes, followUpDate: form.followUpDate || undefined })
      if (res.success) { toast.success("Record updated"); setDialogOpen(false); fetchRecords() }
      else toast.error(res.error || "Failed")
    } else {
      const res = await createMedicalRecord(form)
      if (res.success) { toast.success("Record created"); setDialogOpen(false); fetchRecords() }
      else toast.error(res.error || "Failed")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-semibold text-[#111c2d]">Medical Records</h1>
        <Button onClick={openCreate}><Plus className="h-4 w-4" /> New Record</Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input placeholder="Search..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} className="max-w-xs" />
        <Input placeholder="Patient ID" value={patientId} onChange={(e) => { setPatientId(e.target.value); setPage(1) }} className="max-w-xs" />
        <Input placeholder="Doctor ID" value={doctorId} onChange={(e) => { setDoctorId(e.target.value); setPage(1) }} className="max-w-xs" />
      </div>

      <div className="bg-white border border-[#c3c6d5] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#f0f3ff]">
              <TableHead className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Diagnosis</TableHead>
              <TableHead className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Patient</TableHead>
              <TableHead className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Doctor</TableHead>
              <TableHead className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Visit Date</TableHead>
              <TableHead className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-[#434653]">Loading...</TableCell></TableRow>
            ) : records.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-[#434653]">No records found.</TableCell></TableRow>
            ) : (
              records.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="text-sm font-medium text-[#111c2d]">{r.diagnosis ?? "—"}</TableCell>
                  <TableCell className="text-sm text-[#434653]">{r.patient?.user?.name}</TableCell>
                  <TableCell className="text-sm text-[#434653]">{r.doctor?.user?.name}</TableCell>
                  <TableCell className="text-sm text-[#434653]">{r.visitDate ? new Date(r.visitDate).toLocaleDateString() : "—"}</TableCell>
                  <TableCell>
                    <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg hover:bg-[#f0f3ff] transition-colors">
                      <Pencil className="h-4 w-4 text-[#003c90]" />
                    </button>
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
        <DialogContent onClose={() => setDialogOpen(false)} className="max-w-2xl">
          <DialogHeader><DialogTitle>{editing ? "Edit Record" : "New Medical Record"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {!editing && <Input label="Patient ID" value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })} />}
            {!editing && <Input label="Doctor ID" value={form.doctorId} onChange={(e) => setForm({ ...form, doctorId: e.target.value })} />}
            <Input label="Diagnosis" value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} className="col-span-2" />
            <Input label="Symptoms" value={form.symptoms} onChange={(e) => setForm({ ...form, symptoms: e.target.value })} className="col-span-2" />
            <Input label="Treatment" value={form.treatment} onChange={(e) => setForm({ ...form, treatment: e.target.value })} className="col-span-2" />
            <Input label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="col-span-2" />
            <Input label="Visit Date" type="date" value={form.visitDate} onChange={(e) => setForm({ ...form, visitDate: e.target.value })} />
            <Input label="Follow-up Date" type="date" value={form.followUpDate} onChange={(e) => setForm({ ...form, followUpDate: e.target.value })} />
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{editing ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
