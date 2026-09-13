"use client"

import { useEffect, useState, useCallback } from "react"
import { getMyPatients } from "@/actions/doctor.actions"
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

export default function DoctorPatientsPage() {
  const [patients, setPatients] = useState<any[]>([])
  const [meta, setMeta] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  const fetchPatients = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getMyPatients({ search, page, pageSize: 10 })
      setPatients(res.data)
      setMeta(res.meta)
    } catch { /* empty */ }
    setLoading(false)
  }, [search, page])

  useEffect(() => { fetchPatients() }, [fetchPatients])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-[#111c2d]">My Patients</h1>

      <Input placeholder="Search patients..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} className="max-w-xs" />

      <div className="bg-white border border-[#c3c6d5] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#f0f3ff]">
              <TableHead className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Name</TableHead>
              <TableHead className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Email</TableHead>
              <TableHead className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Last Visit</TableHead>
              <TableHead className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-[#434653]">Loading...</TableCell></TableRow>
            ) : patients.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-[#434653]">No patients found.</TableCell></TableRow>
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
                  <TableCell className="text-sm text-[#434653]">
                    {p.lastVisit ? new Date(p.lastVisit).toLocaleDateString() : "—"}
                  </TableCell>
                  <TableCell className="text-sm text-[#434653]">{p.lastStatus ?? "—"}</TableCell>
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
