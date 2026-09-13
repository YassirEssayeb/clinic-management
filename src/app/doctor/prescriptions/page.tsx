"use client"

import { useEffect, useState, useCallback } from "react"
import { getMyPrescriptions, createPrescription as createDocPrescription } from "@/actions/doctor.actions"
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

export default function DoctorPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const [meta, setMeta] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({ medicalRecordId: "", patientId: "", medicineName: "", dosage: "", frequency: "", duration: "", instructions: "", notes: "" })

  const fetchPrescriptions = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getMyPrescriptions({ page, pageSize: 10 })
      setPrescriptions(res.data)
      setMeta(res.meta)
    } catch { /* empty */ }
    setLoading(false)
  }, [page])

  useEffect(() => { fetchPrescriptions() }, [fetchPrescriptions])

  const handleCreate = async () => {
    if (!form.patientId || !form.medicineName) { toast.error("Fill required fields"); return }
    try {
      await createDocPrescription(form)
      toast.success("Prescription created")
      setDialogOpen(false)
      setForm({ medicalRecordId: "", patientId: "", medicineName: "", dosage: "", frequency: "", duration: "", instructions: "", notes: "" })
      fetchPrescriptions()
    } catch { toast.error("Failed") }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-semibold text-[#111c2d]">Prescriptions</h1>
        <Button onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4" /> New Prescription</Button>
      </div>

      <div className="bg-white border border-[#c3c6d5] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#f0f3ff]">
              <TableHead className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Medicine</TableHead>
              <TableHead className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Patient</TableHead>
              <TableHead className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Dosage</TableHead>
              <TableHead className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Frequency</TableHead>
              <TableHead className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Duration</TableHead>
              <TableHead className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-[#434653]">Loading...</TableCell></TableRow>
            ) : prescriptions.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-[#434653]">No prescriptions found.</TableCell></TableRow>
            ) : (
              prescriptions.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="text-sm font-medium text-[#111c2d]">{p.medicineName}</TableCell>
                  <TableCell className="text-sm text-[#434653]">{p.patient?.user?.name}</TableCell>
                  <TableCell className="text-sm text-[#434653]">{p.dosage}</TableCell>
                  <TableCell className="text-sm text-[#434653]">{p.frequency}</TableCell>
                  <TableCell className="text-sm text-[#434653]">{p.duration}</TableCell>
                  <TableCell className="text-sm text-[#434653]">
                    {p.datePrescribed ? new Date(p.datePrescribed).toLocaleDateString() : "—"}
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
          <DialogHeader><DialogTitle>New Prescription</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input label="Medical Record ID" value={form.medicalRecordId} onChange={(e) => setForm({ ...form, medicalRecordId: e.target.value })} />
            <Input label="Patient ID" value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })} />
            <Input label="Medicine Name" value={form.medicineName} onChange={(e) => setForm({ ...form, medicineName: e.target.value })} />
            <Input label="Dosage" value={form.dosage} onChange={(e) => setForm({ ...form, dosage: e.target.value })} />
            <Input label="Frequency" value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} />
            <Input label="Duration" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
            <Input label="Instructions" value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} />
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
