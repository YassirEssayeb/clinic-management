"use client"

import { useEffect, useState } from "react"
import { getPatientProfile } from "@/actions/patient.actions"

export default function PatientProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPatientProfile().then((data) => { setProfile(data); setLoading(false) }).catch(() => setLoading(false))
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
            {profile?.user?.name?.charAt(0)?.toUpperCase() ?? "P"}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-[#111c2d]">{profile?.user?.name}</h2>
            <p className="text-sm text-[#434653]">{profile?.user?.email}</p>
            <span className="inline-block mt-1 px-3 py-1 rounded-full text-[10px] font-bold bg-[#003c90]/10 text-[#003c90]">PATIENT</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Phone</p>
            <p className="text-sm text-[#111c2d] mt-1">{profile?.user?.phone ?? "Not provided"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Date of Birth</p>
            <p className="text-sm text-[#111c2d] mt-1">{profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : "—"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Gender</p>
            <p className="text-sm text-[#111c2d] mt-1">{profile?.gender ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Blood Group</p>
            <p className="text-sm text-[#111c2d] mt-1">{profile?.bloodGroup ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Address</p>
            <p className="text-sm text-[#111c2d] mt-1">{profile?.address ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Emergency Contact</p>
            <p className="text-sm text-[#111c2d] mt-1">{profile?.emergencyName ? `${profile.emergencyName} (${profile.emergencyContact})` : "—"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Insurance</p>
            <p className="text-sm text-[#111c2d] mt-1">{profile?.insuranceProvider ? `${profile.insuranceProvider} (${profile.insuranceNumber})` : "—"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-[#434653] uppercase tracking-wider">Allergies</p>
            <p className="text-sm text-[#111c2d] mt-1">{profile?.allergies ?? "None"}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
