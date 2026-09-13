"use client"

import { useEffect, useState, useCallback } from "react"
import { getMyInvoices } from "@/actions/patient.actions"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function PatientInvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([])
  const [meta, setMeta] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  const fetchInvoices = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getMyInvoices({ page, pageSize: 10 })
      setInvoices(res.data)
      setMeta(res.meta)
    } catch { /* empty */ }
    setLoading(false)
  }, [page])

  useEffect(() => { fetchInvoices() }, [fetchInvoices])

  const statusColor = (s: string) => {
    if (s === "PAID") return "success"
    if (s === "PARTIAL") return "warning"
    return "danger"
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-[#111c2d]">Invoices</h1>

      <div className="bg-white border border-[#c3c6d5] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#f0f3ff]">
              <TableHead className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Invoice #</TableHead>
              <TableHead className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Doctor</TableHead>
              <TableHead className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Total</TableHead>
              <TableHead className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Status</TableHead>
              <TableHead className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Date</TableHead>
              <TableHead className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Payments</TableHead>
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
                  <TableCell className="text-sm text-[#434653]">Dr. {inv.doctor?.user?.name}</TableCell>
                  <TableCell className="text-sm font-medium text-[#111c2d]">${inv.total?.toLocaleString()}</TableCell>
                  <TableCell><Badge variant={statusColor(inv.status) as any}>{inv.status}</Badge></TableCell>
                  <TableCell className="text-sm text-[#434653]">
                    {inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : "—"}
                  </TableCell>
                  <TableCell className="text-sm text-[#434653]">{inv.payments?.length ?? 0}</TableCell>
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
    </div>
  )
}
