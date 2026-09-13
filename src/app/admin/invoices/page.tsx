"use client"

import { useEffect, useState, useCallback } from "react"
import { getInvoices, createInvoice, updateInvoiceStatus } from "@/actions/admin.actions"
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

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([])
  const [meta, setMeta] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [page, setPage] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({ patientId: "", doctorId: "", total: 0, consultationFee: 0, medicineFee: 0, labFee: 0, otherFee: 0, discount: 0, tax: 0, dueDate: "", notes: "" })

  const fetchInvoices = useCallback(async () => {
    setLoading(true)
    const res = await getInvoices({ search, status: statusFilter, page, pageSize: 10 })
    if (res.success) { setInvoices(res.data); setMeta(res.meta) }
    setLoading(false)
  }, [search, statusFilter, page])

  useEffect(() => { fetchInvoices() }, [fetchInvoices])

  const handleCreate = async () => {
    const res = await createInvoice(form)
    if (res.success) { toast.success("Invoice created"); setDialogOpen(false); fetchInvoices() }
    else toast.error(res.error)
  }

  const handleStatus = async (id: string, status: string) => {
    const res = await updateInvoiceStatus(id, status)
    if (res.success) { toast.success("Status updated"); fetchInvoices() }
    else toast.error(res.error)
  }

  const statusColor = (s: string) => {
    if (s === "PAID") return "success"
    if (s === "PARTIAL") return "warning"
    return "danger"
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-semibold text-[#111c2d]">Invoices</h1>
        <Button onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4" /> New Invoice</Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input placeholder="Search invoices..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} className="max-w-xs" />
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }} className="rounded-lg border border-[#c3c6d5] bg-white px-4 py-2.5 text-sm">
          <option value="">All Status</option>
          <option value="PAID">Paid</option>
          <option value="UNPAID">Unpaid</option>
          <option value="PARTIAL">Partial</option>
          <option value="OVERDUE">Overdue</option>
        </select>
      </div>

      <div className="bg-white border border-[#c3c6d5] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#f0f3ff]">
              <TableHead className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Invoice #</TableHead>
              <TableHead className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Patient</TableHead>
              <TableHead className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Doctor</TableHead>
              <TableHead className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Total</TableHead>
              <TableHead className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Status</TableHead>
              <TableHead className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-[#434653]">Loading...</TableCell></TableRow>
            ) : invoices.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-[#434653]">No invoices found.</TableCell></TableRow>
            ) : (
              invoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="text-sm font-medium text-[#003c90]">{inv.invoiceNumber}</TableCell>
                  <TableCell className="text-sm text-[#434653]">{inv.patient?.user?.name}</TableCell>
                  <TableCell className="text-sm text-[#434653]">{inv.doctor?.user?.name}</TableCell>
                  <TableCell className="text-sm font-medium text-[#111c2d]">${inv.total?.toLocaleString()}</TableCell>
                  <TableCell><Badge variant={statusColor(inv.status) as any}>{inv.status}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {inv.status !== "PAID" && (
                        <button onClick={() => handleStatus(inv.id, "PAID")} className="text-xs text-green-600 hover:underline">Mark Paid</button>
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
        <DialogContent onClose={() => setDialogOpen(false)} className="max-w-2xl">
          <DialogHeader><DialogTitle>New Invoice</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Patient ID" value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })} />
            <Input label="Doctor ID" value={form.doctorId} onChange={(e) => setForm({ ...form, doctorId: e.target.value })} />
            <Input label="Consultation Fee" type="number" value={form.consultationFee} onChange={(e) => setForm({ ...form, consultationFee: +e.target.value })} />
            <Input label="Medicine Fee" type="number" value={form.medicineFee} onChange={(e) => setForm({ ...form, medicineFee: +e.target.value })} />
            <Input label="Lab Fee" type="number" value={form.labFee} onChange={(e) => setForm({ ...form, labFee: +e.target.value })} />
            <Input label="Other Fee" type="number" value={form.otherFee} onChange={(e) => setForm({ ...form, otherFee: +e.target.value })} />
            <Input label="Discount" type="number" value={form.discount} onChange={(e) => setForm({ ...form, discount: +e.target.value })} />
            <Input label="Tax" type="number" value={form.tax} onChange={(e) => setForm({ ...form, tax: +e.target.value })} />
            <Input label="Total" type="number" value={form.total} onChange={(e) => setForm({ ...form, total: +e.target.value })} />
            <Input label="Due Date" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
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
