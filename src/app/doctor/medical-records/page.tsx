"use client"

import { useEffect, useState, useCallback } from "react"
import { getMedicalRecords as getDocRecords, createMedicalRecord as createDocRecord, getMyPatients } from "@/actions/doctor.actions"
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
import { Plus } from "lucide-react"

export default function DoctorMedicalRecordsPage() {
  const [records, setRecords] = useState<any[]>([])
  const [patients, setPatients] = useState<any[]>([])
  const [meta, setMeta] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({ patientId: "", diagnosis: "", symptoms: "", treatment: "", notes: "", visitDate: "", followUpDate: "" })

  const fetchRecords = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getDocRecords({ search, page, pageSize: 10 })
      setRecords(res.data)
      setMeta(res.meta)
    } catch { /* empty */ }
    setLoading(false)
  }, [search, page])

  const fetchPatients = useCallback(async () => {
    try {
      const res = await getMyPatients({ pageSize: 100 })
      setPatients(res.data)
    } catch { /* empty */ }
  }, [])

  useEffect(() => { fetchRecords(); fetchPatients() }, [fetchRecords, fetchPatients])

  const handleCreate = async () => {
    if (!form.patientId) { toast.error("Select a patient"); return }
    try {
      await createDocRecord(form)
      toast.success("Record created")
      setDialogOpen(false)
      setForm({ patientId: "", diagnosis: "", symptoms: "", treatment: "", notes: "", visitDate: "", followUpDate: "" })
      fetchRecords()
    } catch { toast.error("Failed to create record") }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-semibold text-[#111c2d]">Medical Records</h1>
        <Button onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4" /> New Record</Button>
      </div>

      <Input placeholder="Search records..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} className="max-w-xs" />

      <div className="bg-white border border-[#c3c6d5] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#f0f3ff]">
              <TableHead className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Diagnosis</TableHead>
              <TableHead className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Patient</TableHead>
              <TableHead className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Visit Date</TableHead>
              <TableHead className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Prescriptions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-[#434653]">Loading...</TableCell></TableRow>
            ) : records.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-[#434653]">No records found.</TableCell></TableRow>
            ) : (
              records.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="text-sm font-medium text-[#111c2d]">{r.diagnosis ?? "—"}</TableCell>
                  <TableCell className="text-sm text-[#434653]">{r.patient?.user?.name}</TableCell>
                  <TableCell className="text-sm text-[#434653]">
                    {r.visitDate ? new Date(r.visitDate).toLocaleDateString() : "—"}
                  </TableCell>
                  <TableCell className="text-sm text-[#434653]">
                    {(r.prescriptions ?? []).map((p: any) => p.medicineName).join(", ") || "—"}
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
          <DialogHeader><DialogTitle>New Medical Record</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-sm font-medium text-[#111c2d]">Patient</label>
              <select
                value={form.patientId}
                onChange={(e) => setForm({ ...form, patientId: e.target.value })}
                className="w-full mt-1 rounded-lg border border-[#c3c6d5] bg-white px-4 py-2.5 text-sm"
              >
                <option value="">Select patient...</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>{p.user?.name}</option>
                ))}
              </select>
            </div>
            <Input label="Diagnosis" value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} className="col-span-2" />
            <Input label="Symptoms" value={form.symptoms} onChange={(e) => setForm({ ...form, symptoms: e.target.value })} className="col-span-2" />
            <Input label="Treatment" value={form.treatment} onChange={(e) => setForm({ ...form, treatment: e.target.value })} className="col-span-2" />
            <Input label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="col-span-2" />
            <Input label="Visit Date" type="date" value={form.visitDate} onChange={(e) => setForm({ ...form, visitDate: e.target.value })} />
            <Input label="Follow-up Date" type="date" value={form.followUpDate} onChange={(e) => setForm({ ...form, followUpDate: e.target.value })} />
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
