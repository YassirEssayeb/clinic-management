"use client"

import { useEffect, useState, useCallback } from "react"
import { getPrescriptions } from "@/actions/admin.actions"
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

export default function AdminPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const [meta, setMeta] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [patientId, setPatientId] = useState("")
  const [page, setPage] = useState(1)

  const fetchPrescriptions = useCallback(async () => {
    setLoading(true)
    const res = await getPrescriptions({ search, patientId, page, pageSize: 10 })
    if (res.success) { setPrescriptions(res.data); setMeta(res.meta) }
    setLoading(false)
  }, [search, patientId, page])

  useEffect(() => { fetchPrescriptions() }, [fetchPrescriptions])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-[#111c2d]">Prescriptions</h1>

      <div className="flex flex-wrap gap-3">
        <Input placeholder="Search medicines..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} className="max-w-xs" />
        <Input placeholder="Patient ID" value={patientId} onChange={(e) => { setPatientId(e.target.value); setPage(1) }} className="max-w-xs" />
      </div>

      <div className="bg-white border border-[#c3c6d5] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#f0f3ff]">
              <TableHead className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Medicine</TableHead>
              <TableHead className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Patient</TableHead>
              <TableHead className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Doctor</TableHead>
              <TableHead className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Dosage</TableHead>
              <TableHead className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-[#434653]">Loading...</TableCell></TableRow>
            ) : prescriptions.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-[#434653]">No prescriptions found.</TableCell></TableRow>
            ) : (
              prescriptions.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="text-sm font-medium text-[#111c2d]">{p.medicineName}</TableCell>
                  <TableCell className="text-sm text-[#434653]">{p.patient?.user?.name}</TableCell>
                  <TableCell className="text-sm text-[#434653]">{p.doctor?.user?.name}</TableCell>
                  <TableCell className="text-sm text-[#434653]">{p.dosage} — {p.frequency}</TableCell>
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
    </div>
  )
}
