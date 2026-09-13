"use client"

import { useEffect, useState } from "react"
import { getReceptionistProfile } from "@/actions/receptionist.actions"

export default function ReceptionistProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getReceptionistProfile().then((data) => { setProfile(data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="space-y-6"><h1 className="text-2xl font-semibold text-[#111c2d]">Profile</h1><div className="bg-white border border-[#c3c6d5] rounded-xl p-6 animate-pulse h-64" /></div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-[#111c2d]">Profile</h1>

      <div className="bg-white border border-[#c3c6d5] rounded-xl p-6">
        <div className="flex items-center gap-6 mb-8">
          <div className="h-20 w-20 rounded-full bg-[#003c90] flex items-center justify-center text-2xl font-bold text-white">
            {profile?.user?.name?.charAt(0)?.toUpperCase() ?? "R"}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-[#111c2d]">{profile?.user?.name}</h2>
            <p className="text-sm text-[#434653]">{profile?.user?.email}</p>
            <span className="inline-block mt-1 px-3 py-1 rounded-full text-[10px] font-bold bg-[#003c90]/10 text-[#003c90]">RECEPTIONIST</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Phone</p>
            <p className="text-sm text-[#111c2d] mt-1">{profile?.user?.phone ?? "Not provided"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Email</p>
            <p className="text-sm text-[#111c2d] mt-1">{profile?.user?.email}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Employee ID</p>
            <p className="text-sm text-[#111c2d] mt-1">{profile?.employeeId ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Department</p>
            <p className="text-sm text-[#111c2d] mt-1">{profile?.department ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Shift</p>
            <p className="text-sm text-[#111c2d] mt-1">{profile?.shift ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Joined</p>
            <p className="text-sm text-[#111c2d] mt-1">
              {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
