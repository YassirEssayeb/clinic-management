"use client"

import { useEffect, useState, useCallback } from "react"
import {
  getPatients,
  createPatient,
  updatePatient,
  deletePatient,
} from "@/actions/admin.actions"
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
import { Plus, Pencil, Trash2 } from "lucide-react"

export default function AdminPatientsPage() {
  const [patients, setPatients] = useState<any[]>([])
  const [meta, setMeta] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [genderFilter, setGenderFilter] = useState("")
  const [page, setPage] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPatient, setEditingPatient] = useState<any>(null)
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
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
    const res = await getPatients({ search, gender: genderFilter, page, pageSize: 10 })
    if (res.success) { setPatients(res.data); setMeta(res.meta) }
    setLoading(false)
  }, [search, genderFilter, page])

  useEffect(() => { fetchPatients() }, [fetchPatients])

  const openCreate = () => {
    setEditingPatient(null)
    setForm({ name: "", email: "", phone: "", dateOfBirth: "", gender: "", bloodGroup: "", emergencyContact: "", emergencyName: "", address: "", allergies: "" })
    setDialogOpen(true)
  }

  const openEdit = (pat: any) => {
    setEditingPatient(pat)
    setForm({
      name: pat.user?.name ?? "",
      email: pat.user?.email ?? "",
      phone: pat.user?.phone ?? "",
      dateOfBirth: pat.dateOfBirth ? pat.dateOfBirth.split("T")[0] : "",
      gender: pat.gender ?? "",
      bloodGroup: pat.bloodGroup ?? "",
      emergencyContact: pat.emergencyContact ?? "",
      emergencyName: pat.emergencyName ?? "",
      address: pat.address ?? "",
      allergies: pat.allergies ?? "",
    })
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (editingPatient) {
      const res = await updatePatient(editingPatient.id, form)
      if (res.success) { toast.success("Patient updated"); setDialogOpen(false); fetchPatients() }
      else toast.error(res.error)
    } else {
      const res = await createPatient(form)
      if (res.success) { toast.success("Patient created"); setDialogOpen(false); fetchPatients() }
      else toast.error(res.error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this patient?")) return
    const res = await deletePatient(id)
    if (res.success) { toast.success("Patient deleted"); fetchPatients() }
    else toast.error(res.error)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-semibold text-[#111c2d]">Patient Management</h1>
        <Button onClick={openCreate}><Plus className="h-4 w-4" /> Add Patient</Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input placeholder="Search patients..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} className="max-w-xs" />
        <select value={genderFilter} onChange={(e) => { setGenderFilter(e.target.value); setPage(1) }} className="rounded-lg border border-[#c3c6d5] bg-white px-4 py-2.5 text-sm">
          <option value="">All Genders</option>
          <option value="MALE">Male</option>
          <option value="FEMALE">Female</option>
          <option value="OTHER">Other</option>
        </select>
      </div>

      <div className="bg-white border border-[#c3c6d5] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#f0f3ff]">
              <TableHead className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Name</TableHead>
              <TableHead className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Email</TableHead>
              <TableHead className="text-xs font-semibold text-[#434653] uppercase tracking-wider">DOB</TableHead>
              <TableHead className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Gender</TableHead>
              <TableHead className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Blood Group</TableHead>
              <TableHead className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-[#434653]">Loading...</TableCell></TableRow>
            ) : patients.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-[#434653]">No patients found.</TableCell></TableRow>
            ) : (
              patients.map((pat) => (
                <TableRow key={pat.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-[#f0f3ff] flex items-center justify-center text-xs font-semibold text-[#003c90]">
                        {pat.user?.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <p className="text-sm font-medium text-[#111c2d]">{pat.user?.name}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-[#434653]">{pat.user?.email}</TableCell>
                  <TableCell className="text-sm text-[#434653]">
                    {pat.dateOfBirth ? new Date(pat.dateOfBirth).toLocaleDateString() : "—"}
                  </TableCell>
                  <TableCell className="text-sm text-[#434653]">{pat.gender ?? "—"}</TableCell>
                  <TableCell className="text-sm text-[#434653]">{pat.bloodGroup ?? "—"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(pat)} className="p-1.5 rounded-lg hover:bg-[#f0f3ff] transition-colors">
                        <Pencil className="h-4 w-4 text-[#003c90]" />
                      </button>
                      <button onClick={() => handleDelete(pat.id)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
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
          <p className="text-sm text-[#434653]">Page {meta.page} of {meta.totalPages} ({meta.total} total)</p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" disabled={!meta.hasPrevious} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <Button variant="secondary" size="sm" disabled={!meta.hasNext} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent onClose={() => setDialogOpen(false)} className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingPatient ? "Edit Patient" : "Add Patient"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Input label="Date of Birth" type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
            <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="rounded-lg border border-[#c3c6d5] bg-white px-4 py-2.5 text-sm">
              <option value="">Gender</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
            <select value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })} className="rounded-lg border border-[#c3c6d5] bg-white px-4 py-2.5 text-sm">
              <option value="">Blood Group</option>
              <option value="A_POSITIVE">A+</option>
              <option value="A_NEGATIVE">A-</option>
              <option value="B_POSITIVE">B+</option>
              <option value="B_NEGATIVE">B-</option>
              <option value="O_POSITIVE">O+</option>
              <option value="O_NEGATIVE">O-</option>
              <option value="AB_POSITIVE">AB+</option>
              <option value="AB_NEGATIVE">AB-</option>
            </select>
            <Input label="Emergency Contact" value={form.emergencyContact} onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })} />
            <Input label="Emergency Name" value={form.emergencyName} onChange={(e) => setForm({ ...form, emergencyName: e.target.value })} />
            <Input label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="col-span-2" />
            <Input label="Allergies" value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })} className="col-span-2" />
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{editingPatient ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
