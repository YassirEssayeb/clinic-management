"use client"

import { useEffect, useState, useCallback } from "react"
import { getPayments, createPayment } from "@/actions/admin.actions"
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

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([])
  const [meta, setMeta] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [methodFilter, setMethodFilter] = useState("")
  const [page, setPage] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({ invoiceId: "", amount: 0, method: "CASH", transactionId: "", notes: "" })

  const fetchPayments = useCallback(async () => {
    setLoading(true)
    const res = await getPayments({ search, status: statusFilter, method: methodFilter, page, pageSize: 10 })
    if (res.success) { setPayments(res.data); setMeta(res.meta) }
    setLoading(false)
  }, [search, statusFilter, methodFilter, page])

  useEffect(() => { fetchPayments() }, [fetchPayments])

  const handleCreate = async () => {
    const res = await createPayment(form)
    if (res.success) { toast.success("Payment recorded"); setDialogOpen(false); fetchPayments() }
    else toast.error(res.error)
  }

  const statusColor = (s: string) => {
    if (s === "PAID") return "success"
    if (s === "PENDING") return "warning"
    return "danger"
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-semibold text-[#111c2d]">Payments</h1>
        <Button onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4" /> Record Payment</Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input placeholder="Search by invoice..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} className="max-w-xs" />
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }} className="rounded-lg border border-[#c3c6d5] bg-white px-4 py-2.5 text-sm">
          <option value="">All Status</option>
          <option value="PAID">Paid</option>
          <option value="PENDING">Pending</option>
          <option value="FAILED">Failed</option>
          <option value="REFUNDED">Refunded</option>
        </select>
        <select value={methodFilter} onChange={(e) => { setMethodFilter(e.target.value); setPage(1) }} className="rounded-lg border border-[#c3c6d5] bg-white px-4 py-2.5 text-sm">
          <option value="">All Methods</option>
          <option value="CASH">Cash</option>
          <option value="CARD">Card</option>
          <option value="BANK_TRANSFER">Bank Transfer</option>
          <option value="INSURANCE">Insurance</option>
        </select>
      </div>

      <div className="bg-white border border-[#c3c6d5] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#f0f3ff]">
              <TableHead className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Invoice</TableHead>
              <TableHead className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Patient</TableHead>
              <TableHead className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Amount</TableHead>
              <TableHead className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Method</TableHead>
              <TableHead className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Status</TableHead>
              <TableHead className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-[#434653]">Loading...</TableCell></TableRow>
            ) : payments.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-[#434653]">No payments found.</TableCell></TableRow>
            ) : (
              payments.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="text-sm text-[#003c90] font-medium">{p.invoice?.invoiceNumber}</TableCell>
                  <TableCell className="text-sm text-[#434653]">{p.invoice?.patient?.user?.name}</TableCell>
                  <TableCell className="text-sm font-medium text-[#111c2d]">${p.amount?.toLocaleString()}</TableCell>
                  <TableCell className="text-sm text-[#434653]">{p.method}</TableCell>
                  <TableCell><Badge variant={statusColor(p.status) as any}>{p.status}</Badge></TableCell>
                  <TableCell className="text-sm text-[#434653]">
                    {p.paidAt ? new Date(p.paidAt).toLocaleDateString() : "—"}
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
          <DialogHeader><DialogTitle>Record Payment</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input label="Invoice ID" value={form.invoiceId} onChange={(e) => setForm({ ...form, invoiceId: e.target.value })} />
            <Input label="Amount" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: +e.target.value })} />
            <select value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })} className="w-full rounded-lg border border-[#c3c6d5] bg-white px-4 py-2.5 text-sm">
              <option value="CASH">Cash</option>
              <option value="CARD">Card</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="INSURANCE">Insurance</option>
            </select>
            <Input label="Transaction ID" value={form.transactionId} onChange={(e) => setForm({ ...form, transactionId: e.target.value })} />
            <Input label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Record</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
