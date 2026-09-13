"use client"

import { useEffect, useState, useCallback } from "react"
import { getPatients, createPatient } from "@/actions/receptionist.actions"
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

export default function ReceptionistPatientsPage() {
  const [patients, setPatients] = useState<any[]>([])
  const [meta, setMeta] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    dateOfBirth: "",
    gender: "",
    bloodGroup: "",
    emergencyContact: "",
    emergencyName: "",
    address: "",
    allergies: "",
  })

  const fetchPatients = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getPatients({ search, page, pageSize: 10 })
      setPatients(res.data)
      setMeta(res.meta)
    } catch { /* empty */ }
    setLoading(false)
  }, [search, page])

  useEffect(() => { fetchPatients() }, [fetchPatients])

  const handleCreate = async () => {
    if (!form.name || !form.email) { toast.error("Name and email are required"); return }
    try {
      await createPatient(form)
      toast.success("Patient registered")
      setDialogOpen(false)
      setForm({ name: "", email: "", phone: "", password: "", dateOfBirth: "", gender: "", bloodGroup: "", emergencyContact: "", emergencyName: "", address: "", allergies: "" })
      fetchPatients()
    } catch { toast.error("Failed to register patient") }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-semibold text-[#111c2d]">Patients</h1>
        <Button onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4" /> Register Patient</Button>
      </div>

      <Input placeholder="Search patients..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} className="max-w-xs" />

      <div className="bg-white border border-[#c3c6d5] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#f0f3ff]">
              <TableHead className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Name</TableHead>
              <TableHead className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Email</TableHead>
              <TableHead className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Phone</TableHead>
              <TableHead className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Last Visit</TableHead>
              <TableHead className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-[#434653]">Loading...</TableCell></TableRow>
            ) : patients.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-[#434653]">No patients found.</TableCell></TableRow>
            ) : (
              patients.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-[#f0f3ff] flex items-center justify-center text-xs font-semibold text-[#003c90]">
                        {p.user?.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <p className="text-sm font-medium text-[#111c2d]">{p.user?.name}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-[#434653]">{p.user?.email}</TableCell>
                  <TableCell className="text-sm text-[#434653]">{p.user?.phone ?? "—"}</TableCell>
                  <TableCell className="text-sm text-[#434653]">
                    {p.lastVisit ? new Date(p.lastVisit).toLocaleDateString() : "—"}
                  </TableCell>
                  <TableCell className="text-sm text-[#434653]">{p.lastStatus ?? "New"}</TableCell>
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
          <DialogHeader><DialogTitle>Register Patient</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Input label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Default: default123" />
            <Input label="Date of Birth" type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
            <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="rounded-lg border border-[#c3c6d5] bg-white px-4 py-2.5 text-sm">
              <option value="">Gender</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
            <Input label="Emergency Contact" value={form.emergencyContact} onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })} />
            <Input label="Emergency Name" value={form.emergencyName} onChange={(e) => setForm({ ...form, emergencyName: e.target.value })} />
            <Input label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="col-span-2" />
            <Input label="Allergies" value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })} className="col-span-2" />
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Register</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
