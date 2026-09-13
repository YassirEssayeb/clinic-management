"use client"

import { useEffect, useState, useCallback } from "react"
import {
  getDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor,
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
import { Plus, Pencil, Trash2 } from "lucide-react"

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<any[]>([])
  const [meta, setMeta] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [specFilter, setSpecFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [page, setPage] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingDoctor, setEditingDoctor] = useState<any>(null)
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "",
    licenseNumber: "",
    qualification: "",
    experienceYears: 0,
    consultationFee: 0,
    salary: 0,
    bio: "",
  })

  const fetchDoctors = useCallback(async () => {
    setLoading(true)
    const res = await getDoctors({ search, specialization: specFilter, status: statusFilter, page, pageSize: 10 })
    if (res.success) {
      setDoctors(res.data)
      setMeta(res.meta)
    }
    setLoading(false)
  }, [search, specFilter, statusFilter, page])

  useEffect(() => {
    fetchDoctors()
  }, [fetchDoctors])

  const openCreate = () => {
    setEditingDoctor(null)
    setForm({ name: "", email: "", phone: "", specialization: "", licenseNumber: "", qualification: "", experienceYears: 0, consultationFee: 0, salary: 0, bio: "" })
    setDialogOpen(true)
  }

  const openEdit = (doc: any) => {
    setEditingDoctor(doc)
    setForm({
      name: doc.user?.name ?? "",
      email: doc.user?.email ?? "",
      phone: doc.user?.phone ?? "",
      specialization: doc.specialization ?? "",
      licenseNumber: doc.licenseNumber ?? "",
      qualification: doc.qualification ?? "",
      experienceYears: doc.experienceYears ?? 0,
      consultationFee: doc.consultationFee ?? 0,
      salary: doc.salary ?? 0,
      bio: doc.bio ?? "",
    })
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (editingDoctor) {
      const res = await updateDoctor(editingDoctor.id, form)
      if (res.success) { toast.success("Doctor updated"); setDialogOpen(false); fetchDoctors() }
      else toast.error(res.error)
    } else {
      const res = await createDoctor(form)
      if (res.success) { toast.success("Doctor created"); setDialogOpen(false); fetchDoctors() }
      else toast.error(res.error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this doctor?")) return
    const res = await deleteDoctor(id)
    if (res.success) { toast.success("Doctor deleted"); fetchDoctors() }
    else toast.error(res.error)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-semibold text-[#111c2d]">Doctor Management</h1>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add Doctor
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search doctors..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="max-w-xs"
        />
        <select
          value={specFilter}
          onChange={(e) => { setSpecFilter(e.target.value); setPage(1) }}
          className="rounded-lg border border-[#c3c6d5] bg-white px-4 py-2.5 text-sm"
        >
          <option value="">All Specializations</option>
          <option value="Cardiology">Cardiology</option>
          <option value="Dermatology">Dermatology</option>
          <option value="General">General</option>
          <option value="Neurology">Neurology</option>
          <option value="Orthopedics">Orthopedics</option>
          <option value="Pediatrics">Pediatrics</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className="rounded-lg border border-[#c3c6d5] bg-white px-4 py-2.5 text-sm"
        >
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="ON_LEAVE">On Leave</option>
        </select>
      </div>

      <div className="bg-white border border-[#c3c6d5] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#f0f3ff]">
              <TableHead className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Name</TableHead>
              <TableHead className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Specialization</TableHead>
              <TableHead className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Experience</TableHead>
              <TableHead className="text-xs font-semibold text-[#434653] uppercase tracking-wider">License</TableHead>
              <TableHead className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Fee</TableHead>
              <TableHead className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Status</TableHead>
              <TableHead className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-[#434653]">Loading...</TableCell></TableRow>
            ) : doctors.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-[#434653]">No doctors found.</TableCell></TableRow>
            ) : (
              doctors.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-[#f0f3ff] flex items-center justify-center text-xs font-semibold text-[#003c90]">
                        {doc.user?.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#111c2d]">{doc.user?.name}</p>
                        <p className="text-xs text-[#434653]">{doc.user?.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-[#434653]">{doc.specialization}</TableCell>
                  <TableCell className="text-sm text-[#434653]">{doc.experienceYears} yrs</TableCell>
                  <TableCell className="text-sm text-[#434653]">{doc.licenseNumber}</TableCell>
                  <TableCell className="text-sm text-[#434653]">${doc.consultationFee}</TableCell>
                  <TableCell>
                    <Badge variant={doc.status === "ACTIVE" ? "success" : doc.status === "ON_LEAVE" ? "warning" : "danger"}>
                      {doc.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(doc)} className="p-1.5 rounded-lg hover:bg-[#f0f3ff] transition-colors">
                        <Pencil className="h-4 w-4 text-[#003c90]" />
                      </button>
                      <button onClick={() => handleDelete(doc.id)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
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
          <p className="text-sm text-[#434653]">
            Page {meta.page} of {meta.totalPages} ({meta.total} total)
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" disabled={!meta.hasPrevious} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button variant="secondary" size="sm" disabled={!meta.hasNext} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent onClose={() => setDialogOpen(false)} className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingDoctor ? "Edit Doctor" : "Add Doctor"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Input label="Specialization" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} />
            <Input label="License Number" value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} />
            <Input label="Qualification" value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} />
            <Input label="Experience (Years)" type="number" value={form.experienceYears} onChange={(e) => setForm({ ...form, experienceYears: +e.target.value })} />
            <Input label="Consultation Fee ($)" type="number" value={form.consultationFee} onChange={(e) => setForm({ ...form, consultationFee: +e.target.value })} />
            <Input label="Salary ($)" type="number" value={form.salary} onChange={(e) => setForm({ ...form, salary: +e.target.value })} />
            <Input label="Bio" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="col-span-2" />
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{editingDoctor ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
