"use client"

import { useEffect, useState, useCallback } from "react"
import { getMyMedicalRecords } from "@/actions/patient.actions"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function PatientMedicalRecordsPage() {
  const [records, setRecords] = useState<any[]>([])
  const [meta, setMeta] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  const fetchRecords = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getMyMedicalRecords({ page, pageSize: 10 })
      setRecords(res.data)
      setMeta(res.meta)
    } catch { /* empty */ }
    setLoading(false)
  }, [page])

  useEffect(() => { fetchRecords() }, [fetchRecords])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-[#111c2d]">Medical Records</h1>

      <div className="bg-white border border-[#c3c6d5] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#f0f3ff]">
              <TableHead className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Diagnosis</TableHead>
              <TableHead className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Doctor</TableHead>
              <TableHead className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Visit Date</TableHead>
              <TableHead className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Prescriptions</TableHead>
              <TableHead className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Lab Results</TableHead>
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
                  <TableCell className="text-sm text-[#434653]">Dr. {r.doctor?.user?.name}</TableCell>
                  <TableCell className="text-sm text-[#434653]">
                    {r.visitDate ? new Date(r.visitDate).toLocaleDateString() : "—"}
                  </TableCell>
                  <TableCell className="text-sm text-[#434653]">
                    {(r.prescriptions ?? []).length > 0
                      ? (r.prescriptions as any[]).map((p: any) => `${p.medicineName} (${p.dosage})`).join(", ")
                      : "—"}
                  </TableCell>
                  <TableCell className="text-sm text-[#434653]">
                    {(r.labResults ?? []).length > 0 ? `${(r.labResults as any[]).length} result(s)` : "—"}
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
